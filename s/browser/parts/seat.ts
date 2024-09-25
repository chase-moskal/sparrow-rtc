
import {Cable} from "../../negotiation/types.js"
import {RoomInfo} from "../../signaling/parts/rooms.js"

export class Seat<Channels> {
	constructor(
		public room: RoomInfo,
		public cable: Cable<Channels>,
	) {}
}

