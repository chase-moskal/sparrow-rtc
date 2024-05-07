
import * as Renraku from "renraku"

import {makeServerApi} from "./api/server-api.js"
import {makeBrowserApi} from "./api/browser-api.js"

export type Id = string
export type ReputationClaim = {id: Id, secret: Id}

export type ServerApi = ReturnType<typeof makeServerApi>
export type ServerRemote = Renraku.Remote<ServerApi>

export type BrowserApi = ReturnType<typeof makeBrowserApi>
export type BrowserRemote = Renraku.Remote<BrowserApi>

export type SocketClient = {
	remote: ServerRemote
	close: () => void
}

export type Clientizer = (claim: ReputationClaim | null) => Promise<SocketClient>

///////////////////////////////////

export type SessionInfo = {
	id: Id
	timeCreated: number
	label: string
	clientCount: number
	discoverable: boolean
}

export type SessionData = {
	secret: Id
	hostId: Id
} & SessionInfo

///////////////////////////////////

export type Partner = {
	reputationId: Id
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

///////////////////////////////////

export type StartSessionOptions = {
	label: string
	maxClients: number
	discoverable: boolean
}

