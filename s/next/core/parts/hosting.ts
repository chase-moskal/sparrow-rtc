
import {Id} from "../../types"

export class Hosting {
	#sessionAndHost = new Map<Id, Id>()
	#hostAndSession = new Map<Id, Id>()

	constructor() {}

	setHost({sessionId, reputationId}: {sessionId: Id, reputationId: Id}) {
		this.#sessionAndHost.set(sessionId, reputationId)
		this.#hostAndSession.set(reputationId, sessionId)
	}

	isHost({sessionId, reputationId}: {sessionId: Id, reputationId: Id}) {
		return this.#sessionAndHost.get(sessionId) === reputationId
	}

	getHost(sessionId: Id) {
		return this.#sessionAndHost.get(sessionId)
	}

	getSession(reputationId: Id) {
		return this.#hostAndSession.get(reputationId)
	}
}

