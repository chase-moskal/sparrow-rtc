
export function sessionLink(link: string, sessionId: string) {
	const url = new URL(link)
	url.hash = `#session=${sessionId}`
	return url.toString()
}
