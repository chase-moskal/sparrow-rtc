
export function noop(strings: TemplateStringsArray, ...values: any[]) {

	function reducer(previous: string, current: string, index: number) {
		return previous + current + (values[index] ?? "")
	}

	return Array
		.from(strings)
		.reduce(reducer, "")
}
