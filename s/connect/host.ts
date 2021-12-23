
import {HostState} from "../types.js"
import {queue} from "../toolbox/queue.js"
import {simplestate} from "../toolbox/simplestate.js"
import {connectToSignalServer} from "./utils/connect-to-signal-server.js"

export async function host({
		signalServerUrl, rtcConfig, onNewClient, onStateChange,
	}: {
		signalServerUrl: string
		rtcConfig: RTCConfiguration
		onNewClient({}: {
			send(data: any): void
		}): {
			onClose(): void
			onMessage(message: any): void
		}
		onStateChange(state: HostState): void
	}) {

	const peerDetails = new Map<string, {
		peer: RTCPeerConnection
		iceQueue: ReturnType<typeof queue>
	}>()

	const simple = simplestate({
		state: <HostState>{
			session: undefined,
		},
		render: onStateChange,
	})

	const connection = await connectToSignalServer({
		url: signalServerUrl,
		host: {
			async handleJoiner(clientId) {
				console.log("clientId", clientId)
				const peer = new RTCPeerConnection(rtcConfig)
				const iceQueue = queue(
					async(candidates: any[]) => connection.signalServer
						.hosting.submitIceCandidates(clientId, candidates)
				)
				peer.onicecandidate = event => {
					const candidate = event.candidate
					if (candidate) {
						console.log("ON ICE CANDIDATE", event)
						iceQueue.add(candidate)
					}
				}
				console.log("peer established", peer)
				const channel = peer.createDataChannel("data", {
					ordered: false,
					maxRetransmits: undefined,
					
				})
				console.log("data channel", channel)
				let onClose = () => {}
				let onMessage = (message: any) => {}
				channel.onopen = () => {
					console.log("DATACHANNEL OPEN")
					const clientControls = onNewClient({
						send(data) {
							channel.send(JSON.stringify(data))
						},
					})
					onClose = clientControls.onClose
					onMessage = clientControls.onMessage
				}
				channel.onclose = () => {
					console.log("DATACHANNEL CLOSE")
					onClose()
				}
				channel.onmessage = event => {
					onMessage(JSON.parse(event.data))
				}
				console.log("creating offer")
				const offer = await peer.createOffer()
				console.log("offer", offer)
				peer.setLocalDescription(offer)
				peerDetails.set(clientId, {peer, iceQueue})
				return {offer}
			},
			async handleAnswer(clientId, answer) {
				const {peer, iceQueue} = peerDetails.get(clientId)!
				await peer.setRemoteDescription(new RTCSessionDescription(answer))
				await iceQueue.ready()
			},
			async handleIceCandidates(clientId, candidates) {
				const {peer} = peerDetails.get(clientId)!
				console.log("handle ice candidates", candidates)
				for (const candidate of candidates)
					await peer.addIceCandidate(candidate)
				console.log("added ice candidates")
			},
		},
	})

	const session = await connection.signalServer.hosting.establishSession({
		discoverable: true,
		label: "test session",
	})

	simple.state = {...simple.state, session}

	return {
		getState() {
			return simple.state
		},
	}
}
