
import make_peer_group from "./parts/make_peer_group.js"
import {PartnerApi, PeerGroup, SignalMediatorApi} from "./types.js"

export type ConnectionStatus = "start" | "offer" | "answer" | "accept" | "trickle"

export default function({
		mediator,
		rtcConfig,
		onConnected,
		onConnectionChange,
	}: {
		mediator: SignalMediatorApi
		rtcConfig: RTCConfiguration
		onConnected: (group: PeerGroup) => {}
		onConnectionChange: (status: ConnectionStatus) => {}
	}) {

	let peerGroup: PeerGroup

	function requirement() {
		if (peerGroup) return peerGroup
		else throw new Error("invalid, peer connection not yet started")
	}

	const partner: PartnerApi = {
		async startPeerConnection() {
			onConnectionChange("start")
			if (peerGroup) peerGroup.peer.close()
			peerGroup = make_peer_group(mediator, rtcConfig)
		},

		async produceOffer(): Promise<any> {
			onConnectionChange("offer")
			const {peer} = requirement()
			const channel = peer.createDataChannel("data", {
				ordered: false,
				maxRetransmits: undefined,
			})
			channel.binaryType = "arraybuffer"
			const offer = await peer.createOffer()
			await peer.setLocalDescription(offer)
			return offer
		},

		async produceAnswer(offer: any): Promise<any> {
			onConnectionChange("answer")
			const {peer} = requirement()
			await peer.setRemoteDescription(offer)
			const answer = await peer.createAnswer()
			await peer.setLocalDescription(answer)
			return answer
		},

		async acceptAnswer(answer: any): Promise<void> {
			onConnectionChange("accept")
			const {peer} = requirement()
			await peer.setRemoteDescription(answer)
		},

		async waitUntilReady() {
			onConnectionChange("trickle")
			const {dataChannel} = requirement()
			return dataChannel.then(() => {})
		},

		async acceptIceCandidate(ice: any): Promise<void> {
			const {peer} = requirement()
			await peer.addIceCandidate(ice)
		},
	}

	return partner
}

