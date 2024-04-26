
import {ApiError} from "../../../error.js"
import {stopwatch} from "../../../tools/stopwatch.js"
import {HttpHeaders, JsonRpcErrorResponse, JsonRpcRequestWithMeta, JsonRpcResponse, JsonRpcSuccessResponse, Logger, Servelet} from "../../../types.js"

export async function acceptIncomingRequest({
		logger, exposeErrors, headers, request, servelet, respond,
	}: {
		logger: Logger
		headers: HttpHeaders
		exposeErrors: boolean
		request: JsonRpcRequestWithMeta
		servelet: Servelet
		respond: (response: JsonRpcResponse) => void
	}) {
	const {id, meta, method, params} = <JsonRpcRequestWithMeta>request
	try {
		const timer = stopwatch()
		const result = await servelet({
			meta,
			method,
			params,
			headers,
		})
		const duration = timer()
		respond(<JsonRpcSuccessResponse>{
			jsonrpc: "2.0",
			id,
			result,
		})
		logger.log(`🔻 ${method}() - ${duration}ms`)
	}
	catch (error) {
		if (!(error instanceof ApiError)) {
			error = new ApiError(
				500,
				exposeErrors
					? error.message
					: "hidden error",
			)
		}
		respond(<JsonRpcErrorResponse>{
			jsonrpc: "2.0",
			id,
			error: {
				code: error.code,
				message: error.message,
			},
		})
		logger.error(`🚨 ${error.code ?? 500}`, error.stack)
	}
}
