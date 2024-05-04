
import * as renraku from "renraku"
import {webSocketServer} from "renraku/x/websocket/socket-server.js"

import {Core} from "./core/core.js"
import {deathWithDignity} from "../toolbox/death-with-dignity.js"

deathWithDignity()

const core = new Core()
setInterval(() => core.cullExpiredReputations(), 60_000)

webSocketServer({
	timeout: 60_000,
	exposeErrors: true,
	maxPayloadSize: renraku.megabytes(1),

	port: process.argv[2]
		? parseInt(process.argv[2])
		: 8192,

	acceptConnection: socket => core.acceptConnection(socket).handling,
})

