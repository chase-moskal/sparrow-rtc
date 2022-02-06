
import {HeartbeatOptions} from "./types.js"
import {randomId} from "../toolbox/random-id.js"
import {standardRtcConfig} from "../connect/utils/standard-rtc-config.js"
import {parseHashForSessionId} from "../toolbox/links/parse-hash-for-session-id.js"
import {initializeHeartbeatHost} from "./initializers/initialize-heartbeat-host.js"
import {initializeHeartbeatClient} from "./initializers/initialize-heartbeat-client.js"

const options: HeartbeatOptions = {
	signalServerUrl: location.host === "localhost:8080"
		? `ws://${location.hostname}:8192/`
		: `wss://sparrow-rtc.benevolent.games/`,
	timeout: 30_000,
	heartbeatPeriod: 101,
	rtcConfig: standardRtcConfig,
}

void async function main() {
	console.log("💖 sparrow demo")
	const sessionId = parseHashForSessionId(location.hash, "session")
	const app = <HTMLElement>document.querySelector(".app")
	if (sessionId)
		await initializeHeartbeatClient({
			...options, app, sessionId,
		})
	else
		await initializeHeartbeatHost({
			...options, app, sessionLabel: `test session ${randomId()}`,
		})
	console.log("🌠 connected")
}()
