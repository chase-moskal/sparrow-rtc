
import {Suite} from "../../types.js"
import {execute} from "./execute.js"
import {summary} from "./summary.js"

export async function run(tests: Suite) {
	const start = Date.now()
	const results = await execute(tests)
	const duration = Date.now() - start
	const stats = {...summary(results), duration}
	return {results, stats}
}
