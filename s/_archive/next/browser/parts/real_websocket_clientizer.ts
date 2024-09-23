
import * as Renraku from "renraku"
import {serverMetas} from "../../api/parts/metas.js"
import {makeBrowserApi} from "../../api/browser-api.js"
import {Clientizer, ConnectionStatus, EstablishChannels} from "../../types.js"

export function real_websocket_clientizer({
		url,
		rtcConfig,
		establishChannels,
		onChannelsReady,
		onConnectionStatus,
		handleConnectionClosed,
	}: {
		url: string
		rtcConfig: RTCConfiguration
		establishChannels: EstablishChannels<unknown>
		onChannelsReady: (peer: RTCPeerConnection, channels: unknown) => void
		onConnectionStatus: (status: ConnectionStatus) => void
		handleConnectionClosed: () => void
	}): Clientizer {

	return async claim => Renraku.webSocketClient({
		link: url,
		timeout: 10_000,
		handleConnectionClosed,
		serverMetas: serverMetas(async() => {
			if (!claim) throw new Error("no claim")
			return {claim}
		}),
		clientApi: serverRemote => makeBrowserApi({
			server: serverRemote,
			rtcConfig,
			onChannelsReady,
			establishChannels,
			onConnectionStatus,
		}),
	})
}

