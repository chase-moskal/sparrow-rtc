
import {Core} from "../../core/core.js"
import {Session} from "../../core/session.js"
import {Connection} from "../../serving/connection.js"

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
		if (session.host === reputation.id) return reputation
		else throw new Error("not host of session")
	}
}

