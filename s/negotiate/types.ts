
/**
 * this is the api that each browser peer exposes to the signalling server.
 * these are the levers that the signal server can pull to control each peer during the connection process.
 * the signal server acts like a "traffic cop" (with the whistle), directing each peer what do do and when in order to coordinate a successful connection.
 */
export type PartnerApi = {
	produceOffer(): Promise<RTCSessionDescription>
	produceAnswer(offer: RTCSessionDescription): Promise<RTCSessionDescription>
	acceptAnswer(answer: RTCSessionDescription): Promise<void>
	acceptIceCandidate(ice: RTCIceCandidate): Promise<void>
	waitUntilReady(): Promise<void>
}

export type SignalMediatorApi = {
	sendIceCandidate(ice: any): Promise<void>,
}

export type Partner = {
	onIceCandidate(fn: (ice: any) => void): (() => void)
} & PartnerApi
