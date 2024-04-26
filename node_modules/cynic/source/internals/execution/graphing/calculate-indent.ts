
import {Results} from "../execution-types.js"
import {repeat} from "../../toolbox/repeat.js"
import {s_counts, s_pass} from "../symbols.js"

export function calculateIndent({output, results, depth}: {
			depth: number
			output: string
			results: Results
		}) {
	const errorLeadNewline = output.length > 1
		? output[output.length - 1] === "\n"
			? ""
			: "\n"
		: ""
	return (results[s_counts] && !results[s_pass])
		? errorLeadNewline + repeat("═", (depth * 2) - 1) + " "
		: repeat(" ", depth * 2)
}
