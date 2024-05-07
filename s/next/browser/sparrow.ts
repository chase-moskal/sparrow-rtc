
import * as Renraku from "renraku"

import {pubsub} from "../../toolbox/pubsub.js"
import {serverMetas} from "../api/parts/metas.js"
import {makeBrowserApi} from "../api/browser-api.js"
import {standardRtcConfig} from "./standard-rtc-config.js"
import {standardDataChannels} from "../api/parts/establish_channels.js"
import {ConnectionStatus, EstablishChannels, ReputationClaim, SocketClient} from "../types.js"

export class Sparrow<Channels> {
	static standardRtcConfig = standardRtcConfig
	static standardDataChannels = standardDataChannels

	#url: string
	#establishChannels: EstablishChannels<Channels>
	claim: ReputationClaim | null = null

	constructor(o: {
			url: string
			claim: ReputationClaim | null
			establishChannels: EstablishChannels<Channels>
		}) {

		this.#url = o.url
		this.#establishChannels = o.establishChannels
		this.claim = o.claim
	}

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

		this.#socket = await Renraku.webSocketClient({
			link: this.#url,
			timeout: 10_000,
			serverMetas: serverMetas(async() => {
				const claim = this.claim
				if (!claim) throw new Error("no claim")
				return {claim}
			}),
			handleConnectionClosed: () => {
				this.#socket = null
			},
			clientApi: serverRemote => makeBrowserApi({
				server: serverRemote,
				rtcConfig: standardRtcConfig,
				establishChannels: this.#establishChannels,
				onConnectionStatus: status => this.onConnectionStatus.publish(status),
				onChannelsReady: (peer, channels) => this.onChannelsReady.publish(peer, channels),
			}),
		})

		const {remote} = this.#socket
		const claim = await remote.v1.basic.claimReputation(this.claim)
		this.claim = claim
		this.onConnectionChange.publish()

		return {remote, claim}
	}
}

