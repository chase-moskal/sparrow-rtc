
import {PartnerOptions} from "./types.js"
import {Peerbox} from "./partnerutils/peerbox.js"
import {concurrent} from "../tools/concurrent.js"

export type PartnerApi = ReturnType<typeof makePartnerApi>

/**
 * each browser peer exposes these functions to the signalling server.
 * each exposed function is like a lever that the signalling server can pull to remotely control the browser peer.
 * thus, the signalling server is really the one calling the shots and driving the webrtc negotiation.
 * think of the signalling server as a traffic cop (with the whistle) commanding each browser peer throughout the negotation process.
 */
export function makePartnerApi<Channels>({
		signalingApi,
		rtcConfig,
		establishChannels,
		onReport,
	}: PartnerOptions<Channels>) {

	let peerbox: Peerbox<Channels> | null = null

	function require() {
		if (peerbox) return peerbox
		else throw new Error("no connection started")
	}

	return {
		async startPeerConnection() {
			if (peerbox) peerbox.peer.close()
			peerbox = new Peerbox(
				rtcConfig,
				signalingApi.negotiation.sendIceCandidate,
				onReport,
			)
		},

		async produceOffer(): Promise<any> {
			const {peer, channelsWaiting, report} = require()
			report.status = "offer"
			channelsWaiting.entangle(establishChannels.offering(peer))
			const offer = await peer.createOffer()
			await peer.setLocalDescription(offer)
			return offer
		},

		async produceAnswer(offer: RTCSessionDescription): Promise<any> {
			const {peer, channelsWaiting, report} = require()
			report.status = "answer"
			channelsWaiting.entangle(establishChannels.answering(peer))
			await peer.setRemoteDescription(offer)
			const answer = await peer.createAnswer()
			await peer.setLocalDescription(answer)
			return answer
		},

		async acceptAnswer(answer: RTCSessionDescription): Promise<void> {
			const {peer, report} = require()
			report.status = "accept"
			await peer.setRemoteDescription(answer)
		},

		async acceptIceCandidate(ice: RTCIceCandidate): Promise<void> {
			const {peer} = require()
			await peer.addIceCandidate(ice)
		},

		async waitUntilReady() {
			const {report, channelsWaiting, connectedPromise, iceGatheredPromise} = require()
			report.status = "trickle"
			const stuffPromise = concurrent({
				peer: connectedPromise,
				channels: channelsWaiting.promise,
			})
			const [stuff] = await Promise.all([stuffPromise, iceGatheredPromise])
			report.status = "connected"
			return {
				report,
				peer: stuff.peer,
				channels: stuff.channels,
			}
		},
	}
}

