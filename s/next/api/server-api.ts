
import * as Renraku from "renraku"

import {Core} from "../core/core.js"
import {Connection} from "../core/parts/connection.js"
import {Id, ReputationClaim, Partner, SessionInfo} from "../types.js"
import {negotiate_rtc_connection} from "../negotiation/negotiate_rtc_connection.js"

export function makeServerApi(core: Core, getConnection: () => Connection) {

	const unknownUserPolicy = async() => {
		const connection = getConnection()
		return {connection, core}
	}

	const reputableUserPolicy = async() => {
		const auth = await unknownUserPolicy()
		const {reputation} = auth.connection
		if (!reputation) throw new Error("invalid reputation for this action")
		reputation.touch()
		return {...auth, reputation}
	}

	const v1 = Renraku.api({
		basic: Renraku.service().policy(unknownUserPolicy).expose(auth => ({

			async keepAlive() {
				return Date.now()
			},

			async createReputation() {
				return core.reputations.create().claim
			},

			async claimReputation(claim: ReputationClaim) {
				const reputation = core.reputations.get(claim.id)
				if (reputation && reputation.secret === claim.secret) {
					auth.connection.reputation = reputation
					return true
				}
				else return false
			},

		})),
		hosting: Renraku.service().policy(reputableUserPolicy).expose(auth => ({

			async startSession(o: {
					label: string
					maxClients: number
					discoverable: boolean
				}) {
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

			async transferSessionOwnership(o: {
					sessionId: Id
					sessionSecret: Id
					newOwnerId: Id
				}) {
				throw new Error("TODO coming soon")
			},

		})),
		discovery: Renraku.service().policy(reputableUserPolicy).expose(auth => ({

			async querySessions() {
				const limit = 100
				let count = 1
				const sessions: SessionInfo[] = []
				for (const session of core.sessions.all()) {
					sessions.push(session.asPublicInfo())
					if (count++ > limit)
						break
				}
				return sessions
			},

		})),
		peering: Renraku.service().policy(reputableUserPolicy).expose(auth => ({

			async joinSession(o: {sessionId: Id}) {
				const {connection} = auth
				const session = core.sessions.require(o.sessionId)
				const clientPartner: Partner = {
					...connection.browser.v1.partner,
					onIceCandidate: fn => connection.onIceCandidate.subscribe(fn),
				}
				const hostConnection = core.connections.getByReputation(session.host)
				if (!hostConnection) return false
				const hostPartner: Partner = {
					...hostConnection.browser.v1.partner,
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

