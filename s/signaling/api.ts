
import {ExposedError} from "renraku"

import {Core} from "./core.js"
import {Person} from "./parts/people.js"
import {JoinResult, Partner} from "../negotiation/types.js"
import {Session, SessionListOptions, SessionSettings} from "./parts/sessions.js"
import {negotiate_rtc_connection} from "../negotiation/negotiate_rtc_connection.js"

export type SignalingApi = ReturnType<typeof makeSignalingApi>

const version = 0

export const makeSignalingApi = (core: Core, person: Person) => ({

	async hello(wantedVersion: number) {
		if (wantedVersion !== version)
			throw new ExposedError(`version error: signaling server is at v${version}, but the client wanted v${wantedVersion}`)
	},

	basic: {
		async ping() {},
	},

	sessions: {
		async list(options: SessionListOptions) {
			return core.sessions.list(options)
		},

		async join(sessionId: string): Promise<JoinResult> {
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
				return await negotiate_rtc_connection(hostPartner, clientPartner)
			}
			else {
				return "rejected"
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

