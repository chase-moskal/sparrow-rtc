
import {EstablishChannels} from "../types.js"
import {SparrowClient} from "./parts/sparrow-client.js"
import {standardRtcConfig} from "./standard-rtc-config.js"
import {standardDataChannels} from "../api/parts/establish_channels.js"
import {real_websocket_clientizer} from "./parts/real_websocket_clientizer.js"

export class Sparrow extends SparrowClient {
	static standardRtcConfig = standardRtcConfig
	static standardDataChannels = standardDataChannels

	constructor(o: {
			url: string
			rtcConfig: RTCConfiguration
			establishChannels: EstablishChannels<unknown>
		}) {

		super(real_websocket_clientizer({
			...o,
			onChannelsReady: (peer, connection) => this.onChannelsReady.publish(peer, connection),
			onConnectionStatus: status => this.onConnectionStatus.publish(status),
			handleConnectionClosed: () => { this.close() },
		}))
	}
}

