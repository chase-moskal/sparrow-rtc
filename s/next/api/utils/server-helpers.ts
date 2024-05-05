
import {Core} from "../../core/core.js"
import {Session} from "../../core/parts/session.js"
import {Connection} from "../../core/parts/connection.js"

export class ServerHelpers {
	constructor(private core: Core, private connection: Connection) {}

	haveReputation() {
		const {reputation} = this.connection
		if (!reputation) throw new Error("invalid reputation for this action")
		reputation.touch()
		return reputation
	}

	areSessionHost(session: Session) {
		const reputation = this.haveReputation()
		const isHost = this.core.hosting.isHost({
			sessionId: session.id,
			reputationId: reputation.id,
		})
		if (isHost) return reputation
		else throw new Error("not host of session")
	}
}

