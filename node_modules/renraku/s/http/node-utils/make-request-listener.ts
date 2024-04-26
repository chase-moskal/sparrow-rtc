
import {RequestListener} from "http"

import {readStream} from "./read-stream.js"
import {stopwatch} from "../../tools/stopwatch.js"
import {respondWithError} from "./respond-with-error.js"
import {colorfulLogger} from "../../tools/fancy-logging/colorful-logger.js"
import {timestampedLogger} from "../../tools/fancy-logging/timestamped-logger.js"
import {Logger, Servelet, JsonRpcRequestWithMeta, JsonRpcResponse} from "../../types.js"

export function makeRequestListener({
		exposeErrors,
		maxPayloadSize,
		logger = timestampedLogger(colorfulLogger(console)),
		execute,
	}: {
		exposeErrors: boolean,
		maxPayloadSize: number
		logger?: Logger
		execute: Servelet
	}): RequestListener {

	return async(req, res) => {
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
}
