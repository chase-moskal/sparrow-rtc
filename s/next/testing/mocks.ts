
import * as Renraku from "renraku"

import {Core} from "../core/core.js"
import {serverMetas} from "../api/parts/metas.js"
import {Clientizer, SparrowClient} from "../browser/sparrow.js"
import {BrowserRemote, ConnectionStatus, ReputationClaim, ServerRemote} from "../types.js"

export class ServerMock {
	core = new Core()

	browser(claim: ReputationClaim | null) {
		const sparrow = new SparrowMock({core: this.core})
		sparrow.claim = claim
		return sparrow
	}
}

export class SparrowMock extends SparrowClient {
	constructor(o: {core: Core}) {
		super(mockClient({
			...o,
			onChannelsReady: (peer, connection) => this.onChannelsReady.publish(peer, connection),
			onConnectionStatus: status => this.onConnectionStatus.publish(status),
			handleConnectionClosed: () => { this.close() },
		}))
	}
}

///////////////////////////////////////

function mockClient(o: {
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

