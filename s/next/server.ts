
import * as renraku from "renraku"
import {webSocketServer} from "renraku/x/websocket/socket-server.js"

import {Core} from "./core/core.js"
import {Connection} from "./serving/connection.js"
import {deathWithDignity} from "../toolbox/death-with-dignity.js"
import {delete_identities_after_awhile} from "./serving/utils/delete_identities_after_awhile.js"

deathWithDignity()

const core = new Core()

setInterval(delete_identities_after_awhile, 60_000)

webSocketServer({
	timeout: 60_000,
	exposeErrors: true,
	maxPayloadSize: renraku.megabytes(1),

	port: process.argv[2]
		? parseInt(process.argv[2])
		: 8192,

	acceptConnection: socket => {
		const connection = new Connection(socket, core)
		core.connections.add(connection)
		return connection.socketHandling
	},
})

