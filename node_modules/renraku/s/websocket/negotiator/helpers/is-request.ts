
import {JsonRpcRequestWithMeta, JsonRpcResponse} from "../../../types.js"

export function isRequest(incoming: JsonRpcRequestWithMeta | JsonRpcResponse) {
	return !!(<JsonRpcRequestWithMeta>incoming).method
}
