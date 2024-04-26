
import {s_pass} from "../symbols.js"
import {Results} from "../execution-types.js"

export function recursivelyAssertValidity(results1: Results) {
	if (typeof results1[s_pass] !== "boolean")
		throw new Error(`invalid test result`)
	for (const [label, results2] of Object.entries(results1))
		recursivelyAssertValidity(results2)
}
