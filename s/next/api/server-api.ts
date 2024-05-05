
import * as Renraku from "renraku"

import {Core} from "../core/core.js"
import {Reputation} from "../core/parts/reputation.js"
import {Connection} from "../core/parts/connection.js"
import {ServerHelpers} from "./utils/server-helpers.js"
import {Id, ReputationClaim, Partner, SessionInfo} from "../types.js"
import {negotiate_rtc_connection} from "../negotiation/negotiate_rtc_connection.js"

export type ServerAuth = {
	connection: Connection
	we: ServerHelpers
}

export function makeServerApi(core: Core, getConnection: () => Connection) {

	const policy = async(): Promise<ServerAuth> => {
		const connection = getConnection()
		const we = new ServerHelpers(core, connection)
		return {connection, we}
	}

	const service = <M extends Renraku.Methods>(
			fn: (auth: ServerAuth) => M
		) => Renraku
		.service()
		.policy(policy)
		.expose(fn)

	const v1 = Renraku.api({
		basic: service(({connection, we}) => ({
			async keepAlive() {
				return Date.now()
			},

			async createReputation() {
				const reputation = new Reputation()
				core.reputations.set(reputation.id, reputation)
				return reputation.claim
			},

			async claimReputation(claim: ReputationClaim) {
				const reputation = core.reputations.get(claim.id)
				if (reputation && reputation.secret === claim.secret) {
					connection.reputation = reputation
					return true
				}
				else return false
			},

		})),

		hosting: service(({connection, we}) => ({
			async startSession(o: {
					label: string
					maxClients: number
					discoverable: boolean
				}) {
				const reputation = we.haveReputation()
				const session = core.createSession({hostReputationId: reputation.id})
				session.label = o.label
				session.discoverable = o.discoverable
				return session.asPrivateDataForHost()
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

		discovery: service(({connection, we}) => ({
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

		peering: service(({connection, we}) => ({
			async joinSession(o: {sessionId: Id}) {
				we.haveReputation()
				const clientPartner: Partner = {
					...connection.browser.v1.partner,
					onIceCandidate: fn => connection.onIceCandidate.subscribe(fn),
				}
				const hostReputationId = core.hosting.getHost(o.sessionId)
				const hostReputation = core.reputations.require(o.sessionId)
				const hostConnection = hostReputation.connection
				if (!hostConnection) return false
				const hostPartner: Partner = {
					...hostConnection.browser.v1.partner,
					onIceCandidate: fn => connection.onIceCandidate.subscribe(fn),
				}
				await negotiate_rtc_connection(clientPartner, hostPartner)
			},
			async sendIceCandidate(ice: RTCIceCandidate) {
				we.haveReputation()
				await connection.onIceCandidate.publish(ice)
			},
		})),
	})

	return Renraku.api({v1})
}

