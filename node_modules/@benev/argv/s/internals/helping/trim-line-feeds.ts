
export function trimLinefeeds(s: string) {
	const leading = /^\n*([\s\S]*)$/g.exec(s)
	if (leading)
		s = leading[1]

	const trailing = /([\s\S*]*?)\n*$/g.exec(s)
	if (trailing)
		s = trailing[1]

	return s
}
