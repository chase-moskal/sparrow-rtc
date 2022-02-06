
export function objectMap<V = any, X = any, O extends {} = {}>(
	input: O,
	mapper: (value: X, key: string) => V
): {[P in keyof O]: V} {
	const output: any = {}
	for (const [key, value] of Object.entries<X>(input))
		output[key] = mapper(value, key)
	return output
}
