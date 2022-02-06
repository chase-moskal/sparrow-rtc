
import {exampleApi} from "./example-api.js"
import {nodeServer} from "../node-server.js"
import {megabytes, timestampedLogger, deathWithDignity, colorfulLogger} from "../../renraku.js"

deathWithDignity()
const logger = timestampedLogger(colorfulLogger(console))

const server = nodeServer({
	logger,
	api: exampleApi,
	exposeErrors: false,
	maxPayloadSize: megabytes(10),
})

const port = 8000
server.listen(port)
logger.log(`💡 started http api server ${port}`)
