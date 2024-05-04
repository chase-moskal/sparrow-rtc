
import {Id, SessionInfo} from "../types.js"
import {hex_id} from "../../toolbox/id.js"

export class Session {
	readonly id = hex_id()
	readonly secret = hex_id()
	readonly timeCreated = Date.now()
	readonly clients = new Set<Id>()

	label = "session"
	discoverable = false

	host: Id
	maxClients: number

	constructor(o: {
			host: Id,
			maxClients: number
		}) {
		this.host = o.host
		this.maxClients = o.maxClients
	}

	asPublicInfo(): SessionInfo {
		return {
			id: this.id,
			label: this.label,
			timeCreated: this.timeCreated,
			clientCount: this.clients.size,
			discoverable: this.discoverable
		}
	}

	asPrivateData() {
		return {...this}
	}
}

