
import * as Renraku from "renraku"

import {IdMap} from "./id-map.js"
import {Session} from "./session.js"
import {BrowserApi, Id} from "../types.js"
import {browserMetas} from "../api/utils/metas.js"
import {makeServerApi} from "../api/server-api.js"
import {Reputation} from "../serving/reputation.js"
import {Connection} from "../serving/connection.js"

export class Core {
	readonly identities = new IdMap<Reputation>()
	readonly sessions = new IdMap<Session>()
	readonly connections = new IdMap<Connection>()

	readonly sessionAndHost = new Map<Id, Id>()
	readonly hostAndSession = new Map<Id, Id>()

	setHost(sessionId: Id, identityId: Id) {
		this.sessionAndHost.set(sessionId, identityId)
		this.hostAndSession.set(identityId, sessionId)
	}

	isHosting(sessionId: Id, identityId: Id) {
		return this.sessionAndHost.get(sessionId) === identityId
	}

	getSessionHost(sessionId: Id) {
		const identityId = this.sessionAndHost.get(sessionId)!
		return this.identities.require(identityId)
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

	handleConnectionDied(connectionId: Id) {
		const connection = this.connections.require(connectionId)
	}
}

