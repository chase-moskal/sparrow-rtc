
import {stdUrl} from "./std/url.js"
import {connect} from "./std/connect.js"
import {Pubsub} from "../tools/pubsub.js"
import {stdRtcConfig} from "./std/rtc-config.js"
import {stdOptions} from "./std/connect-options.js"
import {DoorPolicies} from "./host/room-policies.js"
import {allowEveryone} from "./std/allow-everyone.js"
import {attachEvents} from "../tools/attach-events.js"
import {stdDataChannels} from "./std/data-channels.js"
import {SignalingApi, Stats} from "../signaling/api.js"
import {HostingOptions, RoomSettings} from "../signaling/parts/rooms.js"
import {Cable, StdDataChannels} from "../negotiation/types.js"
import {ConnectionReport} from "../negotiation/partnerutils/connection-report.js"
import {HostRoom} from "./host/room.js"

export class Sparrow<Channels> {
	static stdOptions = stdOptions

	static stdUrl = stdUrl
	static stdRtcConfig = stdRtcConfig
	static stdDataChannels = stdDataChannels

	static connect = connect
	static allowEveryone = allowEveryone

	ping?: number
	stats?: Stats
	timeout?: any

	constructor(
			public socket: WebSocket,
			public signalingApi: SignalingApi,
			public doorPolicies: DoorPolicies,
			public onCable: Pubsub<[Cable<Channels>]>,
			public onReport: Pubsub<[ConnectionReport]>,
		) {

		const cleanup = () => this.#cleanup()

		attachEvents(socket, {
			error: cleanup,
			close: cleanup,
		})
	}

	async getStats() {
		return this.signalingApi.basic.stats()
	}

	async host(options: HostingOptions) {
		this.#requireConnectionToSignalingServer()
		const room = await this.signalingApi.rooms.host({
			label: options.label,
			discoverable: options.discoverable,
		})
		return new HostRoom(this, room)
	}

	async join(roomId: string) {
		this.#requireConnectionToSignalingServer()
		const room = await this.signalingApi.rooms.join(roomId)
		const [cable] = await this.onCable.once()
		return room && new ClientRoom(this, room, cable)
	}

	#cleanup() {
		this.#stopPinging()
	}

	disconnect() {
		this.#cleanup()
		this.socket.close()
	}

	#startPinging() {
		this.timeout = setTimeout(async() => {
			const before = Date.now()
			this.stats = await this.getStats()
			this.ping = Date.now() - before

			this.#startPinging()
		}, 3000)
	}

	#stopPinging() {
		if (this.timeout)
			clearTimeout(this.timeout)
		this.timeout = undefined
	}

	#requireConnectionToSignalingServer() {
		if (this.socket.readyState !== this.socket.OPEN)
			throw new Error("socket is disconnected, cannot continue")
	}
}

