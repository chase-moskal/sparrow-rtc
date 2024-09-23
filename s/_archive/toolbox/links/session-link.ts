
export function sessionLink(link: string, term: string, sessionId: string) {
	const url = new URL(link)
	url.hash = `#${term}=${sessionId}`
	return url.toString()
}
