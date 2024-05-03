
import * as Renraku from "renraku"

import {BrowserApi} from "../types.js"
import {hex_id} from "../../toolbox/id.js"
import {browserMetas} from "../api/metas.js"
import {makeServerApi} from "../api/server.js"
import {SignalCore} from "../core/signal-core.js"

export class SignalConnection implements Renraku.SocketHandling {
	readonly id = hex_id()
	readonly api: Renraku.Api
	readonly handleConnectionClosed: () => void

	constructor(
			public readonly socket: Renraku.SocketConnection,
			public readonly signalCore: SignalCore,
		) {

		const browser = socket.prepareClientApi<BrowserApi>(browserMetas)
		this.api = makeServerApi(this)
		this.handleConnectionClosed = () => {
			signalCore.connections.delete(this.id)
		}
	}
}

