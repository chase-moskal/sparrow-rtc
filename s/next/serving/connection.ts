
import * as Renraku from "renraku"

import {Core} from "../core/core.js"
import {Identity} from "./identity.js"
import {pub} from "../../toolbox/pub.js"
import {hex_id} from "../../toolbox/id.js"
import {makeServerApi} from "../api/server.js"
import {browserMetas} from "../api/utils/metas.js"
import {BrowserApi, BrowserRemote} from "../types.js"

export class Connection {
	readonly id = hex_id()
	readonly socketHandling: Renraku.SocketHandling
	readonly browser: BrowserRemote

	readonly onIceCandidate = pub<(ice: RTCIceCandidate) => void>()

	identity: Identity | null = null

	constructor(
			public readonly socket: Renraku.SocketConnection,
			core: Core,
		) {

		this.browser = socket.prepareClientApi<BrowserApi>(browserMetas)

		this.socketHandling = {
			api: makeServerApi(core, this),
			handleConnectionClosed: () => {
				core.connections.delete(this.id)
			},
		}
	}
}

