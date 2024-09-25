
import {PartnerApi} from "./partner-api.js"
import {SignalingApi} from "../signaling/api.js"
import {Person} from "../signaling/parts/people.js"
import {ConnectionReport} from "./partnerutils/connection-report.js"

export type PartnerOptions<Channels> = {
	signalingApi: SignalingApi
	rtcConfig: RTCConfiguration
	channelsConfig: ChannelsConfig<Channels>
	onCable: (cable: Cable<Channels>) => void
	onReport: (report: ConnectionReport) => void
}

export type ConnectionStatus = "start" | "offer" | "answer" | "accept" | "trickle" | "connected"

export type Cable<Channels> = {
	channels: Channels
	peer: RTCPeerConnection
	report: ConnectionReport
}

export type Partner = {
	api: PartnerApi
	person: Person
}

export type SendIceCandidateFn = (candidate: RTCIceCandidate) => Promise<void>

export type ChannelsConfig<Channels> = {
	offering: (peer: RTCPeerConnection) => Promise<Channels>
	answering: (peer: RTCPeerConnection) => Promise<Channels>
}

export type StandardDataChannels = {
	reliable: RTCDataChannel
	unreliable: RTCDataChannel
}

export function asChannelsConfig<E extends ChannelsConfig<unknown>>(e: E) {
	return e
}

