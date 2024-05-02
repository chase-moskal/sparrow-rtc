
import {hex_id} from "../../toolbox/id.js"

export class Session {
	readonly id = hex_id()
	readonly secret = hex_id()
	readonly timeCreated = Date.now()
	readonly clients = new Set<string>()
	label = "session"
	discoverable = false
}

