
import {TimeoutError} from "../../../error.js"

export function responseWaiter({timeout}: {timeout: number}) {
	let requestCount = 0

	const pendingResponses = new Map<number, {
		timeoutId: any
		resolve: (result: any) => void
		reject: (reason?: any) => void
	}>()

	return {
		startWaitingForResponse() {
			const id = requestCount++
			return {
				id,
				response: new Promise<any>((resolve, reject) => {
					pendingResponses.set(id, {
						resolve,
						reject,
						timeoutId: setTimeout(() => reject(
							new TimeoutError(`request (id ${id}) timed out`)
						), timeout),
					})
				}),
			}
		},

		resolvePendingResponse(id: number, result: any) {
			const waiter = pendingResponses.get(id)
			if (waiter) {
				clearTimeout(waiter.timeoutId)
				waiter.resolve(result)
				pendingResponses.delete(id)
			}
		},

		rejectPendingResponse(id: number, reason: any) {
			const waiter = pendingResponses.get(id)
			if (waiter) {
				clearTimeout(waiter.timeoutId)
				waiter.reject(reason)
				pendingResponses.delete(id)
			}
		},
	}
}
