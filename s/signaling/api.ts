
import {ExposedError} from "renraku"

import {Core} from "./core.js"
import {version} from "../version.js"
import {Person} from "./parts/people.js"
import {Partner} from "../negotiation/types.js"
import {negotiate_rtc_connection} from "../negotiation/negotiate_rtc_connection.js"
import {Session, SessionInfo, SessionListOptions, SessionSettings} from "./parts/sessions.js"

export type SignalingApi = ReturnType<typeof makeSignalingApi>

export type Stats = {
	peopleCount: number
	sessionCount: number
}

export const makeSignalingApi = (core: Core, person: Person) => ({

	async hello(wantedVersion: number) {
		if (wantedVersion !== version)
			throw new ExposedError(`version error: signaling server is at v${version}, but the client wanted v${wantedVersion}`)
	},

	basic: {
		async stats(): Promise<Stats> {
			return {
				peopleCount: core.people.size,
				sessionCount: core.sessions.size,
			}
		}
	},

	sessions: {
		async getInfo(sessionId: string) {
			return core.sessions.getInfo(sessionId)
		},

		async list(options: SessionListOptions) {
			return core.sessions.list(options)
		},

		async join(sessionId: string): Promise<SessionInfo | false> {
			const session = core.sessions.require(sessionId)
			const allowed = await session.host.browserApi.knock(person.id)
			if (allowed) {
				const hostPartner: Partner = {
					person: session.host,
					api: session.host.browserApi.partner,
				}
				const clientPartner: Partner = {
					person,
					api: person.browserApi.partner,
				}
				const success = await negotiate_rtc_connection(hostPartner, clientPartner)
				return success && session.info()
			}
			else {
				return false
			}
		},

		async host(settings: SessionSettings) {
			const session = new Session(person, settings)
			core.sessions.add(session)
			return session.secretInfo()
		},

		async terminate(sessionId: string) {
			const session = core.sessions.require(sessionId)
			if (session.host !== person)
				throw new ExposedError("you don't have permission to terminate this session")
			core.sessions.delete(sessionId)
		},
	},

	negotiation: {
		async sendIceCandidate(ice: RTCIceCandidate) {
			await person.onIceCandidate.publish(ice)
		},
	},
})

