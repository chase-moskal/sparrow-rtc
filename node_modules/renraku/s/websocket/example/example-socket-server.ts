
import {megabytes} from "../../renraku.js"
import {webSocketServer} from "../socket-server.js"
import {clientsideApi, makeServersideApi} from "./example-socket-apis.js"

webSocketServer({
	port: 8001,
	timeout: 60_000,
	exposeErrors: false,
	maxPayloadSize: megabytes(10),
	acceptConnection: ({controls, prepareClientApi}) => ({
		handleConnectionClosed() {},
		api: makeServersideApi(
			controls,
			prepareClientApi<typeof clientsideApi>({
				clientService: async() => {},
			}),
		),
	}),
})
