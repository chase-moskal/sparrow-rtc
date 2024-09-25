
import {Member} from "./member.js"
import {Contact} from "./contact.js"
import {Sparrow} from "../sparrow.js"
import {RoomInfo} from "../../signaling/parts/rooms.js"
import {PersonInfo} from "../../signaling/parts/people.js"
import {Cable} from "../../negotiation/types.js"

/** room from the client's perspective */
export class ClientRoom<Channels> {
	host: Contact<Channels>
	members = new Set<Member | Contact<Channels>>()

	constructor(
			public sparrow: Sparrow<Channels>,
			public room: RoomInfo,
			public hostPersonInfo: PersonInfo,
			public hostCable: Cable<Channels>,
		) {

		this.host = new Contact(hostPersonInfo, hostCable)

		for (const person of room.participants) {
			this.members.add(
				(person.id === this.host.id)
					? this.host
					: new Member(person)
			)
		}
	}
}

