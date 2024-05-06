
import * as Renraku from "renraku"

import {Core} from "../core/core.js"
import {Connection} from "../core/parts/connection.js"
import {negotiate_rtc_connection} from "./parts/negotiate_rtc_connection.js"
import {Id, ReputationClaim, Partner, SessionInfo, StartSessionOptions} from "../types.js"

export function makeServerApi(core: Core, getConnection: () => Connection) {

	const anonPolicy = async() => ({connection: getConnection()})

	const reputablePolicy = async({claim}: {claim: ReputationClaim}) => {
		const connection = getConnection()
		const reputation = core.reputations.claim(connection, claim)
		reputation.touch()
		return {connection, reputation}
	}

	const v1 = Renraku.api({
		basic: Renraku.service().policy(anonPolicy).expose(({connection}) => ({

			async claimReputation(claim: ReputationClaim | null) {
				return core.reputations.claim(connection, claim)
			},

			async keepAlive() {
				return Date.now()
			},

		})),
		hosting: Renraku.service().policy(reputablePolicy).expose(auth => ({

			async startSession(o: StartSessionOptions) {
				const {reputation} = auth
				const session = core.sessions.create(reputation)
				session.label = o.label
				session.discoverable = o.discoverable
				return session.asPrivateDataForHost()
			},

			async terminateSession(o: {sessionId: Id}) {
				const {reputation} = auth
				const session = core.sessions.require(o.sessionId)
				if (session.host === reputation)
					core.sessions.terminate(session)
			},

			// async transferSessionOwnership(o: {
			// 		sessionId: Id
			// 		sessionSecret: Id
			// 		newOwnerId: Id
			// 	}) {
			// 	throw new Error("TODO coming soon")
			// },

		})),
		discovery: Renraku.service().policy(reputablePolicy).expose(_auth => ({

			async querySessions() {
				const limit = 100
				const sessions: SessionInfo[] = []
				let count = 1
				for (const session of core.sessions.all()) {
					sessions.push(session.asPublicInfo())
					if (count++ > limit)
						break
				}
				return sessions
			},

		})),
		peering: Renraku.service().policy(reputablePolicy).expose(auth => ({

			async joinSession(o: {sessionId: Id}) {
				const {connection} = auth
				const session = core.sessions.require(o.sessionId)
				const clientPartner: Partner = {
					...connection.browser.v1.partner,
					reputationId: auth.reputation.id,
					onIceCandidate: fn => connection.onIceCandidate.subscribe(fn),
				}
				const hostConnection = session.host.connection
				if (!hostConnection) return false
				const hostPartner: Partner = {
					...hostConnection.browser.v1.partner,
					reputationId: session.host.id,
					onIceCandidate: fn => connection.onIceCandidate.subscribe(fn),
				}
				await negotiate_rtc_connection(clientPartner, hostPartner)
			},

			async sendIceCandidate(ice: RTCIceCandidate) {
				await auth.connection.onIceCandidate.publish(ice)
			},

		})),
	})

	return Renraku.api({v1})
}

