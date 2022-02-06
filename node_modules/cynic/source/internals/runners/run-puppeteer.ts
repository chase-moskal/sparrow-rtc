
import puppeteer from "puppeteer"
import {runServer} from "./run-server.js"
import {cynicTestFileName} from "../constants.js"

export async function runPuppeteer(args: {
		port: number
		label: string
		origin: string
		suitePath: string
		cynicPath: string
		importmapPath?: string
		launchOptions?: puppeteer.LaunchOptions
	}) {

	const server = runServer(args)

	const browser = await puppeteer.launch(args.launchOptions ?? {})
	const page = await browser.newPage()
	await page.goto(`${origin}/${cynicTestFileName}`)
	await page.waitFor(".report")
	const {report, failed} = await page.evaluate(() => ({
		failed: !!document.querySelector(".failed"),
		report: document.querySelector(".report").textContent,
	}))
	await browser.close()
	server.close()

	console.log(report)
	process.exit(failed ? 1 : 0)
}
