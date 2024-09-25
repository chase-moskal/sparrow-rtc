

import {Sparrow} from "../sparrow.js"
import {RoomInfo} from "../../signaling/parts/rooms.js"
import {PersonInfo} from "../../signaling/parts/people.js"
import {Member} from "./member.js"
import {Contact} from "./contact.js"

/** room from the host's perspective */
export class HostRoom<Channels> {
	members = new Set<Member | Contact<Channels>>()
	#disposers: (() => void)[] = []

	constructor(
			public sparrow: Sparrow<Channels>,
			public room: RoomInfo,
			public host: PersonInfo,
		) {

		this.#disposers.push(
			sparrow.onCable(cable => {})
		)

		for (const person of room.participants) {
			this.members.add(
				(person.id === host.id)
					? new Member(person)
					: new Contact()
			)
		}
	}

	terminate() {}
}

