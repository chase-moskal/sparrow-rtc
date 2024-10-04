
import {Person} from "./people.js"
import {Pool} from "../../tools/map2.js"
import {hexId} from "../../tools/hex-id.js"

export class Sessions extends Pool<Session> {}

export class Session {
	id = hexId()

	constructor(public host: Person) {}

	info(): SessionInfo {
		return {
			id: this.id,
			hostId: this.host.id,
		}
	}
}

export type SessionInfo = {
	id: string
	hostId: string
}

