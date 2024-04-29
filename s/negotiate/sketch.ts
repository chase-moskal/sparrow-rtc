
export type PartnerApi = {
	produceOffer(): Promise<any>
	produceAnswer(offer: any): Promise<any>
	acceptAnswer(answer: any): Promise<void>
	acceptIceCandidate(ice: any): Promise<void>
	waitUntilReady(): Promise<void>
}

export type SignalMediatorApi = {
	sendIceCandidate(ice: any): Promise<void>,
}

export type Partner = {
	onIceCandidate(fn: (ice: any) => void): (() => void)
} & PartnerApi

export async function mediate(offerer: Partner, answerer: Partner) {
	return connect(offerer, answerer).then(() => true)
		.catch(() => connect(answerer, offerer)).then(() => true)
		.catch(() => false)
}

async function connect(offerer: Partner, answerer: Partner) {
	const ready = startExchangingIceCandidates(offerer, answerer)
	const offer = await offerer.produceOffer()
	const answer = await answerer.produceAnswer(offer)
	await offerer.acceptAnswer(answer)
	await ready
}

function startExchangingIceCandidates(alice: Partner, bob: Partner) {
	return Promise.all([
		iceForwarding(alice, bob),
		iceForwarding(bob, alice),
	])
}

async function iceForwarding(alpha: Partner, bravo: Partner) {
	const stopListening = alpha.onIceCandidate(bravo.acceptIceCandidate)
	await alpha.waitUntilReady().finally(stopListening)
}

/////////////

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

	const partnerApi: PartnerApi = {
		async produceOffer(): Promise<any> {
			const channel = peer.createDataChannel("data", {
				ordered: false,
				maxRetransmits: undefined,
			})
			channel.binaryType = "arraybuffer"
			const offer = await peer.createOffer()
			await peer.setLocalDescription(offer)
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
		partnerApi,
		connected,
		dataChannel,
	}
}





// function qev<E extends Event>(target: EventTarget, event: string, fn: (e: E) => void) {
// 	target.addEventListener(event, fn as any)
// 	return () => target.removeEventListener(event, fn as any)
// }

function attachEvents<E extends Record<string, (e: any) => void>>(target: EventTarget, events: E) {
	const entries = Object.entries(events)
	for (const [event, listener] of entries)
		target.addEventListener(event, listener as any)
	return () => entries.forEach(([event, listener]) => target.removeEventListener(event, listener as any))
}

