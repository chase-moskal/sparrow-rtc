
import {HeartbeatOptions} from "./heartbeat/types.js"
import {standardRtcConfig} from "../connect/utils/standard-rtc-config.js"
import {parseHashForSessionId} from "../toolbox/parse-hash-for-session-id.js"
import {initializeHeartbeatClient} from "./heartbeat/initialize-heartbeat-client.js"
import {initializeHeartbeatHost} from "./heartbeat/initialize-heartbeat-host.js"

const options: HeartbeatOptions = {
	signalServerUrl: `ws://${location.hostname}:8192/`,
	rtcConfig: standardRtcConfig,
	timeout: 10_000,
	heartbeatPeriod: 101,
}

void async function main() {
	console.log("💖 sparrow demo")
	const sessionId = parseHashForSessionId(location.hash)
	const app = <HTMLElement>document.querySelector(".app")
	if (sessionId)
		await initializeHeartbeatClient({...options, app, sessionId})
	else
		await initializeHeartbeatHost({...options, app})
	console.log("🌠 connected")
}()
