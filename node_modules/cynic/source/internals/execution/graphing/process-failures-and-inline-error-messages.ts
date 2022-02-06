
import {Results} from "../execution-types.js"
import {calculateIcon} from "./calculate-icon.js"
import {s_pass, s_counts, s_error} from "../symbols.js"

export function processFailuresAndInlineErrorMessages({results, formatStack}: {
			results: Results
			formatStack: (stack: string) => string
		}) {

	const error = results[s_error]
	const inline = []
	const summaries = []

	if (error !== undefined && error !== null) {
		if (typeof error === "string") {
			inline.push(error)
			summaries.push(error)
		}
		else if (error.stack) {
			inline.push(formatStack(error.stack))
			summaries.push(`${error.name} ${error.message}`)
		}
		else {
			const unknown = "*unknown throw type*"
			inline.push(unknown)
			summaries.push(unknown)
		}
	}
	else {
		if (results[s_counts] && !results[s_pass]) {
			summaries.push("failed")
		}
	}

	return {
		inline,
		summaries: summaries.map(summary => `${calculateIcon(results)} ${summary}`),
	}
}
