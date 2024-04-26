
import {createServer, RequestListener} from "http"

import {servelet} from "../servelet.js"
import {Api, Logger} from "../types.js"
import {allowCors} from "./node-utils/allow-cors.js"
import {healthCheck} from "./node-utils/health-check.js"
import {colorfulLogger} from "../tools/fancy-logging/colorful-logger.js"
import {timestampedLogger} from "../tools/fancy-logging/timestamped-logger.js"
import {makeRequestListener} from "./node-utils/make-request-listener.js"

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

	let listener: RequestListener = makeRequestListener({
		logger,
		exposeErrors,
		maxPayloadSize,
		execute,
	})

	listener = healthCheck("/health", logger, listener)
	listener = allowCors(listener)
	listener = processListener(listener)
	return createServer(listener)
}
