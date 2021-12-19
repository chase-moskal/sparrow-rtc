
import {renrakuWebSocketServer} from "renraku/x/websocket/socket-server.js"

import {deathWithDignity} from "../toolbox/death-with-dignity.js"
import {makeSessionManager} from "./cores/make-session-manager.js"
import {makeSignalServerApi} from "./apis/make-signal-server-api.js"
import {makeSignalBrowserApi} from "./apis/make-signal-browser-api.js"

deathWithDignity()

let count = 0
const sessionManager = makeSessionManager()

renrakuWebSocketServer({
	port: 8192,
	exposeErrors: true,
	acceptConnection: ({controls, prepareClientApi}) => {
		const clientId = count++
		console.log("connection opened", clientId)
		const signalBrowser = prepareClientApi<ReturnType<typeof makeSignalBrowserApi>>({
			host: async() => {},
			client: async() => {},
		})
		const sessionProvider = sessionManager.makeSessionProvider({signalBrowser})
		const clientManager = sessionManager.makeClientManager(signalBrowser.client)
		return {
			handleConnectionClosed() {
				console.log("connection closed", clientId)
				sessionProvider.purge()
			},
			api: makeSignalServerApi({
				clientManager,
				sessionProvider,
				sessionFinder: sessionManager.sessionFinder,
			}),
		}
	}
})
