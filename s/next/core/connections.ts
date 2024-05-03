
import {Id} from "../types.js"
import {SignalConnection} from "../serving/signal-connection.js"

export class Connections {
	#map = new Map<Id, SignalConnection>()

	add(connection: SignalConnection) {
		this.#map.set(connection.id, connection)
	}

	get(id: Id) {
		const connection = this.#map.get(id)
		if (!connection) throw new Error("connection not found")
		return connection
	}

	delete(id: Id) {
		this.#map.delete(id)
	}
}

