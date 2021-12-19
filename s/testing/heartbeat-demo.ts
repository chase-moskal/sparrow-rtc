
import {renrakuWebSocketClient} from "renraku/x/websocket/socket-client.js"
import {makeSignalBrowserApi} from "../signal/apis/make-signal-browser-api.js"
import {makeSignalServerApi} from "../signal/apis/make-signal-server-api.js"

console.log("💖 heartbeat demo")

const {remote, close} = await renrakuWebSocketClient<ReturnType<typeof makeSignalServerApi>>({
	link: "ws://localhost:8192/",
	clientApi: makeSignalBrowserApi(),
	handleConnectionClosed() {},
	metaMap: {
		hosting: async() => {},
		discovery: async() => {},
		connecting: async() => {},
	},
})

console.log("connected")
console.log(await remote.discovery.listSessions())
close()
