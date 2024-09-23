
import {IceReport, ServerRemote} from "../../types.js"
import {attachEvents} from "../../../toolbox/attach-events.js"

type Peering = ServerRemote["v1"]["peering"]

export type PeerUnit = ReturnType<typeof make_peer_unit>

export function make_peer_unit({
		peering, rtcConfig,
	}: {
		peering: Peering
		rtcConfig: RTCConfiguration
	}) {
	const peer = new RTCPeerConnection(rtcConfig)
	const ice = waitForIce(peering, peer)
	const connection = waitForConnection(peer)
	return {peer, ice, connection}
}

////////////////////////////////////////////////

function waitForIce(peering: Peering, peer: RTCPeerConnection) {
	return new Promise<IceReport>((resolve, reject) => {
		const report: IceReport = {good: 0, bad: 0}
		const unattach = attachEvents(peer, {
			icecandidate: (event: RTCPeerConnectionIceEvent) => {
				if (event.candidate) {
					peering.sendIceCandidate(event.candidate)
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

