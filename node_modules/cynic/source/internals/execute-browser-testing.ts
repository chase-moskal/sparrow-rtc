
import openUrl from "open"
import {cynicTestFileName} from "./constants.js"
import {runServer} from "./runners/run-server.js"

export async function executeBrowserTesting({
		port,
		label,
		suitePath,
		cynicPath,
		importmapPath,
	}: {
		port: number
		label: string
		suitePath: string
		cynicPath: string
		importmapPath: string
	}) {

	runServer({
		port,
		label,
		suitePath,
		cynicPath,
		importmapPath,
	})

	const url = `${origin}/${cynicTestFileName}`
	console.log(`\n Test server running, see ${url}\n`)

	if (open) openUrl(url)
}
