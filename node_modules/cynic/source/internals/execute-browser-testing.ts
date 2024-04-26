
import openUrl from "open"
import {Details} from "../types.js"
import {cynicTestFileName} from "./constants.js"
import {runServer} from "./runners/run-server.js"

export async function executeBrowserTesting(details: Details) {
	const {host, port, open} = details

	runServer(details)

	const url = `${host}:${port}/${cynicTestFileName}`
	console.log(`\n Test server running, see ${url}\n`)

	if (open) {
		console.log(" - prompting open web browser")
		openUrl(url)
	}
}
