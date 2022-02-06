
export function stopwatch() {
	const start = Date.now()
	return () => Date.now() - start
}
