
export async function nap(milliseconds = 0) {
	return new Promise<void>(resolve => {
		setTimeout(resolve, milliseconds)
	})
}
