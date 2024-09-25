
import {PartnerApi} from "./partner-api.js"
import {Person} from "../signaling/parts/people.js"
import {ConnectionReport} from "./partnerutils/connection-report.js"

export type PartnerOptions<Channels> = {
	rtcConfig: RTCConfiguration
	establishChannels: EstablishChannels<Channels>
	onReport: (report: ConnectionReport) => void
	onReady: (connection: HappyConnection<Channels>) => void
	sendIceCandidate: (candidate: RTCIceCandidate) => Promise<void>
}

export type JoinResult = "rejected" | "failed" | "succeeded"
export type ConnectionStatus = "start" | "offer" | "answer" | "accept" | "trickle" | "connected"

export type HappyConnection<Channels> = {
	channels: Channels
	peer: RTCPeerConnection
	report: ConnectionReport
}

export type Partner = {
	api: PartnerApi
	person: Person
}

export type EstablishChannels<Channels> = {
	offering: (peer: RTCPeerConnection) => Promise<Channels>
	answering: (peer: RTCPeerConnection) => Promise<Channels>
}

export type SendIceCandidateFn = (candidate: RTCIceCandidate) => Promise<void>

