
import * as Renraku from "renraku"

import {pubsub} from "../../toolbox/pubsub.js"
import {serverMetas} from "../api/parts/metas.js"
import {makeBrowserApi} from "../api/browser-api.js"
import {standardRtcConfig} from "./standard-rtc-config.js"
import {standardDataChannels} from "../api/parts/establish_channels.js"
import {ConnectionStatus, EstablishChannels, ReputationClaim, SocketClient} from "../types.js"

export type Clientizer = (claim: ReputationClaim | null) => Promise<SocketClient>

export function realClient({
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

export class SparrowClient {
	#socket: SocketClient | null = null
	claim: ReputationClaim | null = null
	onConnectionChange = pubsub<[]>()
	onConnectionStatus = pubsub<[ConnectionStatus]>()
	onChannelsReady = pubsub<[RTCPeerConnection, unknown]>()

	constructor(public clientizer: Clientizer) {}

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

		this.#socket = await this.clientizer(this.claim)
		const {remote} = this.#socket
		const claim = await remote.v1.basic.claimReputation(this.claim)
		this.claim = claim
		this.onConnectionChange.publish()

		return {remote, claim}
	}
}

export class Sparrow extends SparrowClient {
	static standardRtcConfig = standardRtcConfig
	static standardDataChannels = standardDataChannels

	constructor(o: {
			url: string
			rtcConfig: RTCConfiguration
			establishChannels: EstablishChannels<unknown>
		}) {
		super(realClient({
			...o,
			onChannelsReady: (peer, connection) => this.onChannelsReady.publish(peer, connection),
			onConnectionStatus: status => this.onConnectionStatus.publish(status),
			handleConnectionClosed: () => { this.close() },
		}))
	}
}

