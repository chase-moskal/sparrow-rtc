
import {Seat} from "./parts/seat.js"
import {Throne} from "./parts/throne.js"
import {connect} from "./std/connect.js"
import {Pubsub} from "../tools/pubsub.js"
import {stdRtcConfig} from "./std/rtc-config.js"
import {SignalingApi} from "../signaling/api.js"
import {stdOptions} from "./std/connect-options.js"
import {allowEveryone} from "./std/allow-everyone.js"
import {stdDataChannels} from "./std/data-channels.js"
import {RoomSettings} from "../signaling/parts/rooms.js"
import {Cable, StandardDataChannels} from "../negotiation/types.js"
import {ConnectionReport} from "../negotiation/partnerutils/connection-report.js"

export class Sparrow<Channels> {
	static stdOptions = stdOptions
	static stdRtcConfig = stdRtcConfig
	static stdDataChannels = stdDataChannels

	static connect = connect
	static allowEveryone = allowEveryone

	constructor(
		public socket: WebSocket,
		public signalingApi: SignalingApi,
		public onCable: Pubsub<[Cable<Channels>]>,
		public onReport: Pubsub<[ConnectionReport]>,
	) {}

	async host(settings: RoomSettings) {
		this.#requireConnectionToSignalingServer()
		const room = await this.signalingApi.rooms.host(settings)
		return new Throne(room)
	}

	async join(roomId: string) {
		this.#requireConnectionToSignalingServer()
		const cablePromise = this.onCable.once(x => x)
		const result = await this.signalingApi.rooms.join(roomId)
		return "room" in result
			? new Seat(result.room, await cablePromise)
			: result
	}

	disconnect() {
		this.socket.close()
	}

	#requireConnectionToSignalingServer() {
		if (this.socket.readyState !== this.socket.OPEN)
			throw new Error("socket is disconnected, cannot continue")
	}
}

