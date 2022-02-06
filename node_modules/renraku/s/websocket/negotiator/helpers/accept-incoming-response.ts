
import {ApiError} from "../../../error.js"
import {responseWaiter} from "./response-waiter.js"
import {JsonRpcErrorResponse, JsonRpcResponse, JsonRpcSuccessResponse, Logger} from "../../../types.js"

export async function acceptIncomingResponse({logger, response, waiter}: {
		logger: Logger
		response: JsonRpcResponse
		waiter: ReturnType<typeof responseWaiter>
	}) {
	if ((<JsonRpcErrorResponse>response).error) {
		const {id, error: {code, message}} = <JsonRpcErrorResponse>response
		if (id === -1)
			logger.error(`🚨 ${code ?? 500} ${message}`)
		else
			waiter.rejectPendingResponse(id, new ApiError(code, message))
	}
	else {
		const {id, result} = <JsonRpcSuccessResponse>response
		waiter.resolvePendingResponse(id, result)
	}
}
