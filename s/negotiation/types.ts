
import {PartnerApi} from "./partner-api.js"
import {ConnectionReport} from "./parts/connection-report.js"

export type PartnerOptions<Channels> = {
	rtcConfig: RTCConfiguration
	establishChannels: EstablishChannels<Channels>
	onReport: (report: ConnectionReport) => void
	onReady: (connection: HappyConnection<Channels>) => void
	sendIceCandidate: (candidate: RTCIceCandidate) => Promise<void>
}

export type ConnectionStatus = "start" | "offer" | "answer" | "accept" | "trickle" | "connected"

export type HappyConnection<Channels> = {
	channels: Channels
	peer: RTCPeerConnection
	report: ConnectionReport
}

export type Partner = {
	personId: string
	onIceCandidate(fn: (ice: RTCIceCandidate) => void): (() => void)
} & PartnerApi

export type EstablishChannels<Channels> = {
	offering: (peer: RTCPeerConnection) => Promise<Channels>
	answering: (peer: RTCPeerConnection) => Promise<Channels>
}

export type SendIceCandidateFn = (candidate: RTCIceCandidate) => Promise<void>

