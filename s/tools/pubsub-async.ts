
export type AsyncListener<A extends any[]> = (...a: A) => Promise<void>

export interface PubsubAsync<A extends any[]> {
	(listener: AsyncListener<A>): () => void
	publish(...a: A): Promise<void>
	clear(): void
}

export function pubsubAsync<A extends any[]>(): PubsubAsync<A> {
	const listeners = new Set<AsyncListener<A>>()

	function subscribe(fn: AsyncListener<A>) {
		listeners.add(fn)
		return () => listeners.delete(fn)
	}

	subscribe.publish = async(...a: A) => {
		await Promise.all(
			[...listeners].map(fn => fn(...a))
		)
	}

	subscribe.clear = async() => {
		listeners.clear()
	}

	return subscribe
}

