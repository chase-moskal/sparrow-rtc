
import {icons} from "../../constants.js"
import {Results} from "../execution-types.js"
import {s_pass, s_counts} from "../symbols.js"

export function calculateIcon(results: Results) {
	return results[s_pass]
		? results[s_counts] ? icons.pass : icons.group
		: results[s_counts] ? icons.fail : icons.group
}
