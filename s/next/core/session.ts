
import {Id} from "../types.js"
import {hex_id} from "../../toolbox/id.js"

export class Session {
	readonly id = hex_id()
	readonly secret = hex_id()
	readonly timeCreated = Date.now()
	readonly clients = new Set<string>()

	owner: Id
	label = "session"
	discoverable = false

	constructor(o: {owner: Id}) {
		this.owner = o.owner
	}
}

