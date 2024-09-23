
import {Core} from "../core/core.js"
import {SparrowClient} from "./parts/sparrow-client.js"
import {mock_websocket_clientizer} from "./parts/mock_websocket_clientizer.js"

export class SparrowMock extends SparrowClient {
	constructor(o: {core: Core}) {
		super(mock_websocket_clientizer({
			...o,
			onChannelsReady: (peer, connection) => this.onChannelsReady.publish(peer, connection),
			onConnectionStatus: status => this.onConnectionStatus.publish(status),
			handleConnectionClosed: () => { this.close() },
		}))
	}
}

