
import {fileURLToPath} from "url"
import {relative, join, dirname} from "path"
import {runNode} from "./runners/run-node.js"

export async function executeNodeTesting({label, suitePath}: {
		label: string
		suitePath: string
	}) {

	const importCwd = dirname(fileURLToPath(import.meta.url))
	const absoluteSuite = join(process.cwd(), suitePath)
	const importPath = "./" + relative(
		importCwd,
		absoluteSuite
	)

	const {default: suite} = await import(importPath)
	await runNode(label, suite)
}
