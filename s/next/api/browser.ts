
import * as Renraku from "renraku"
import {ServerRemote} from "../types.js"
import {ConnectionStatus, PeerGroup} from "../../negotiation/types.js"
import make_peer_group from "../../negotiation/parts/make_peer_group.js"

export type BrowserApi = ReturnType<typeof makeBrowserApi>

export function makeBrowserApi({
		server: {mediator},
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

	return Renraku.api({
		partner: Renraku.serviette(() => ({
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
		})),
	})
}

