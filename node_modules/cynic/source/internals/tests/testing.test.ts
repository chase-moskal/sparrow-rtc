
export function throwsError(func: Function) {
	let thrown = false

	try {
		func()
	}
	catch (e) {
		thrown = true
	}

	return thrown
}
