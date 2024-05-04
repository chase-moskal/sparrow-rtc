
import {Core} from "../../core/core.js"
import {Session} from "../../core/session.js"
import {Connection} from "../../serving/connection.js"

export class ServerHelpers {
	constructor(private core: Core, private connection: Connection) {}

	haveIdentity() {
		const {identity} = this.connection
		if (!identity) throw new Error("invalid identity for this action")
		identity.touch()
		return identity
	}

	areSessionHost(session: Session) {
		const identity = this.haveIdentity()
		if (session.host === identity.id) return identity
		else throw new Error("not host of session")
	}
}

