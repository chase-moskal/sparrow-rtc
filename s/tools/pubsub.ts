import {openPromise} from "./open-promise"

export interface Pubsub<P extends any[] = []> {
	(fn: (...p: P) => void): () => void
	publish(...p: P): void
	clear(): void
	once<T>(fn?: (...p: P) => T): Promise<T>
}

export function pubsub<P extends any[] = []>(): Pubsub<P> {
	const set = new Set<(...p: P) => void>()

	function subscribe(fn: (...p: P) => void) {
		set.add(fn)
		return () => { set.delete(fn) }
	}

	subscribe.publish = (...p: P) => {
		for (const fn of set)
			fn(...p)
	}

	subscribe.clear = () => set.clear()

	subscribe.once = async<T>(fn: (...p: P) => T) => {
		const {promise, resolve} = openPromise<T>()
		const stop = subscribe((...p) => {
			resolve(fn(...p))
			stop()
		})
		return promise
	}

	return subscribe
}

