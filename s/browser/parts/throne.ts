
import {Sparrow} from "../sparrow.js"
import {RoomInfo} from "../../signaling/parts/rooms.js"

export class Throne<Channels> {
	clients = new Map<string, any>()

	constructor(
		public sparrow: Sparrow<Channels>,
		public room: RoomInfo,
	) {}

	terminate() {}
}

