
import {webSocketClient} from "renraku"

import {SignalBrowserClient, SignalBrowserHost} from "../../types.js"
import {makeSignalServerApi} from "../../signal/apis/make-signal-server-api.js"
import {makeSignalBrowserApi} from "../../signal/apis/make-signal-browser-api.js"

interface CommonOptions {
	url: string
	onConnectionLost: () => void
}

interface HostOptions extends CommonOptions {
	host: SignalBrowserHost
}

interface ClientOptions extends CommonOptions {
	client: SignalBrowserClient
}

type ConnectOptions = HostOptions | ClientOptions

const duds = {
	host: <SignalBrowserHost>{
		async handleJoiner() { throw new Error("nope") },
		async handleAnswer() { throw new Error("nope") },
		async handleIceCandidates() { throw new Error("nope") },
	},
	client: <SignalBrowserClient>{
		async handleOffer() { throw new Error("nope") },
		async handleIceCandidates() { throw new Error("nope") },
	},
}

export async function connectToSignalServer(options: ConnectOptions) {
	const {remote, close} = await webSocketClient<ReturnType<typeof makeSignalServerApi>>({
		link: options.url,
		timeout: 10_000,
		clientApi: () => makeSignalBrowserApi(
			(<HostOptions>options).host?
				{host: (<HostOptions>options).host, client: duds.client}:
				{client: (<ClientOptions>options).client, host: duds.host}
		),
		handleConnectionClosed() {
			options.onConnectionLost()
		},
		serverMetas: {
			hosting: async() => {},
			discovery: async() => {},
			connecting: async() => {},
		},
	})
	return {
		signalServer: remote,
		close,
	}
}
