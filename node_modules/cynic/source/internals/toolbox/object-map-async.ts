
export async function objectMapAsync<V = any, X = any, O extends {} = {}>(
	input: O,
	mapper: (value: X, key: string) => Promise<V>
): Promise<{[P in keyof O]: V}> {
	const output: any = {}
	const promises = Object.entries(input)
		.map(async([key, value]) => [key, await mapper(<X>value, key)])
	for (const [key, value] of await Promise.all(promises))
		output[key] = value
	return output
}
