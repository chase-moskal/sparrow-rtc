
import {isRequest} from "./helpers/is-request.js"
import {responseWaiter} from "./helpers/response-waiter.js"
import {acceptIncomingRequest} from "./helpers/accept-incoming-request.js"
import {acceptIncomingResponse} from "./helpers/accept-incoming-response.js"
import {HttpHeaders, JsonRpcRequestWithMeta, JsonRpcResponse, Logger, Servelet} from "../../types.js"

export function negotiator({logger, timeout, exposeErrors}: {
		logger: Logger
		timeout: number
		exposeErrors: boolean
	}) {

	const waiter = responseWaiter({timeout})

	return {
		startWaitingForResponse: waiter.startWaitingForResponse,

		async acceptIncoming({servelet, headers, incoming, respond}: {
				servelet: Servelet
				headers: HttpHeaders
				incoming: JsonRpcRequestWithMeta | JsonRpcResponse
				respond: (response: JsonRpcResponse) => void
			}) {
			if (isRequest(incoming))
				acceptIncomingRequest({
					logger,
					headers,
					exposeErrors,
					request: <JsonRpcRequestWithMeta>incoming,
					respond,
					servelet,
				})
			else
				acceptIncomingResponse({
					logger,
					waiter,
					response: <JsonRpcResponse>incoming,
				})
		},
	}
}
