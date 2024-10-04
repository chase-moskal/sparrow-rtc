
import {Core} from "./core.js"
import {makeSignalingApi} from "./api.js"
import {BrowserApi} from "../browser/api.js"
import {deathWithDignity} from "../tools/death-with-dignity.js"
import {WebSocketServer, remote, endpoint} from "renraku/x/node.js"

deathWithDignity()

const port = process.argv[2]
	? parseInt(process.argv[2])
	: 8192

const core = new Core()

const server = new WebSocketServer({
	acceptConnection: async({ip, remoteEndpoint, close}) => {
		const browserApi = remote<BrowserApi>(remoteEndpoint)
		const person = await core.acceptNewPerson(ip, browserApi, close)
		return {
			closed: () => core.personDisconnected(person),
			localEndpoint: endpoint(makeSignalingApi(core, person)),
		}
	},
})

server.listen(port)

