
import {ConnectOptions} from "../types.js"
import {stdRtcConfig} from "./rtc-config.js"
import {allowEveryone} from "./allow-everyone.js"
import {stdDataChannels} from "./data-channels.js"
import {StdDataChannels} from "../../negotiation/types.js"

export function stdOptions(): ConnectOptions<StdDataChannels> {
	return {
		url: "wss://sparrow.benev.gg/",
		rtcConfig: stdRtcConfig(),
		channelsConfig: stdDataChannels(),
		allowJoin: allowEveryone(),
	}
}

