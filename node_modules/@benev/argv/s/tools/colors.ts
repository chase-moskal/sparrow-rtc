
export const codes = Object.freeze({
	black: "\u001b[30m",
	red: "\u001b[31m",
	green: "\u001b[32m",
	yellow: "\u001b[33m",
	blue: "\u001b[34m",
	magenta: "\u001b[35m",
	cyan: "\u001b[36m",
	white: "\u001b[37m",
	reset: "\u001b[0m",
})

export type Codes = typeof codes

export const color = <{[key in keyof Codes]: (s: string) => string}>(
	Object.fromEntries(
		Object.entries(codes)
			.map(([key, code]) => [
				key,
				(s: string) => `${code}${s}${codes.reset}`,
			])
	)
)

export function uncolor(s: string) {
	return s.replace(
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
		"",
	)
}
