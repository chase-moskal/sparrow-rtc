
import {queue} from "../toolbox/queue.js"
import {simplestate} from "../toolbox/simplestate.js"
import {ClientState, ChannelControls, ChannelHandlers} from "../types.js"
import {connectToSignalServer} from "./utils/connect-to-signal-server.js"

export async function joinSessionAsClient({
		signalServerUrl,
		sessionId,
		rtcConfig,
		handleJoin,
		onStateChange,
		onClosed,
	}: {
		signalServerUrl: string
		sessionId: string
		rtcConfig: RTCConfiguration
		onClosed(): void
		onStateChange(state: ClientState): void
		handleJoin(controls: ChannelControls): ChannelHandlers
	}) {

	const peer = new RTCPeerConnection(rtcConfig)

	const connection = await connectToSignalServer({
		url: signalServerUrl,
		onConnectionLost: () => {
			console.warn("client connection to signal server was lost!!")
		},
		client: {
			async handleIceCandidates(candidates) {
				for (const candidate of candidates)
					await peer.addIceCandidate(candidate)
			},
		},
	})

	const joined = await connection.signalServer.connecting.joinSession(sessionId)
	if (!joined)
		throw new Error("failed to join session")

	const {clientId, sessionInfo} = joined

	const iceQueue = queue(
		async(candidates: any[]) => await connection.signalServer.connecting
			.submitIceCandidates(sessionId, clientId, candidates)
	)

	peer.onicecandidate = event => {
		const candidate = event.candidate
		if (candidate)
			iceQueue.add(candidate)
	}

	const pendingJoin = (() => {
		let resolve: (controls: ChannelControls) => void = () => {}
		let reject: (error: any) => void = () => {}
		const promise = new Promise<ChannelControls>((res, rej) => {
			resolve = res
			reject = rej
		})
		return {promise, resolve, reject}
	})()

	peer.ondatachannel = event => {
		const channel = event.channel
		function close() {
			channel.close()
			peer.close()
			onClosed()
		}
		channel.onopen = () => {
			const controls: ChannelControls = {
				clientId,
				close,
				send(data) {
					if (channel.readyState === "open")
						channel.send(<any>data)
				},
			}
			const handlers = handleJoin(controls)
			channel.onclose = () => {
				close()
				handlers.handleClose()
			}
			channel.onmessage = event => {
				handlers.handleMessage(event.data)
			}
			pendingJoin.resolve(controls)
		}
	}

	await peer.setRemoteDescription(joined.offer)
	const answer = await peer.createAnswer()
	await peer.setLocalDescription(new RTCSessionDescription(answer))

	await connection.signalServer.connecting.submitAnswer(sessionInfo.id, clientId, answer)
	await iceQueue.ready()

	const controls = await pendingJoin.promise
	connection.close()

	const simple = simplestate<ClientState>({
		state: {sessionInfo},
		onChange: onStateChange,
	})

	return {
		...controls,
		get state() {
			return simple.state
		},
	}
}

