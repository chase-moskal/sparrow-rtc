
import * as Renraku from "renraku"

import {Pubsub, pubsub} from "../../toolbox/pubsub.js"
import {serverMetas} from "../api/parts/metas.js"
import {makeBrowserApi} from "../api/browser-api.js"
import {standardRtcConfig} from "./standard-rtc-config.js"
import {standardDataChannels} from "../api/parts/establish_channels.js"
import {ConnectionStatus, EstablishChannels, ReputationClaim, ServerRemote} from "../types.js"

export class Sparrow<Channels> {
	static standardRtcConfig = standardRtcConfig
	static standardDataChannels = standardDataChannels

	#url: string
	#claim: ReputationClaim | null = null
	#establishChannels: EstablishChannels<Channels>

	#connection: SparrowSocket | null = null
	get isConnected() { return !!this.#connection }

	onConnectionChange = pubsub<[]>()
	onChannelsReady: Pubsub<[RTCPeerConnection, unknown]> = pubsub()
	onConnectionStatus: Pubsub<[ConnectionStatus]> = pubsub()

	constructor(o: {
			url: string
			claim: ReputationClaim | null
			establishChannels: EstablishChannels<Channels>
		}) {

		this.#url = o.url
		this.#claim = o.claim
		this.#establishChannels = o.establishChannels
	}

	async requireConnection() {
		if (this.#connection)
			return this.#connection

		this.#connection = await Renraku.webSocketClient({
			link: this.#url,
			timeout: 10_000,
			serverMetas: serverMetas(async() => {
				const claim = this.#claim
				if (!claim) throw new Error("no claim")
				return {claim}
			}),
			handleConnectionClosed: () => {
				this.#connection = null
			},
			clientApi: serverRemote => makeBrowserApi({
				server: serverRemote,
				rtcConfig: standardRtcConfig,
				establishChannels: this.#establishChannels,
				onConnectionStatus: status => this.onConnectionStatus.publish(status),
				onChannelsReady: (peer, channels) => this.onChannelsReady.publish(peer, channels),
			}),
		})

		this.#claim = await this.#connection.remote.v1.basic.claimReputation(this.#claim)
		this.onConnectionChange.publish()

		return this.#connection.remote
	}
}

///////////////////////////////////////

type SparrowSocket = {
	remote: ServerRemote
	close: () => void
}

