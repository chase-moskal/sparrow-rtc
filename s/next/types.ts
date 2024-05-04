
import * as Renraku from "renraku"
import {makeServerApi} from "./api/server.js"
import {makeBrowserApi} from "./api/browser.js"

export type Id = string
export type IdentityClaim = {id: Id, secret: Id}

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

export type ConnectionStatus = "start" | "offer" | "answer" | "accept" | "trickle"

