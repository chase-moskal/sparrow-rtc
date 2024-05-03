
import * as renraku from "renraku"
import {webSocketServer} from "renraku/x/websocket/socket-server.js"

import {SignalCore} from "./core/signal-core.js"
import {SignalConnection} from "./serving/signal-connection.js"
import {deathWithDignity} from "../toolbox/death-with-dignity.js"

deathWithDignity()

const signalCore = new SignalCore()

webSocketServer({
	timeout: 60_000,
	exposeErrors: true,
	maxPayloadSize: renraku.megabytes(1),

	port: process.argv[2]
		? parseInt(process.argv[2])
		: 8192,

	acceptConnection: socket => new SignalConnection(
		socket,
		signalCore,
	),
})

