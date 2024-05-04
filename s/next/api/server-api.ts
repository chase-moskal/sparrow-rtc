
import * as Renraku from "renraku"

import {Core} from "../core/core.js"
import {Session} from "../core/session.js"
import {Reputation} from "../serving/reputation.js"
import {Connection} from "../serving/connection.js"
import {ServerHelpers} from "./utils/server-helpers.js"
import {Id, IdentityClaim, Partner, SessionInfo} from "../types.js"
import {negotiate_rtc_connection} from "../negotiation/negotiate_rtc_connection.js"

export function makeServerApi(core: Core, connection: Connection) {
	const we = new ServerHelpers(core, connection)

	const v1 = Renraku.api({
		basic: Renraku.serviette(() => ({
			async keepAlive() {
				return Date.now()
			},

			async createIdentity() {
				const identity = new Reputation()
				core.identities.set(identity.id, identity)
				return identity.claim
			},

			async claimIdentity(claim: IdentityClaim) {
				const identity = core.identities.get(claim.id)
				if (identity && identity.secret === claim.secret) {
					connection.identity = identity
					return true
				}
				else return false
			},
		})),

		hosting: Renraku.serviette(() => ({
			async startSession(o: {
					label: string
					maxClients: number
					discoverable: boolean
				}) {
				const identity = we.haveIdentity()
				const session = new Session({
					host: identity.id,
					maxClients: o.maxClients,
				})
				session.label = o.label
				session.discoverable = o.discoverable
				core.sessions.add(session)
				return {...session}
			},

			async terminateSession(o: {sessionId: Id}) {
				const session = core.sessions.require(o.sessionId)
				if (we.areSessionHost(session))
					core.sessions.delete(session.id)
			},

			async transferSessionOwnership(o: {
					sessionId: Id
					sessionSecret: Id
					newOwnerId: Id
				}) {
				throw new Error("TODO coming soon")
			},
		})),

		discovery: Renraku.serviette(() => ({
			async querySessions() {
				const limit = 100
				let count = 1
				const sessions: SessionInfo[] = []
				for (const session of core.sessions.values()) {
					sessions.push(session.asPublicInfo())
					if (count++ > limit)
						break
				}
				return sessions
			},
		})),

		peering: Renraku.serviette(() => ({
			async joinSession(o: {sessionId: Id}) {
				we.haveIdentity()
				const clientPartner: Partner = {
					...connection.browser.v1.partner,
					onIceCandidate: fn => connection.onIceCandidate.subscribe(fn),
				}
				const hostIdentity = core.getSessionHost(o.sessionId)
				const hostConnection = hostIdentity.connection
				if (!hostConnection) return false
				const hostPartner: Partner = {
					...hostConnection.browser.v1.partner,
					onIceCandidate: fn => connection.onIceCandidate.subscribe(fn),
				}
				await negotiate_rtc_connection(clientPartner, hostPartner)
			},
			async sendIceCandidate(ice: RTCIceCandidate) {
				we.haveIdentity()
				await connection.onIceCandidate.publish(ice)
			},
		})),
	})

	return Renraku.api({v1})
}

