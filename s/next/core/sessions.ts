
import {Id} from "../types.js"
import {Session} from "./session.js"

export class Sessions {
	#map = new Map<Id, Session>()

	add(session: Session) {
		this.#map.set(session.id, session)
	}

	get(id: Id) {
		const session = this.#map.get(id)
		if (!session) throw new Error("session not found")
		return session
	}

	delete(id: Id) {
		this.#map.delete(id)
	}
}

