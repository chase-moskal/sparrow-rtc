
import * as Renraku from "renraku"

import {hex_id} from "../../toolbox/id.js"
import {BrowserApi} from "../api/browser.js"
import {Signaller} from "../core/signaller.js"

export class SignalConnection implements Renraku.SocketHandling {
	readonly id = hex_id()
	readonly api: Renraku.Api
	readonly handleConnectionClosed: () => void

	constructor(
			public readonly socket: Renraku.SocketConnection,
			public readonly signaller: Signaller,
		) {

		socket.prepareClientApi<BrowserApi>({
			partner: async() => {},
		})

		this.api = {} as any
		this.handleConnectionClosed = () => {}
	}
}

