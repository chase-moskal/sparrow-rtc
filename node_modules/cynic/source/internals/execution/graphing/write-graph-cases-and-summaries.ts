
import {s_counts} from "../symbols.js"
import {hasFailed} from "./has-failed.js"
import {Results} from "../execution-types.js"
import {repeat} from "../../toolbox/repeat.js"
import {calculateIcon} from "./calculate-icon.js"
import {calculateIndent} from "./calculate-indent.js"
import {processFailuresAndInlineErrorMessages} from "./process-failures-and-inline-error-messages.js"

export function writeGraphCasesAndSummaries({
			depth,
			label,
			output,
			results,
			onlyShowErrors,
		}: {
			depth: number
			label: string
			output: string
			results: Results
			onlyShowErrors: boolean
		}) {

	const {inline, summaries} = processFailuresAndInlineErrorMessages({
		results,
		formatStack: stack => stack
			.replace(/\n/g, `\n${repeat(" ", (depth * 2) - 1)}`),
	})

	const inlineMessage = inline
		.map(i => `\n${repeat("―", depth * 2)}― ${i}`)
		.join("")

	const indent = calculateIndent({output, depth, results})
	const icon = calculateIcon(results)
	const failed = hasFailed(results)
	const eol = failed ? "\n" : ""
	const hidden = results[s_counts] && (onlyShowErrors && !failed)
	const caseReport = hidden
		? ``
		: `\n${indent}${icon} ${label}${inlineMessage}${eol}`

	return {caseReport, summaries}
}
