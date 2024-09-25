
import {ExposedError} from "renraku"

import {Core} from "./core.js"
import {version} from "../version.js"
import {Person} from "./parts/people.js"
import {Partner} from "../negotiation/types.js"
import {Room, RoomInfo, RoomListOptions, RoomSettings} from "./parts/rooms.js"
import {negotiate_rtc_connection} from "../negotiation/negotiate_rtc_connection.js"

export type SignalingApi = ReturnType<typeof makeSignalingApi>

export type Stats = {
	roomCount: number
	peopleCount: number
}

export const makeSignalingApi = (core: Core, person: Person) => ({

	async hello(wantedVersion: number) {
		if (wantedVersion !== version)
			throw new ExposedError(`version error: signaling server is at v${version}, but the client wanted v${wantedVersion}`)
	},

	basic: {
		async stats(): Promise<Stats> {
			return {
				peopleCount: core.people.size,
				roomCount: core.rooms.size,
			}
		}
	},

	rooms: {
		async getInfo(roomId: string) {
			return core.rooms.getInfo(roomId)
		},

		async list(options: RoomListOptions) {
			return core.rooms.list(options)
		},

		async join(roomId: string): Promise<RoomInfo | false> {
			const room = core.rooms.require(roomId)
			const allowed = await room.host.browserApi.knock(person.id)
			if (allowed) {
				const hostPartner: Partner = {
					person: room.host,
					api: room.host.browserApi.partner,
				}
				const clientPartner: Partner = {
					person,
					api: person.browserApi.partner,
				}
				const success = await negotiate_rtc_connection(hostPartner, clientPartner)
				return success && room.info()
			}
			else {
				return false
			}
		},

		async host(settings: RoomSettings) {
			const room = new Room(person, settings)
			core.rooms.add(room)
			return room.secretInfo()
		},

		async terminate(roomId: string) {
			const room = core.rooms.require(roomId)
			if (room.host !== person)
				throw new ExposedError("you don't have permission to terminate this room")
			core.rooms.delete(roomId)
		},
	},

	negotiation: {
		async sendIceCandidate(ice: RTCIceCandidate) {
			await person.onIceCandidate.publish(ice)
		},
	},
})

