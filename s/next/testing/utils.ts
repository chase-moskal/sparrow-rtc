
import * as Renraku from "renraku"

import {Core} from "../core/core.js"
import {serverMetas} from "../api/parts/metas.js"
import {BrowserRemote, ReputationClaim, ServerRemote} from "../types.js"

export function setup() {
	const core = new Core()
	return {
		core,
		async connect() {
			let claim: ReputationClaim | null = null
			const browser = mockBrowser()
			const socket = mockSocketConnection(browser)
			const {handling} = core.connections.accept(socket)
			const server = (
				Renraku.mock()
					.forApi(handling.api)
					.withMetas(serverMetas(async() => {
						if (!claim) throw new Error("no claim")
						return {claim}
					}))
			) as ServerRemote
			claim = await server.v1.basic.claimReputation(claim)
			return {
				server,
				close: () => handling.handleConnectionClosed(),
			}
		},
	}
}

/////////////////////////////////////////////

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

