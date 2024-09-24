
import {ExposedError} from "renraku"
import {Core} from "../server/core.js"
import {Person} from "../server/parts/people.js"
import {Session, SessionListOptions, SessionSettings} from "../server/parts/sessions.js"

export type ServerApi = ReturnType<typeof makeServerApi>

export const makeServerApi = (core: Core, person: Person) => ({
	v0: {

		basic: {
			async ping() {},
		},

		sessions: {
			async list(options: SessionListOptions) {
				return core.sessions.list(options)
			},
			async join(sessionId: string) {
				// TODO implement webrtc stuff
				// - knock -- ask the host if they'd like to let this person in
				// - negotiate -- actually mediate the connection
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
				// TODO figure out ice candidate stuff
			},
		},
	},
})

