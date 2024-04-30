
import {attachEvents} from "../toolbox/attach-events.js"
import {PartnerApi, SignalMediatorApi} from "./types.js"

export async function makeBrowserPeer(
		rtcConfig: RTCConfiguration,
		mediator: SignalMediatorApi,
	) {

	const peer = new RTCPeerConnection(rtcConfig)

	const ice = new Promise<{good: number, bad: number}>((resolve, reject) => {
		const report = {good: 0, bad: 0}
		const unattach = attachEvents(peer, {
			icecandidate: (event: RTCPeerConnectionIceEvent) => {
				mediator.sendIceCandidate(event.candidate)
				report.good += 1
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

	const connected = new Promise<RTCPeerConnection>((resolve, reject) => {
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

	const partner: PartnerApi = {
		async produceOffer(): Promise<any> {
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
			await peer.setRemoteDescription(offer)
			const answer = await peer.createAnswer()
			await peer.setLocalDescription(answer)
			return answer
		},
		async acceptAnswer(answer: any): Promise<void> {
			await peer.setRemoteDescription(answer)
		},
		async waitUntilReady() {
			return dataChannel.then(() => {})
		},
		async acceptIceCandidate(ice: any): Promise<void> {
			await peer.addIceCandidate(ice)
		},
	}

	return {
		peer,
		ice,
		partner,
		connected,
		dataChannel,
	}
}

