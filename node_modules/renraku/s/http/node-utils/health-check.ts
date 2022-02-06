
import {RequestListener} from "http"
import {Logger} from "../../types.js"

export function healthCheck(path: string, logger: Logger, listener: RequestListener): RequestListener {
	return async(request, response) => {
		if (request.url === path) {
			logger.log(`⚕️ health check`)
			response.setHeader("Content-Type", "text/plain; charset=utf-8")
			response.statusCode = 200
			response.end(Date.now().toString())
		}
		else
			return listener(request, response)
	}
}
