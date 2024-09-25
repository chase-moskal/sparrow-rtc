
import {expose, webSocketRemote} from "renraku"

import {version} from "../version.js"
import {makeBrowserApi} from "./api.js"
import {ConnectOptions} from "./types.js"
import {SignalingApi} from "../signaling/api.js"
import {Pubsub, pubsub} from "../tools/pubsub.js"
import {openPromise} from "../tools/open-promise.js"
import {HappyConnection} from "../negotiation/types.js"
import {RoomSettings} from "../signaling/parts/rooms.js"
import {standardRtcConfig} from "../negotiation/partnerutils/rtc-config.js"
import {ConnectionReport} from "../negotiation/partnerutils/connection-report.js"
import {StandardDataChannels, standardDataChannels} from "../negotiation/partnerutils/establish-channels.js"

export class Sparrow<Channels> {
	static options(): ConnectOptions<StandardDataChannels> {
		return {
			url: "wss://sparrow.benev.gg/",
			rtcConfig: standardRtcConfig,
			establishChannels: standardDataChannels,
			allowJoin: async() => true,
		}
	}

	static async connect<Channels>(options: ConnectOptions<Channels>) {
		const onReady = pubsub<[HappyConnection<Channels>]>()
		const onReport = pubsub<[ConnectionReport]>()

		const {socket, fns: signalingApi} = await webSocketRemote<SignalingApi>({
			url: options.url,
			getLocalEndpoint: signalingApi => expose(() => makeBrowserApi({
				allowJoin: options.allowJoin,
				partner: {
					signalingApi,
					rtcConfig: options.rtcConfig,
					establishChannels: options.establishChannels,
					onReady: onReady.publish,
					onReport: onReport.publish,
				},
			})),
		})

		await signalingApi.hello(version)

		return new this<Channels>(socket, signalingApi, onReady, onReport)
	}

	constructor(
		public socket: WebSocket,
		public signalingApi: SignalingApi,
		public onReady: Pubsub<[HappyConnection<Channels>]>,
		public onReport: Pubsub<[ConnectionReport]>,
	) {}

	disconnect() {
		this.socket.close()
	}

	#requireConnectionToSignalingServer() {
		if (this.socket.readyState !== this.socket.OPEN)
			throw new Error("socket is disconnected, cannot continue")
	}

	async host(settings: RoomSettings) {
		this.#requireConnectionToSignalingServer()
		return await this.signalingApi.rooms.host(settings)
	}

	async join(options: {
			roomId: string
			onReport?: (report: ConnectionReport) => void
		}) {

		this.#requireConnectionToSignalingServer()

		const connection = openPromise<HappyConnection<Channels>>()
		const unlisten1 = this.onReport(options.onReport ?? (() => {}))
		const unlisten2 = this.onReady(connection.resolve)

		try {
			const room = await this.signalingApi.rooms.join(options.roomId)
			return room
				? {room, connection: await connection.promise}
				: false
		}
		finally {
			unlisten1()
			unlisten2()
		}
	}
}

