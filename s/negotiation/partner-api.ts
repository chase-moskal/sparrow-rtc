
import {PartnerOptions} from "./types.js"
import {concurrent} from "../tools/concurrent.js"
import {AgentInfo} from "../signaling/agent/types.js"
import {Operations} from "./partnerutils/operations.js"
import {Cable} from "./partnerutils/cable.js"

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
		channelsConfig,
		onCable,
		onReport,
	}: PartnerOptions<Channels>) {

	const operations = new Operations<Channels>()

	return {
		async startPeerConnection(agent: AgentInfo) {
			const operation = operations.create({
				agent,
				rtcConfig,
				onReport,
				sendIceCandidate: signalingApi.sendIceCandidate,
			})
			return operation.id
		},

		async produceOffer(opId: number): Promise<any> {
			const {peer, channelsWaiting, report} = operations.require(opId)
			report.status = "offer"
			channelsWaiting.entangle(channelsConfig.offering(peer))
			const offer = await peer.createOffer()
			await peer.setLocalDescription(offer)
			return offer
		},

		async produceAnswer(opId: number, offer: RTCSessionDescription): Promise<any> {
			const {peer, channelsWaiting, report} = operations.require(opId)
			report.status = "answer"
			channelsWaiting.entangle(channelsConfig.answering(peer))
			await peer.setRemoteDescription(offer)
			const answer = await peer.createAnswer()
			await peer.setLocalDescription(answer)
			return answer
		},

		async acceptAnswer(opId: number, answer: RTCSessionDescription): Promise<void> {
			const {peer, report} = operations.require(opId)
			report.status = "accept"
			await peer.setRemoteDescription(answer)
		},

		async acceptIceCandidate(opId: number, ice: RTCIceCandidate): Promise<void> {
			const {peer} = operations.require(opId)
			await peer.addIceCandidate(ice)
		},

		async waitUntilReady(opId: number): Promise<void> {
			const {agent, report, channelsWaiting, connectedPromise, iceGatheredPromise} = operations.require(opId)
			report.status = "trickle"

			const wait = concurrent({
				peer: connectedPromise,
				channels: channelsWaiting.promise,
			})

			const [{peer, channels}] = await Promise.all([wait, iceGatheredPromise])

			report.status = "connected"
			const cable = new Cable(agent, channels, peer, report)
			onCable(cable)
		},
	}
}

