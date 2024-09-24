
import {PartnerOptions} from "./types.js"
import {make_peer_unit, PeerUnit} from "./parts/make_peer_unit.js"

export type PartnerApi = ReturnType<typeof makePartnerApi>

/**
 * this is the service that each browser peer exposes to the signalling server.
 * these are the levers that the signal server can pull to control each peer during the connection process.
 * the signal server acts like a "traffic cop" (with the whistle), directing each peer to coordinate a successful connection.
 * or maybe the signal server is like a puppeteer, and the browser partners are like marionettes..
 * what i'm trying to say is that the server is in control of the situation.
 */
export function makePartnerApi<Channels>({
		rtcConfig,
		establishChannels,
		ready,
		status,
		sendIceCandidate,
	}: PartnerOptions<Channels>) {

	let peerUnit: PeerUnit | null = null
	let readyPromise: Promise<void> = Promise.resolve()

	function requirePeerUnit() {
		if (peerUnit) return peerUnit
		else throw new Error("invalid, peer connection not yet started")
	}

	return {
		async startPeerConnection() {
			status("start")
			if (peerUnit) peerUnit.peer.close()
			peerUnit = make_peer_unit(sendIceCandidate, rtcConfig)
		},

		async produceOffer(): Promise<any> {
			status("offer")
			const {peer} = requirePeerUnit()
			readyPromise = establishChannels.offering(peer)
				.then(channels => ready(peer, channels))
			const offer = await peer.createOffer()
			await peer.setLocalDescription(offer)
			return offer
		},

		async produceAnswer(offer: RTCSessionDescription): Promise<any> {
			status("answer")
			const {peer} = requirePeerUnit()
			readyPromise = establishChannels.answering(peer)
				.then(channels => ready(peer, channels))
			await peer.setRemoteDescription(offer)
			const answer = await peer.createAnswer()
			await peer.setLocalDescription(answer)
			return answer
		},

		async acceptAnswer(answer: RTCSessionDescription): Promise<void> {
			status("accept")
			const {peer} = requirePeerUnit()
			await peer.setRemoteDescription(answer)
		},

		async acceptIceCandidate(ice: RTCIceCandidate): Promise<void> {
			const {peer} = requirePeerUnit()
			await peer.addIceCandidate(ice)
		},

		async waitUntilReady() {
			status("trickle")
			const {iceReport, connection} = requirePeerUnit()
			return Promise.all([readyPromise, iceReport, connection])
				.then(() => {})
		},
	}
}

