
import {Id} from "../types.js"
import * as Renraku from "renraku"
import {Session} from "../core/session.js"
import {SignalConnection} from "../serving/signal-connection.js"

export function makeServerApi(connection: SignalConnection) {
	const {signalCore} = connection

	const v1 = Renraku.api({
		basic: Renraku.serviette(() => ({
			async keepAlive() {
				return Date.now()
			},
		})),

		hosting: Renraku.serviette(() => ({
			async startSession(o: {
					label: string
					discoverable: boolean
				}) {
				const session = new Session({owner: connection.id})
				session.label = o.label
				session.discoverable = o.discoverable
				signalCore.sessions.add(session)
				return {...session}
			},
			async terminateSession(o: {id: Id}) {
				signalCore.sessions.delete(o.id)
			},
			async transferSessionOwnership(o: {
					sessionId: Id
					sessionSecret: Id
					newOwnerId: Id
				}) {
				const session = signalCore.sessions.get(o.sessionId)
				if (session.secret === o.sessionSecret) session.owner = o.newOwnerId
				else throw new Error("wrong session secret")
			},
		})),

		discovery: Renraku.serviette(() => ({
			async querySessions() {},
		})),

		connecting: Renraku.serviette(() => ({
			async joinSession() {},
		})),

		mediator: Renraku.serviette(() => ({
			async sendIceCandidate(candidate: RTCIceCandidateInit) {},
		})),
	})

	return Renraku.api({v1})
}

