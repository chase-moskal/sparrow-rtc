
export function openPromise<R>() {
	let resolve: (result: R) => void = () => {}
	let reject: (reason: any) => void = () => {}
	const promise = new Promise<R>((res, rej) => {
		resolve = res
		reject = rej
	})
	return {promise, resolve, reject}
}
