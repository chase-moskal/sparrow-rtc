
import * as Renraku from "renraku"

import {Core} from "../core/core.js"
import {Sparrow} from "../browser/sparrow.js"
import {Public} from "../../toolbox/public.js"
import {pubsub} from "../../toolbox/pubsub.js"
import {serverMetas} from "../api/parts/metas.js"
import {StandardDataChannels} from "../api/parts/establish_channels.js"
import {BrowserRemote, ConnectionStatus, ReputationClaim, ServerRemote, SocketClient} from "../types.js"

export class ServerMock {
	core = new Core()

	browser(claim: ReputationClaim | null) {
		return new SparrowMock(this.core, claim)
	}
}

export class SparrowMock implements Public<Sparrow<StandardDataChannels>> {
	constructor(private core: Core, public claim: ReputationClaim | null) {}

	#socket: SocketClient | null = null
	onConnectionChange = pubsub<[]>()
	onConnectionStatus = pubsub<[ConnectionStatus]>()
	onChannelsReady = pubsub<[RTCPeerConnection, unknown]>()

	get connection() {
		const claim = this.claim
		const remote = this.#socket?.remote
		return (remote && claim)
			? {remote, claim}
			: null
	}

	close() {
		if (this.#socket) {
			this.#socket.close()
			this.#socket = null
			this.onConnectionChange.publish()
		}
	}

	async requireConnection() {
		const {connection} = this

		if (connection)
			return connection

		const browser = mockBrowser()
		const socket = mockSocketConnection(browser)
		const {handling} = this.core.connections.accept(socket)
		const remote = (
			Renraku.mock()
				.forApi(handling.api)
				.withMetas(serverMetas(async() => {
					if (!this.claim) throw new Error("no claim")
					return {claim: this.claim}
				}))
		) as ServerRemote

		this.claim = await remote.v1.basic.claimReputation(this.claim)
		this.onConnectionChange.publish()

		return {remote, claim: this.claim}
	}
}

///////////////////////////////////////

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

