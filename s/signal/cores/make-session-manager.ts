
import {RenrakuRemote} from "renraku"

import {Session} from "../../types.js"
import {generateRandomId} from "../../toolbox/generate-random-id.js"
import {makeSignalBrowserApi} from "../apis/make-signal-browser-api.js"

export function makeSessionManager() {
	const sessions = new Set<Session>()
	const hosts = new Map<
		Session,
		RenrakuRemote<ReturnType<typeof makeSignalBrowserApi>>["host"]
	>()

	function createSession({label, discoverable, signalBrowser}: {
			label: string
			discoverable: boolean
			signalBrowser: RenrakuRemote<ReturnType<typeof makeSignalBrowserApi>>
		}) {
		const session: Session = {
			id: generateRandomId(),
			key: generateRandomId(),
			label,
			discoverable,
		}
		sessions.add(session)
		hosts.set(session, signalBrowser.host)
		console.log("sessions", sessions.size)
		return session
	}

	function deleteSession(session: Session) {
		sessions.delete(session)
		hosts.delete(session)
		console.log("sessions", sessions.size)
	}

	function findSessionById(id: string) {
		for (const session of sessions)
			if (session.id === id)
				return session
	}

	function getSessionHost(session: Session) {
		return hosts.get(session)
	}

	function makeSessionProvider({signalBrowser}: {
			signalBrowser: RenrakuRemote<ReturnType<typeof makeSignalBrowserApi>>
		}) {
		let session: undefined | Session
		return {
			async establishSession(options: {
					label: string
					discoverable: boolean
				}) {
				if (!session) {
					session = createSession({...options, signalBrowser})
					return session
				}
				else {
					throw new Error("cannot overwrite existing session")
				}
			},
			async terminateSession(key: string) {
				if (session) {
					if (session.key === key) {
						deleteSession(session)
						session = undefined
					}
					else {
						throw new Error("wrong session key")
					}
				}
				else {
					throw new Error("no session to terminate")
				}
			},
			async purge() {
				if (session) {
					deleteSession(session)
					session = undefined
				}
			},
		}
	}

	return {
		makeSessionProvider,
		sessionFinder: {
			findSessionById,
			getSessionHost,
		},
	}
}
