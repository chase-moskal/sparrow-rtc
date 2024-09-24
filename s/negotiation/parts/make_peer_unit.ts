
import {attachEvents} from "../../tools/attach-events.js"
import {IceReport, SendIceCandidateFn} from "../types.js"

export type PeerUnit = ReturnType<typeof make_peer_unit>

// TODO rename this, i can't tell wtf it even does
export function make_peer_unit(
		sendIceCandidate: SendIceCandidateFn,
		rtcConfig: RTCConfiguration,
	) {
	const peer = new RTCPeerConnection(rtcConfig)
	const iceReport = waitForIce(sendIceCandidate, peer)
	const connection = waitForConnection(peer)
	return {peer, iceReport, connection}
}

////////////////////////////////////////////////

function waitForIce(sendIceCandidate: SendIceCandidateFn, peer: RTCPeerConnection) {

	// TODO maybe we can expose the ice report before everything's done,
	// so that we can give users feedback about the ongoing negotiation process?

	return new Promise<IceReport>((resolve, reject) => {
		const report: IceReport = {good: 0, bad: 0}
		const unattach = attachEvents(peer, {
			icecandidate: (event: RTCPeerConnectionIceEvent) => {
				if (event.candidate) {
					sendIceCandidate(event.candidate)
					report.good += 1
				}
				else report.bad += 1
			},
			icecandidateerror: () => {
				report.bad += 1
			},
			icegatheringstatechange: () => {
				if (peer.iceGatheringState === "complete") {
					unattach()
					resolve(report)
				}
			},
			connectionstatechange: () => {
				if (peer.connectionState === "failed") {
					unattach()
					reject(new Error("connection failed"))
				}
			},
		})
	})
}

function waitForConnection(peer: RTCPeerConnection) {
	return new Promise<RTCPeerConnection>((resolve, reject) => {
		const unattach = attachEvents(peer, {
			connectionstatechange: () => {
				if (peer.connectionState === "connected") {
					unattach()
					resolve(peer)
				}
				else if (peer.connectionState === "failed") {
					unattach()
					reject(new Error("connection failed"))
				}
			},
		})
	})
}

