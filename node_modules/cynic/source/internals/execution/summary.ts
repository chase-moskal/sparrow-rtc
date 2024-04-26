
import {Results} from "./execution-types.js"

import {
	s_pass,
	s_error,
	s_counts,
} from "./symbols.js"

export function summary(results1: Results) {
	let total = 0
	let failed = 0
	const errors: Error[] = []
	function recursive(results2: Results, depth: number = 1) {
		if (typeof results2[s_pass] !== "boolean") throw new Error(`invalid test result`)
		for (const [,results3] of Object.entries(results2)) {
			if (results3[s_counts]) {
				total += 1
				failed += results3[s_pass] ? 0 : 1
				if (results3[s_error]) errors.push(results3[s_error])
			}
			recursive(results3, depth + 1)
		}
	}
	recursive(results1)
	return {total, failed, errors}
}
