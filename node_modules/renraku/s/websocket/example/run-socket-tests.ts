
import {test, assert} from "cynic"
import {makeExampleSocketClient} from "./example-socket-browser.js"

export async function runSocketTests() {
	const {remote, close} = await makeExampleSocketClient()
	const tenSecondsAgo = () => Date.now() - 10_000
	const results = await test("renraku websocket suite", {

		"get server time": async() =>
			assert(await remote.serverService.getServerTime() > tenSecondsAgo()),

		"prompt server to get client time": async() =>
			assert(await remote.serverService.promptToAskBack() > tenSecondsAgo()),

	})
	close()
	return results
}
