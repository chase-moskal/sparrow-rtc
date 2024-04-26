
import {Results} from "../execution-types.js"
import {hasFailed} from "../graphing/has-failed.js"

export function recursivelyCountFailures(results1: Results) {
	let failCount = 0
	function countFailures(results2: Results) {
		for (const [label, results3] of Object.entries(results2)) {
			if (hasFailed(results3))
				failCount += 1
			countFailures(results3)
		}
	}
	countFailures(results1)
	return failCount
}
