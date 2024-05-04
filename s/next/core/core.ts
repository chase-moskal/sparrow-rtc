
import * as Renraku from "renraku"

import {IdMap} from "./id-map.js"
import {Session} from "./session.js"
import {BrowserApi, Id} from "../types.js"
import {browserMetas} from "../api/utils/metas.js"
import {makeServerApi} from "../api/server-api.js"
import {Reputation} from "../serving/reputation.js"
import {Connection} from "../serving/connection.js"

export class Core {
	readonly reputations = new IdMap<Reputation>()
	readonly sessions = new IdMap<Session>()
	readonly connections = new IdMap<Connection>()

	readonly sessionAndHost = new Map<Id, Id>()
	readonly hostAndSession = new Map<Id, Id>()

	setHost(sessionId: Id, reputationId: Id) {
		this.sessionAndHost.set(sessionId, reputationId)
		this.hostAndSession.set(reputationId, sessionId)
	}

	isHosting(sessionId: Id, reputationId: Id) {
		return this.sessionAndHost.get(sessionId) === reputationId
	}

	getSessionHost(sessionId: Id) {
		const reputationId = this.sessionAndHost.get(sessionId)!
		return this.reputations.require(reputationId)
	}

	terminateSession(session: Session) {
		this.sessions.delete(session.id)
		for (const connectionId of session.clients) {
			const connection = this.connections.require(connectionId)
			connection.browser.v1
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

		for (const reputation of deathrow)
			this.reputations.delete(reputation.id)
	}
}

