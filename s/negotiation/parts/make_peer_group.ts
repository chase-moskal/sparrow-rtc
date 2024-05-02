
import {ServerRemote} from "../../next/types.js"
import {IceReport, PeerGroup} from "../types.js"
import {attachEvents} from "../../toolbox/attach-events.js"

export default function(
		mediator: ServerRemote["mediator"],
		rtcConfig: RTCConfiguration,
	): PeerGroup {

	const peer = new RTCPeerConnection(rtcConfig)

	const ice = new Promise<IceReport>((resolve, reject) => {
		const report: IceReport = {good: 0, bad: 0}
		const unattach = attachEvents(peer, {
			icecandidate: (event: RTCPeerConnectionIceEvent) => {
				if (event.candidate) {
					mediator.sendIceCandidate(event.candidate)
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

	const connection = new Promise<RTCPeerConnection>((resolve, reject) => {
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

	const dataChannel = new Promise<RTCDataChannel>((resolve, reject) => {
		const unattach = attachEvents(peer, {
			datachannel: ({channel}: RTCDataChannelEvent) => {
				const stop = attachEvents(channel, {
					open: () => {
						stop()
						unattach()
						resolve(channel)
					},
					error: () => {
						stop()
						unattach()
						reject(new Error("data channel failed"))
					},
				})
			},
			connectionstatechange: () => {
				if (peer.connectionState === "failed") {
					unattach()
					reject(new Error("connection failed"))
				}
			},
		})
	})

	return {peer, ice, dataChannel, connection}
}

