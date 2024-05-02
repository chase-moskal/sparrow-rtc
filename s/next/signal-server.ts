
import * as renraku from "renraku"
import {webSocketServer} from "renraku/x/websocket/socket-server.js"

import {Signaller} from "./core/signaller.js"
import {SignalConnection} from "./serving/signal-connection.js"
import {deathWithDignity} from "../toolbox/death-with-dignity.js"

deathWithDignity()

const signaller = new Signaller()

webSocketServer({
	timeout: 60_000,
	exposeErrors: true,
	maxPayloadSize: renraku.megabytes(1),

	port: process.argv[2]
		? parseInt(process.argv[2])
		: 8192,

	acceptConnection: socket => new SignalConnection(
		socket,
		signaller,
	),
})

