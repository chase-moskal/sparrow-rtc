
import {Stats} from "../../types.js"

import {graph} from "./graph.js"
import {conclude} from "./conclude.js"
import {Results} from "./execution-types.js"

export function renderReport({label, results, stats}: {
		stats: Stats
		label: string
		results: Results
	}) {

	const chart = graph(results)
	const conclusion = conclude(stats)

	let report = label
	report += `\n${chart}`
	report += `\n${conclusion}`

	return report
}
