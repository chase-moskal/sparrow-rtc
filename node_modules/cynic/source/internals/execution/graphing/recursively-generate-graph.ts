
import {Results} from "../execution-types.js"
import {writeGraphCasesAndSummaries} from "../graphing/write-graph-cases-and-summaries.js"

export function recursivelyGenerateGraph(results1: Results, onlyShowErrors: boolean) {
	let output = ""
	const failSummary: string[] = []
	function generateGraph(results2: Results, depth: number = 1) {
		for (const [label, results3] of Object.entries(results2)) {
			const {summaries, caseReport} = writeGraphCasesAndSummaries({
				depth,
				label,
				output,
				onlyShowErrors,
				results: results3,
			})
			output += caseReport
			failSummary.push(...summaries)
			generateGraph(results3, depth + 1)
		}
	}
	generateGraph(results1)
	return {output, failSummary}
}
