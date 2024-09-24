
import {PartnerApi} from "./partner-api.js"

export type PartnerOptions<Channels> = {
	rtcConfig: RTCConfiguration
	establishChannels: EstablishChannels<Channels>
	status: (status: ConnectionStatus) => void
	ready: (peer: RTCPeerConnection, channels: Channels) => void
	sendIceCandidate: (candidate: RTCIceCandidate) => Promise<void>
}

export type Partner = {
	personId: string
	onIceCandidate(fn: (ice: RTCIceCandidate) => void): (() => void)
} & PartnerApi

export type ConnectionStatus = "start" | "offer" | "answer" | "accept" | "trickle"

export type EstablishChannels<Channels> = {
	offering: (peer: RTCPeerConnection) => Promise<Channels>
	answering: (peer: RTCPeerConnection) => Promise<Channels>
}

export type IceReport = {good: number, bad: number}

export type PeerReport = {
	ice: IceReport
	dataChannel: RTCDataChannel
	connection: RTCPeerConnection
}

export type SendIceCandidateFn = (candidate: RTCIceCandidate) => Promise<void>

