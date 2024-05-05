
import * as Renraku from "renraku"

import {IdMap} from "./parts/id-map.js"
import {Session} from "./parts/session.js"
import {BrowserApi, Id} from "../types.js"
import {Hosting} from "./parts/hosting.js"
import {Reputation} from "./parts/reputation.js"
import {Connection} from "./parts/connection.js"
import {browserMetas} from "../api/utils/metas.js"
import {makeServerApi} from "../api/server-api.js"

export class Core {
	readonly connections = new IdMap<Connection>()
	readonly reputations = new IdMap<Reputation>()
	readonly sessions = new IdMap<Session>()
	readonly hosting = new Hosting()

	createSession({hostReputationId}: {hostReputationId: Id}) {
		const session = new Session()
		this.sessions.add(session)
		this.hosting.setHost({
			sessionId: session.id,
			reputationId: hostReputationId,
		})
		return session
	}

	terminateSession(session: Session) {
		this.sessions.delete(session.id)
		for (const connectionId of session.clients) {
			const connection = this.connections.require(connectionId)
			connection.socket.controls.close()
		}
	}

	acceptConnection(
			socket: Renraku.SocketConnection,
			browser = socket.prepareClientApi<BrowserApi>(browserMetas),
		) {

		const serverApi = makeServerApi(this, () => connection)
		const connection = new Connection(socket, browser)
		this.connections.add(connection)

		const handling: Renraku.SocketHandling = {
			api: serverApi,
			handleConnectionClosed: () => {
				this.connections.delete(connection.id)
			},
		}

		return {connection, handling}
	}

	cullExpiredReputations() {
		const how_many_minutes = 10
		const now = Date.now()
		const deathrow: Reputation[] = []

		for (const reputation of this.reputations.values()) {
			const since = now - reputation.lastContact
			const lifespan = how_many_minutes * (60_000)
			if (since > lifespan)
				deathrow.push(reputation)
		}

		for (const reputation of deathrow) {
			this.reputations.delete(reputation.id)
			const sessionId = this.hosting.getSession(reputation.id)
			if (sessionId) {
				const session = this.sessions.require(sessionId)
				this.terminateSession(session)
			}
		}
	}
}

