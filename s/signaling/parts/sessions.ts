
import {Person} from "./people.js"
import {Pool} from "../../tools/map2.js"
import {hexId} from "../../tools/hex-id.js"

export class Sessions extends Pool<Session> {
	list({limit}: SessionListOptions) {
		let count = 0
		const results: Session[] = []
		for (const session of this.values()) {
			results.push(session)
			if (count++ >= limit)
				break
		}
		return results
	}
}

export class Session {
	id = hexId()
	secret = hexId()
	participants = new Set<Person>()

	constructor(
			public host: Person,
			public settings: SessionSettings,
		) {
		this.participants.add(host)
	}

	secretInfo() {
		return {secret: this.secret, ...this.publicInfo()}
	}

	publicInfo() {
		const {id, settings} = this
		const hostId = this.host.id
		const headCount = this.participants.size
		return {id, hostId, headCount, settings}
	}
}

export type SessionListOptions = {
	limit: number
}

export type SessionSettings = {
	label: string
	discoverable: boolean
}

