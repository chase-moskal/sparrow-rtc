
import {Core} from "../../core/core.js"
import {Identity} from "../identity.js"

const how_many_minutes = 10

export default function(core: Core) {
	const now = Date.now()
	const deathrow: Identity[] = []

	for (const identity of core.identities.values()) {
		const since = now - identity.lastContact
		const lifespan = how_many_minutes * (60_000)
		if (since > lifespan)
			deathrow.push(identity)
	}

	for (const identity of deathrow)
		core.identities.delete(identity.id)
}

