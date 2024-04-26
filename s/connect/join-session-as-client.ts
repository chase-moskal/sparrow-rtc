
import {queue} from "../toolbox/queue.js"
import {ClientState, HandleJoin, JoinerControls} from "../types.js"
import {simplestate} from "../toolbox/simplestate.js"
import {connectToSignalServer} from "./utils/connect-to-signal-server.js"

export async function joinSessionAsClient({
		signalServerUrl,
		sessionId,
		rtcConfig,
		handleJoin,
		onStateChange,
	}: {
		signalServerUrl: string
		sessionId: string
		rtcConfig: RTCConfiguration
		handleJoin: HandleJoin
		onStateChange(state: ClientState): void
	}) {

	const simple = simplestate<ClientState>({
		state: {
			clientId: undefined,
			sessionInfo: undefined,
		},
		render: onStateChange,
	})

	const peer = new RTCPeerConnection(rtcConfig)

	const connection = await connectToSignalServer({
		url: signalServerUrl,
		client: {
			async handleIceCandidates(candidates) {
				for (const candidate of candidates)
					await peer.addIceCandidate(candidate)
			},
		},
	})

	const iceQueue = queue(
		async(candidates: any[]) => await connection.signalServer.connecting
			.submitIceCandidates(sessionId, simple.state.clientId!, candidates)
	)

	peer.onicecandidate = event => {
		const candidate = event.candidate
		if (candidate) {
			iceQueue.add(candidate)
		}
	}

	const joined = await connection.signalServer.connecting.joinSession(sessionId)
	if (!joined)
		throw new Error("failed to join session")

	const {clientId, sessionInfo} = joined

	const pendingJoin = (() => {
		let resolve: (controls: JoinerControls) => void = () => {}
		let reject: (error: any) => void = () => {}
		const promise = new Promise<JoinerControls>((res, rej) => {
			resolve = res
			reject = rej
		})
		return {promise, resolve, reject}
	})()

	peer.ondatachannel = event => {
		const channel = event.channel
		function kill() {
			channel.close()
			peer.close()
			simple.state = {clientId: undefined, sessionInfo: undefined}
		}
		channel.onopen = () => {
			const controls: JoinerControls = {
				clientId,
				close() {
					kill()
				},
				send(data) {
					if (channel.readyState === "open")
						channel.send(<any>data)
				},
			}
			const handlers = handleJoin(controls)
			channel.onclose = () => {
				kill()
				handlers.handleClose()
			}
			channel.onmessage = event => {
				handlers.handleMessage(event.data)
			}
			pendingJoin.resolve(controls)
		}
	}

	simple.state = {
		clientId,
		sessionInfo: joined.sessionInfo,
	}

	await peer.setRemoteDescription(joined.offer)
	const answer = await peer.createAnswer()
	await peer.setLocalDescription(new RTCSessionDescription(answer))

	await connection.signalServer.connecting.submitAnswer(sessionInfo.id, clientId, answer)
	await iceQueue.ready()

	const controls = await pendingJoin.promise

	return {
		controls,
		get state() {
			return simple.state
		},
	}
}
