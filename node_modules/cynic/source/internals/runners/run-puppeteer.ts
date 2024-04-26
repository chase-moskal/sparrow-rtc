
import {LaunchOptions, launch} from "puppeteer"

import {Details} from "../../types.js"
import {runServer} from "./run-server.js"
import {cynicTestFileName} from "../constants.js"

export async function runPuppeteer(
		details: Details,
		launchOptions?: LaunchOptions,
	) {
	const {host, port} = details

	const server = runServer(details)
	const browser = await launch(launchOptions ?? {})

	const page = await browser.newPage()
	const path = `${host}:${port}/${cynicTestFileName}`

	await page.goto(path)
	await page.waitForSelector(".report")

	const {report, failed} = await page.evaluate(() => ({
		failed: !!document.querySelector(".failed"),
		report: document.querySelector(".report").textContent,
	}))

	await browser.close()
	server.close()

	console.log(report)
	process.exit(failed ? 1 : 0)
}
