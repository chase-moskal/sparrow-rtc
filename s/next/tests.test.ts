
import {Suite, expect} from "cynic"
import * as Renraku from "renraku"

import {Core} from "./core/core.js"
import {serverMetas} from "./api/utils/metas.js"
import {BrowserRemote, ServerRemote} from "./types.js"

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

function mockSocketConnection(browser: BrowserRemote): Renraku.SocketConnection {
	return {
		headers: {},
		controls: {ping: () => {}, close: () => {}},
		prepareClientApi: () => browser as any,
	}
}

function setup() {
	const core = new Core()
	return {
		core,
		connect() {
			const browser = mockBrowser()
			const socket = mockSocketConnection(browser)
			const {handling} = core.acceptConnection(socket)
			return {
				close: () => handling.handleConnectionClosed(),
				serverRemote: (
					Renraku.mock()
						.forApi(handling.api)
						.withMetaMap(serverMetas)
				) as ServerRemote,
			}
		},
	}
}

export default <Suite>{
	"scenarios": {
		async "user creates an reputation"() {
			const server = setup()
			const user = server.connect()
			const reputation = await user.serverRemote.v1.basic.createIdentity()
			expect(reputation).ok()
			expect(reputation.id).ok()
			expect(reputation.secret).ok()
		},
	},
}

