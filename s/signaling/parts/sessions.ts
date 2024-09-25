
import {Person} from "./people.js"
import {Pool} from "../../tools/map2.js"
import {hexId} from "../../tools/hex-id.js"

// TODO rename sessions to 'rooms'

export class Sessions extends Pool<Session> {
	getInfo(sessionId: string) {
		const session = this.get(sessionId)
		return session
			? session.info()
			: undefined
	}

	list({limit}: SessionListOptions): SessionInfo[] {
		let count = 0
		const results: SessionInfo[] = []
		for (const session of this.values()) {
			results.push(session.info())
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

	info(): SessionInfo {
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

	secretInfo(): SessionSecretInfo {
		return {
			...this.info(),
			secret: this.secret,
		}
	}
}

export type SessionListOptions = {
	limit: number
}

export type SessionSettings = {
	label: string
	discoverable: boolean
}

export type SessionInfo = {
	id: string
	label: string
	discoverable: boolean
	hostId: string
	peopleCount: number
}

export type SessionSecretInfo = SessionInfo & {
	secret: string
}

