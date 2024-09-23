
import * as Renraku from "renraku"

import {Core} from "../../core/core.js"
import {serverMetas} from "../../api/parts/metas.js"
import {BrowserRemote, Clientizer, ConnectionStatus, ServerRemote} from "../../types.js"

export function mock_websocket_clientizer(o: {
		core: Core
		onChannelsReady: (peer: RTCPeerConnection, channels: unknown) => void
		onConnectionStatus: (status: ConnectionStatus) => void
		handleConnectionClosed: () => void
	}): Clientizer {

	return async claim => {
		const browser = mockBrowser()
		const socket = mockSocketConnection(browser)
		const {handling} = o.core.connections.accept(socket)
		const remote = (
			Renraku.mock()
				.forApi(handling.api)
				.withMetas(serverMetas(async() => {
					if (!claim) throw new Error("no claim")
					return {claim}
				}))
		) as ServerRemote
		return {remote, close: () => {}}
	}
}

function mockSocketConnection(browser: BrowserRemote): Renraku.SocketConnection {
	return {
		headers: {},
		controls: {ping: () => {}, close: () => {}},
		prepareClientApi: () => browser as any,
	}
}

function mockBrowser(): BrowserRemote {
	return {v1: {partner: {
		async acceptIceCandidate(ice) {},
		async startPeerConnection() {},
		async acceptAnswer(answer) {},
		async produceOffer() {},
		async produceAnswer(offer) {},
		async waitUntilReady() {},
	}}}
}

