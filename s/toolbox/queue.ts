
export function queue<X>(action: (x: X[]) => Promise<void>) {
	let data: X[] = []
	let isReady = false
	return {
		async add(x: X) {
			if (isReady)
				await action([x])
			else
				data.push(x)
		},
		async ready() {
			isReady = true
			if (data.length)
				await action(data)
		},
	}
}
