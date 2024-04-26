
export function assertError(message: string, fun: () => void) {
	let error: any

	try {
		fun()
		throw new Error(message)
	}
	catch (err) {
		error = err
	}

	return error
}
