
import * as Renraku from "renraku"

import {pub} from "../../../toolbox/pub.js"
import {BrowserRemote} from "../../types.js"
import {hex_id} from "../../../toolbox/id.js"

export class Connection {
	readonly id = hex_id()
	readonly onIceCandidate = pub<(ice: RTCIceCandidate) => void>()

	constructor(
		public readonly socket: Renraku.SocketConnection,
		public readonly browser: BrowserRemote,
	) {}
}

