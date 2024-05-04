
import * as Renraku from "renraku"

import {pub} from "../../toolbox/pub.js"
import {hex_id} from "../../toolbox/id.js"
import {Reputation} from "./reputation.js"
import {BrowserRemote} from "../types.js"

export class Connection {
	readonly id = hex_id()
	readonly onIceCandidate = pub<(ice: RTCIceCandidate) => void>()

	reputation: Reputation | null = null

	constructor(
		public readonly socket: Renraku.SocketConnection,
		public readonly browser: BrowserRemote,
	) {}
}

