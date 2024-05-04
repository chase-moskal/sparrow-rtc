
import {Session} from "../../types.js"
import {ReputationClaim} from "../types.js"
import {hex_id} from "../../toolbox/id.js"
import {Connection} from "./connection.js"

export class Reputation {
	readonly id = hex_id()
	readonly secret = hex_id()

	lastContact = Date.now()

	hosting: Session | null = null
	connection: Connection | null = null

	readonly claim: ReputationClaim = {
		id: this.id,
		secret: this.secret,
	}

	touch() {
		this.lastContact = Date.now()
	}
}

