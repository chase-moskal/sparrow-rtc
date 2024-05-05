
import {hex_id} from "../../../toolbox/id.js"
import {Id, SessionInfo} from "../../types.js"

export class Session {
	readonly id = hex_id()
	readonly secret = hex_id()
	readonly timeCreated = Date.now()
	readonly clients = new Set<Id>()

	label = "session"
	discoverable = false
	maxClients: number = 16

	asPublicInfo(): SessionInfo {
		return {
			id: this.id,
			label: this.label,
			timeCreated: this.timeCreated,
			clientCount: this.clients.size,
			discoverable: this.discoverable
		}
	}

	asPrivateDataForHost() {
		return {...this}
	}
}

