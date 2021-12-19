
import {renrakuApi, RenrakuRemote, renrakuService} from "renraku"

import {makeSignalBrowserApi} from "./make-signal-browser-api.js"
import {makeSessionManager} from "../cores/make-session-manager.js"
import {generateRandomId} from "../../toolbox/generate-random-id.js"
import {SessionInfo} from "../../types.js"
import {extractSessionInfo} from "../cores/utils/extract-session-info.js"

export const makeSignalServerApi = ({signalBrowser, sessionProvider, sessionFinder}: {
		signalBrowser: RenrakuRemote<ReturnType<typeof makeSignalBrowserApi>>
		sessionFinder: ReturnType<typeof makeSessionManager>["sessionFinder"]
		sessionProvider: ReturnType<ReturnType<typeof makeSessionManager>["makeSessionProvider"]>
	}) => renrakuApi({

	hosting: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			establishSession: sessionProvider.establishSession,
			async relayOfferToClient() {},
			async relayIceCandidatesToClient() {},
			terminateSession: sessionProvider.terminateSession,
		})),

	discovery: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			async listSessions() {
				return []
			},
		})),

	connecting: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			async joinSession(sessionId: string) {
				const session = sessionFinder.findSessionById(sessionId)
				if (session) {
					const host = sessionFinder.getSessionHost(session)!
					const clientId = generateRandomId()
					const accepted = await host.handleJoiner(clientId)
					return accepted
						? {
							clientId,
							sessionInfo: extractSessionInfo(session),
							offer: accepted.offer,
						}
						: undefined
				}
				else {
					throw new Error("session not found")
				}
			},
			async relayAnswerToHost() {},
			async relayIceCandidatesToHost() {},
		})),
})
