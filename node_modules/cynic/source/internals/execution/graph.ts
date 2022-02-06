
import {Results} from "./execution-types.js"
import {recursivelyGenerateGraph} from "./graphing/recursively-generate-graph.js"
import {recursivelyCountFailures} from "./graphing/recursively-count-failures.js"
import {recursivelyAssertValidity} from "./graphing/recursively-assert-validity.js"

export function graph(results1: Results) {
	recursivelyAssertValidity(results1)
	const failCount = recursivelyCountFailures(results1)
	const onlyShowErrors = failCount > 0
	const {output, failSummary} = recursivelyGenerateGraph(results1, onlyShowErrors)
	return output + (
		failSummary.length > 0
			? "\n\n" + failSummary.join("\n")
			: ""
	)
}
