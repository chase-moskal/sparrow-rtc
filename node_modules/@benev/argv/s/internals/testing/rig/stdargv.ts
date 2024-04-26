
export function stdargv(...args: string[]) {
	return ["exe", "script.js", ...args]
}
