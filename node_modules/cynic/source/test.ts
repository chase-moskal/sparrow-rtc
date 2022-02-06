
import {Suite} from "./types.js"
import {run} from "./internals/execution/run.js"
import {renderReport} from "./internals/execution/render-report.js"

export async function test(label: string, suite: Suite) {
	const {results, stats} = await run(suite)
	const report = renderReport({label, results, stats})
	return {...stats, report}
}
