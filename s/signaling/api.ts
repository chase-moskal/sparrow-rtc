
import {ExposedError} from "renraku"

import {Core} from "./core.js"
import {version} from "../version.js"
import {Person} from "./parts/people.js"

export type SignalingApi = ReturnType<typeof makeSignalingApi>

export type Stats = {
	sessions: number
}

export const makeSignalingApi = (core: Core, person: Person) => ({

	async hello(wantedVersion: number) {
		if (wantedVersion !== version)
			throw new ExposedError(`version error: signaling server is at v${version}, but the client wanted v${wantedVersion}`)
		return person.info()
	},


	async stats(): Promise<Stats> {
		return {
			sessions: core.sessions.size,
		}
	},

	async info(sessionId: string) {
		const session = core.sessions.get(sessionId)
		return session
			? session.info()
			: undefined
	},


	async join(sessionId: string) {
		const session = core.session.require(sessionId)
		const allowed = await session.host.browserApi.knock(sessionId, person.info())

		if (!allowed)
			return undefined

		const hostPartner: Partner = {
			person: room.host,
			api: room.host.browserApi.partner,
		}

		const clientPartner: Partner = {
			person,
			api: person.browserApi.partner,
		}

		await negotiate_rtc_connection(hostPartner, clientPartner)
		return room.info()
	},
})

