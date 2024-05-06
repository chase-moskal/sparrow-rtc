
import * as Renraku from "renraku"
import {makeServerApi} from "./api/server-api.js"
import {makeBrowserApi} from "./api/browser-api.js"

export type Id = string
export type ReputationClaim = {id: Id, secret: Id}

export type ServerApi = ReturnType<typeof makeServerApi>
export type ServerRemote = Renraku.Remote<ServerApi>

export type BrowserApi = ReturnType<typeof makeBrowserApi>
export type BrowserRemote = Renraku.Remote<BrowserApi>

///////////////////////////////////

export type SessionInfo = {
	id: Id
	timeCreated: number
	label: string
	clientCount: number
	discoverable: boolean
}

///////////////////////////////////

export type Partner = {
	onIceCandidate(fn: (ice: RTCIceCandidate) => void): (() => void)
} & BrowserRemote["v1"]["partner"]

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

export type ConnectionStatus = "start" | "offer" | "answer" | "accept" | "trickle"

