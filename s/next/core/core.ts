
import * as Renraku from "renraku"

import {IdMap} from "./parts/id-map.js"
import {Session} from "./parts/session.js"
import {BrowserApi, Id} from "../types.js"
import {Reputation} from "./parts/reputation.js"
import {Connection} from "./parts/connection.js"
import {browserMetas} from "../api/parts/metas.js"
import {makeServerApi} from "../api/server-api.js"

export class Core {
	#reputations = new IdMap<Reputation>()
	#connections = new IdMap<Connection>()
	#sessions = new IdMap<Session>()

	connections = {
		getByReputation: (reputation: Reputation) => {
			for (const connection of this.#connections.values()) {
				if (connection.reputation === reputation)
					return connection
			}
			return null
		},

		accept: (
				socket: Renraku.SocketConnection,
				browser = socket.prepareClientApi<BrowserApi>(browserMetas),
			) => {
			const serverApi = makeServerApi(this, () => connection)
			const connection = new Connection(socket, browser)
			this.#connections.add(connection)
			const handling: Renraku.SocketHandling = {
				api: serverApi,
				handleConnectionClosed: () => {
					this.#connections.delete(connection.id)
				},
			}
			return {connection, handling}
		},
	}

	reputations = {
		get: (id: Id) => this.#reputations.get(id),
		require: (id: Id) => this.#reputations.require(id),

		create: (connection: Connection) => {
			const reputation = new Reputation()
			this.#reputations.set(reputation.id, reputation)
			connection.reputation = reputation
			return reputation
		},

		cull: () => {
			const how_many_minutes = 10
			const now = Date.now()
			const deathrow: Reputation[] = []
			for (const reputation of this.#reputations.values()) {
				const since = now - reputation.lastContact
				const lifespan = how_many_minutes * (60_000)
				if (since > lifespan)
					deathrow.push(reputation)
			}
			for (const reputation of deathrow) {
				this.#reputations.delete(reputation.id)
				const session = this.sessions.getByHost(reputation)
				if (session)
					this.sessions.terminate(session)
			}
		},
	}

	sessions = {
		all: () => this.#sessions.values(),
		get: (id: Id) => this.#sessions.get(id),
		require: (id: Id) => this.#sessions.require(id),

		getByHost: (host: Reputation) => {
			for (const session of this.#sessions.values()) {
				if (session.host === host)
					return session
			}
			return null
		},

		create: (host: Reputation) => {
			const session = new Session(host)
			this.#sessions.add(session)
			return session
		},

		terminate: (session: Session) => {
			this.#sessions.delete(session.id)
			for (const connectionId of session.clients) {
				const connection = this.#connections.require(connectionId)
				connection.socket.controls.close()
			}
		},
	}
}

