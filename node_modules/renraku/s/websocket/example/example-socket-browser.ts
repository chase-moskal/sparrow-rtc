
import {webSocketClient} from "../socket-client.js"
import {clientsideApi, makeServersideApi} from "./example-socket-apis.js"

export function makeExampleSocketClient() {
	return webSocketClient<ReturnType<typeof makeServersideApi>>({
		timeout: 60_000,
		link: "ws://localhost:8001",
		clientApi: clientsideApi,
		handleConnectionClosed() {},
		metaMap: {
			serverService: async() => {},
		},
	})
}
