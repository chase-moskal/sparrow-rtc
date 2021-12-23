
export function parseHashForSessionId(hash: string) {

	hash = (hash.length && hash[0] === "#")?
		hash.slice(1):
		hash

	const result = hash.match(/^session=(\S+)($|\&)/i)

	return result?
		result[1]:
		undefined
}
