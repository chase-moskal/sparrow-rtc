
export function objectMap<Input extends {}, Output extends {}>(
		input: Input,
		mapper: (value: any, key: string) => any,
	): Output {

	const output: any = {}

	for (const [key, value] of Object.entries(input))
		output[key] = mapper(value, key)

	return output
}
