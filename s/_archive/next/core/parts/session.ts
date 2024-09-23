
import {Reputation} from "./reputation.js"
import {hex_id} from "../../../toolbox/id.js"
import {Id, SessionData, SessionInfo} from "../../types.js"

export class Session {

	// public
	readonly id = hex_id()
	readonly timeCreated = Date.now()
	readonly clients = new Set<Id>()
	label = "session"
	discoverable = false
	maxClients = 16

	// private
	readonly secret = hex_id()
	constructor(public host: Reputation) {}

	asPublicInfo(): SessionInfo {
		return {
			id: this.id,
			label: this.label,
			timeCreated: this.timeCreated,
			clientCount: this.clients.size,
			discoverable: this.discoverable,
		}
	}

	asPrivateDataForHost(): SessionData {
		return {
			...this.asPublicInfo(),
			secret: this.secret,
			hostId: this.host.id,
		}
	}
}

