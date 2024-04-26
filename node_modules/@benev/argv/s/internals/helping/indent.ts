
import {repeat} from "./repeat.js"

export function indent(indenter: string, n: number, text: string) {
	return text
		.split("\n")
		.map(
			line => line.length > 0
				? repeat(n, indenter) + line
				: line
		)
		.join("\n")
}
