
export function readRawHeaders(rawHeaders: string[]) {
	const headers: {[key: string]: string} = {}

	for (let i = 0; i < rawHeaders.length; i += 2) {
		const key = rawHeaders[i]
		const value = rawHeaders[i + 1]
		headers[key] = value
	}

	return headers
}
