
import {fileURLToPath} from "url"
import {relative, join, dirname} from "path"

import {Details} from "../types.js"
import {runNode} from "./runners/run-node.js"

export async function executeNodeTesting(details: Details) {
	const importCwd = dirname(fileURLToPath(import.meta.url))
	const absoluteSuite = join(process.cwd(), details.suite)
	const importPath = "./" + relative(
		importCwd,
		absoluteSuite,
	)

	const {default: suite} = await import(importPath)

	await runNode(details["label"], suite)
}
