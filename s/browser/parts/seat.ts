
import {Sparrow} from "../sparrow.js"
import {Cable} from "../../negotiation/types.js"
import {RoomInfo} from "../../signaling/parts/rooms.js"

export class Seat<Channels> {
	constructor(
		public sparrow: Sparrow<Channels>,
		public room: RoomInfo,
		public cable: Cable<Channels>,
	) {}
}

