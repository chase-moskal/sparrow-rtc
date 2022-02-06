
import {Results} from "../execution-types.js"
import {s_counts, s_pass} from "../symbols.js"

export function hasFailed(results: Results) {
	return results[s_counts] && !results[s_pass]
}
