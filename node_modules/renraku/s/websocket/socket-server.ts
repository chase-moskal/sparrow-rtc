
import {createServer} from "http"
import {WebSocketServer} from "ws"

import {servelet} from "../servelet.js"
import {negotiator} from "./negotiator/negotiator.js"
import {healthCheck} from "../http/node-utils/health-check.js"
import {colorfulLogger} from "../tools/fancy-logging/colorful-logger.js"
import {remoteWithMetaMap} from "../http/mapping/remote-with-meta-map.js"
import {timestampedLogger} from "../tools/fancy-logging/timestamped-logger.js"
import {Api, ApiRemote, JsonRpcRequestWithMeta, MetaMap, ConnectionControls, Requester, Logger, HttpHeaders} from "../types.js"

export function webSocketServer({
		port,
		timeout,
		exposeErrors,
		maxPayloadSize,
		logger = timestampedLogger(colorfulLogger(console)),
		acceptConnection,
	}: {
		port: number
		timeout: number
		exposeErrors: boolean
		maxPayloadSize: number
		logger?: Logger
		acceptConnection({}: {
			headers: HttpHeaders
			controls: ConnectionControls
			prepareClientApi: <xApi extends Api>(map: MetaMap<xApi>) => ApiRemote<xApi>,
		}): {
			api: Api
			handleConnectionClosed(): void
		}
	}) {

	const server = createServer()
	const wss = new WebSocketServer({
		noServer: true,
		maxPayload: maxPayloadSize,
	})

	{
		const log_error = (err: Error) => (
			logger.error(`${err.name}: ${err.message}`)
		)
		wss.on("error", log_error)
		server.on("error", log_error)
	}

	let count = 1

	wss.on("connection", async(socket, req) => {
		const clientCount = count++
		logger.log(`📖 connected ${clientCount}`)
		const logDisconnect = () => logger.log(`📕 disconnected ${clientCount}`)
		const {startWaitingForResponse, acceptIncoming} = negotiator({
			logger,
			timeout,
			exposeErrors,
		})
		const {api, handleConnectionClosed} = acceptConnection({
			headers: req.headers,
			controls: {
				ping() {
					socket.ping()
				},
				close() {
					socket.close()
					handleConnectionClosed()
					logDisconnect()
				},
			},
			prepareClientApi(map) {
				const requester: Requester = async({meta, method, params}) => {
					const {id, response} = startWaitingForResponse()
					socket.send(JSON.stringify(<JsonRpcRequestWithMeta>{
						id,
						jsonrpc: "2.0",
						meta,
						method,
						params,
					}))
					logger.log(`🔺 ${method}()`)
					return response
				}
				return remoteWithMetaMap(requester, map)
			},
		})
		const serversideServelet = servelet(api)
		socket.onclose = () => {
			handleConnectionClosed()
			logDisconnect()
		}
		socket.onerror = event => {
			logger.error(`🚨 socket error`, event.message, event.error)
			socket.close()
			handleConnectionClosed()
			logDisconnect()
		}
		socket.onmessage = async event => acceptIncoming({
			servelet: serversideServelet,
			headers: req.headers,
			incoming: JSON.parse(event.data.toString()),
			respond: response => socket.send(JSON.stringify(response)),
		})
	})

	server.prependListener("request", healthCheck("/health", logger, () => {}))

	server.on("upgrade", (request, socket, head) => {
		wss.handleUpgrade(request, socket, head, ws => {
			wss.emit("connection", ws, request)
		})
	})

	server.listen(port)
	logger.log(`💡 started web socket server ${port}`)

	return {
		close: () => {
			wss.close()
			server.close()
			logger.log(`🛑 stopped web socket server`)
		},
	}
}
