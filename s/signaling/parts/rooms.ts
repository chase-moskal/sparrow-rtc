
import {Person} from "./people.js"
import {Pool} from "../../tools/map2.js"
import {hexId} from "../../tools/hex-id.js"

export class Rooms extends Pool<Room> {
	getInfo(roomId: string) {
		const room = this.get(roomId)
		return room
			? room.info()
			: undefined
	}

	list({limit}: RoomListOptions): RoomInfo[] {
		let count = 0
		const results: RoomInfo[] = []
		for (const room of this.values()) {
			results.push(room.info())
			if (count++ >= limit)
				break
		}
		return results
	}
}

export class Room {
	id = hexId()
	participants = new Set<Person>()

	constructor(
			public host: Person,
			public settings: RoomSettings,
		) {
		this.participants.add(host)
	}

	info(): RoomInfo {
		const {id, settings} = this
		const hostId = this.host.id
		const peopleCount = this.participants.size
		return {
			id,
			hostId,
			peopleCount,
			label: settings.label,
			discoverable: settings.discoverable,
		}
	}
}

export type RoomListOptions = {
	limit: number
}

export type RoomSettings = {
	label: string
	discoverable: boolean
}

export type RoomInfo = {
	id: string
	label: string
	hostId: string
	peopleCount: number
	discoverable: boolean
}

