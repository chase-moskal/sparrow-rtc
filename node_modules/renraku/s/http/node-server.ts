
import {createServer, RequestListener} from "http"

import {servelet} from "../servelet.js"
import {stopwatch} from "../tools/stopwatch.js"
import {allowCors} from "./node-utils/allow-cors.js"
import {readStream} from "./node-utils/read-stream.js"
import {healthCheck} from "./node-utils/health-check.js"
import {respondWithError} from "./node-utils/respond-with-error.js"
import {colorfulLogger} from "../tools/fancy-logging/colorful-logger.js"
import {timestampedLogger} from "../tools/fancy-logging/timestamped-logger.js"
import {Api, JsonRpcRequestWithMeta, JsonRpcResponse, Logger} from "../types.js"

export function nodeServer({
		api,
		exposeErrors,
		maxPayloadSize,
		logger = timestampedLogger(colorfulLogger(console)),
		processListener = (listener: RequestListener) => listener,
	}: {
		api: Api
		logger?: Logger
		exposeErrors: boolean
		maxPayloadSize: number
		processListener?: (listener: RequestListener) => RequestListener
	}) {

	const execute = servelet(api)

	let listener: RequestListener = async(req, res) => {
		let id = -1
		try {
			const body = await readStream(req, maxPayloadSize)
			const request: JsonRpcRequestWithMeta = JSON.parse(body)
			id = request.id
			res.setHeader("Content-Type", "application/json; charset=utf-8")
			const timer = stopwatch()
			const result = await execute({
				meta: request.meta,
				method: request.method,
				params: request.params,
				headers: req.headers,
			})
			const duration = timer()
			res.statusCode = 200
			res.end(
				JSON.stringify(<JsonRpcResponse>{
					jsonrpc: "2.0",
					id,
					result,
				})
			)
			logger.log(`🔔 ${request.method}() - ${duration.toFixed(0)}ms`)
		}
		catch (error) {
			logger.error(`🚨 ${error.code ?? 500}`, error.stack)
			return respondWithError({
				id,
				error,
				res,
				exposeErrors,
			})
		}
	}

	listener = healthCheck("/health", logger, listener)
	listener = allowCors(listener)
	listener = processListener(listener)
	return createServer(listener)
}
