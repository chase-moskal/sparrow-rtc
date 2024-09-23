
import {queue} from "../toolbox/queue.js"
import {simplestate} from "../toolbox/simplestate.js"
import {HostControls, HostState, ChannelHandlers, ChannelControls} from "../types.js"
import {connectToSignalServer} from "./utils/connect-to-signal-server.js"

export async function createSessionAsHost({
		label, signalServerUrl, rtcConfig,
		handleJoin, onStateChange, onConnectionLost,
	}: {
		label: string
		signalServerUrl: string
		rtcConfig: RTCConfiguration
		onConnectionLost(): void
		onStateChange(state: HostState): void
		handleJoin(controls: ChannelControls): ChannelHandlers
	}): Promise<HostControls> {

	const peerDetails = new Map<string, {
		peer: RTCPeerConnection
		iceQueue: ReturnType<typeof queue>
	}>()

	const connection = await connectToSignalServer({
		url: signalServerUrl,
		onConnectionLost,
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
				let handleClose = () => {}
				peer.onconnectionstatechange = () => {
					const connectionStatus = peer.connectionState
					if (["disconnected", "failed", "closed"].includes(connectionStatus)) {
						console.log("peer disconnected")
						handleClose()
					}
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
					handleClose = controls.handleClose
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
		label,
		discoverable: true,
	})

	const simple = simplestate<HostState>({
		state: {session, signalServerPing: -1},
		onChange: onStateChange,
	})

	const ping = async() => {
		const start = Date.now()
		await connection.signalServer.hosting.keepAlive()
		const ping = Date.now() - start
		simple.state = {...simple.state, signalServerPing: ping}
	}

	const pingingInterval = setInterval(ping, 10_000)
	ping()

	return {
		get state() {
			return simple.state
		},
		close: () => {
			clearInterval(pingingInterval)
			connection.close()
		},
	}
}

