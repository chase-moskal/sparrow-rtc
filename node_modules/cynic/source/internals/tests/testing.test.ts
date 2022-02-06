
export function throwsError(func: Function) {
	let error: Error = undefined
	try { func() }
	catch (e) { error = e }
	return error !== undefined
}
