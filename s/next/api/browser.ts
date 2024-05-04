
import * as Renraku from "renraku"
import make_peer_group from "../negotiation/parts/make_peer_group.js"
import {ConnectionStatus, PeerGroup, ServerRemote} from "../types.js"

export function makeBrowserApi({
		server: {v1: {peering}},
		rtcConfig,
		onConnected,
		onConnectionChange,
	}: {
		server: ServerRemote
		rtcConfig: RTCConfiguration
		onConnected: (group: PeerGroup) => {}
		onConnectionChange: (status: ConnectionStatus) => {}
	}) {

	let peerGroup: PeerGroup

	function requirement() {
		if (peerGroup) return peerGroup
		else throw new Error("invalid, peer connection not yet started")
	}

	const v1 = Renraku.api({

		/**
		 * this is the service that each browser peer exposes to the signalling server.
		 * these are the levers that the signal server can pull to control each peer during the connection process.
		 * the signal server acts like a "traffic cop" (with the whistle), directing each peer to coordinate a successful connection.
		 */
		partner: Renraku.serviette(() => ({
			async startPeerConnection() {
				onConnectionChange("start")
				if (peerGroup) peerGroup.peer.close()
				peerGroup = make_peer_group(peering, rtcConfig)
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

			async produceAnswer(offer: RTCSessionDescription): Promise<any> {
				onConnectionChange("answer")
				const {peer} = requirement()
				await peer.setRemoteDescription(offer)
				const answer = await peer.createAnswer()
				await peer.setLocalDescription(answer)
				return answer
			},

			async acceptAnswer(answer: RTCSessionDescription): Promise<void> {
				onConnectionChange("accept")
				const {peer} = requirement()
				await peer.setRemoteDescription(answer)
			},

			async waitUntilReady() {
				onConnectionChange("trickle")
				const {dataChannel} = requirement()
				return dataChannel.then(() => {})
			},

			async acceptIceCandidate(ice: RTCIceCandidate): Promise<void> {
				const {peer} = requirement()
				await peer.addIceCandidate(ice)
			},
		})),
	})

	return Renraku.api({v1})
}

