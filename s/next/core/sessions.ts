
import {Id} from "../types.js"
import {Session} from "./session.js"

export class Sessions {
	#map = new Map<Id, Session>()

	create() {
		const session = new Session()
		this.#map.set(session.id, session)
		return session
	}
}

