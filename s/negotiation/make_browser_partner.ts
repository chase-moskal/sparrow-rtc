
import {concurrent} from "../toolbox/concurrent.js"
import {openPromise} from "../toolbox/open-promise.js"
import make_peer_group from "./parts/make_peer_group.js"
import {PeerReport, PartnerApi, PeerGroup, SignalMediatorApi} from "./types.js"

export default function(
		mediator: SignalMediatorApi,
		rtcConfig: RTCConfiguration,
	) {

	let peerGroup: PeerGroup
	const report = openPromise<PeerReport>()

	function requirement() {
		if (peerGroup) return peerGroup
		else throw new Error("invalid, peer connection not yet started")
	}

	const partner: PartnerApi = {
		async startPeerConnection() {
			if (peerGroup) peerGroup.peer.close()
			peerGroup = make_peer_group(mediator, rtcConfig)
			const {dataChannel, connection, ice} = peerGroup
			concurrent({ice, dataChannel, connection})
				.then(report.resolve)
				.then(report.reject)
		},

		async produceOffer(): Promise<any> {
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
			const {peer} = requirement()
			await peer.setRemoteDescription(offer)
			const answer = await peer.createAnswer()
			await peer.setLocalDescription(answer)
			return answer
		},

		async acceptAnswer(answer: any): Promise<void> {
			const {peer} = requirement()
			await peer.setRemoteDescription(answer)
		},

		async waitUntilReady() {
			const {dataChannel} = requirement()
			return dataChannel.then(() => {})
		},

		async acceptIceCandidate(ice: any): Promise<void> {
			const {peer} = requirement()
			await peer.addIceCandidate(ice)
		},
	}

	return {
		partner,
		report: report.promise,
	}
}

