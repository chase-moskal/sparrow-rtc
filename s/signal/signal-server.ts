
import {renrakuWebSocketServer} from "renraku/x/websocket/socket-server.js"

import {deathWithDignity} from "../toolbox/death-with-dignity.js"
import {makeSignalServerApi} from "./apis/make-signal-server-api.js"
import {makeSignalBrowserApi} from "./apis/make-signal-browser-api.js"

deathWithDignity()

let count = 0

renrakuWebSocketServer({
	port: 8192,
	exposeErrors: true,
	acceptConnection: ({controls, prepareClientApi}) => {
		console.log("NEW CONNECTION", count++)
		return {
			handleConnectionClosed() {},
			api: makeSignalServerApi({
				signalBrowserApi: prepareClientApi<ReturnType<typeof makeSignalBrowserApi>>({
					host: async() => {},
					client: async() => {},
				})
			})
		}
	}
})
