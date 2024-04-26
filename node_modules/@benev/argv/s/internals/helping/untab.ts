
export function untab(code: string) {
	const lines = code.split(/\r|\n/)

	let baseTabLevel: number | undefined
	for (const line of lines) {
		const isOnlyWhitespace = /^\s+$/.test(line)
		if (!isOnlyWhitespace) {
			const tabMatch = line.match(/^(\t+).+/)
			if (tabMatch) {
				const tabCount = tabMatch[1].length
				baseTabLevel = baseTabLevel === undefined
					? tabCount
					: tabCount < baseTabLevel
						? tabCount
						: baseTabLevel
				if (baseTabLevel === 0)
					break
			}
		}
	}

	const rebaseTabRegex = new RegExp(`^\\t{${baseTabLevel}}`)

	return lines
		.map(line => /^\s+$/.test(line) ? "" : line)
		.map(line => line.replace(rebaseTabRegex, ""))
		.join("\n")
}
