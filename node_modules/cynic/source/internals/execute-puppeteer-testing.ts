
import {Details} from "../types.js"

export async function executePuppeteerTesting(details: Details) {

	const {runPuppeteer} = await import("./runners/run-puppeteer.js")

	await runPuppeteer(details)
}
