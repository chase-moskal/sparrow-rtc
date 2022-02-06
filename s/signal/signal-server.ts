
import * as renraku from "renraku"
import {webSocketServer} from "renraku/x/websocket/socket-server.js"

import {deathWithDignity} from "../toolbox/death-with-dignity.js"
import {makeSessionManager} from "./cores/make-session-manager.js"
import {makeSignalServerApi} from "./apis/make-signal-server-api.js"
import {makeSignalBrowserApi} from "./apis/make-signal-browser-api.js"

deathWithDignity()

const port = process.argv[2]
	? parseInt(process.argv[2])
	: 8192

let count = 0
const sessionManager = makeSessionManager()

webSocketServer({
	port,
	exposeErrors: true,
	timeout: 10_000,
	maxPayloadSize: renraku.megabytes(10),
	acceptConnection: ({controls, prepareClientApi}) => {
		const clientId = count++
		console.log("connection opened", clientId)
		const emptyMetaMapForNoAuth = {
			host: async() => {},
			client: async() => {},
		}
		const signalBrowser = prepareClientApi<ReturnType<typeof makeSignalBrowserApi>>(
			emptyMetaMapForNoAuth
		)
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
