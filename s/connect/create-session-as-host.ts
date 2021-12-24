
import {queue} from "../toolbox/queue.js"
import {HandleJoin, HostState} from "../types.js"
import {simplestate} from "../toolbox/simplestate.js"
import {connectToSignalServer} from "./utils/connect-to-signal-server.js"

export async function createSessionAsHost({
		signalServerUrl, rtcConfig,
		handleJoin, onStateChange,
	}: {
		signalServerUrl: string
		rtcConfig: RTCConfiguration
		handleJoin: HandleJoin
		onStateChange(state: HostState): void
	}) {

	const peerDetails = new Map<string, {
		peer: RTCPeerConnection
		iceQueue: ReturnType<typeof queue>
	}>()

	const simple = simplestate<HostState>({
		state: {
			session: undefined,
		},
		render: onStateChange,
	})

	const connection = await connectToSignalServer({
		url: signalServerUrl,
		host: {

			async handleJoiner(clientId) {
				const peer = new RTCPeerConnection(rtcConfig)
				const iceQueue = queue(
					async(candidates: any[]) => connection.signalServer
						.hosting.submitIceCandidates(clientId, candidates)
				)
				peerDetails.set(clientId, {peer, iceQueue})
				peer.onicecandidate = event => {
					if (event.candidate)
						iceQueue.add(event.candidate)
				}
				const channel = peer.createDataChannel("data", {
					ordered: false,
					maxRetransmits: undefined,
				})
				channel.binaryType = "arraybuffer"
				function kill() {
					channel.close()
					peer.close()
					peerDetails.delete(clientId)
				}
				channel.onopen = () => {
					const controls = handleJoin({
						clientId,
						send(data) {
							if (channel.readyState === "open")
								channel.send(<any>data)
						},
						close() {
							kill()
						},
					})
					channel.onclose = () => {
						kill()
						controls.handleClose()
					}
					channel.onmessage = event => {
						controls.handleMessage(event.data)
					}
				}
				const offer = await peer.createOffer()
				peer.setLocalDescription(offer)
				return {offer}
			},

			async handleAnswer(clientId, answer) {
				const {peer, iceQueue} = peerDetails.get(clientId)!
				await peer.setRemoteDescription(new RTCSessionDescription(answer))
				await iceQueue.ready()
			},

			async handleIceCandidates(clientId, candidates) {
				const {peer} = peerDetails.get(clientId)!
				for (const candidate of candidates)
					await peer.addIceCandidate(candidate)
			},
		},
	})

	const session = await connection.signalServer.hosting.establishSession({
		discoverable: true,
		label: "test session",
	})

	simple.state = {...simple.state, session}

	return {
		get state() {
			return simple.state
		},
	}
}
