
/**
 * this is the api that each browser peer exposes to the signalling server.
 * these are the levers that the signal server can pull to control each peer during the connection process.
 * the signal server acts like a "traffic cop" (with the whistle), directing each peer what do do and when in order to coordinate a successful connection.
 */
export type PartnerApi = {
	startPeerConnection(): Promise<void>
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

export type IceReport = {good: number, bad: number}

export type PeerReport = {
	ice: IceReport
	dataChannel: RTCDataChannel
	connection: RTCPeerConnection
}

export type PeerGroup = {
	peer: RTCPeerConnection
	ice: Promise<IceReport>
	dataChannel: Promise<RTCDataChannel>
	connection: Promise<RTCPeerConnection>
}

