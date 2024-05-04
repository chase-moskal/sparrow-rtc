
import {Core} from "../../core/core.js"
import {Reputation} from "../reputation.js"

const how_many_minutes = 10

export function delete_identities_after_awhile(core: Core) {
	const now = Date.now()
	const deathrow: Reputation[] = []

	for (const identity of core.identities.values()) {
		const since = now - identity.lastContact
		const lifespan = how_many_minutes * (60_000)
		if (since > lifespan)
			deathrow.push(identity)
	}

	for (const identity of deathrow)
		core.identities.delete(identity.id)
}

