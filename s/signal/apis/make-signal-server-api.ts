
import {renrakuApi, RenrakuRemote, renrakuService} from "renraku"
import {makeSignalBrowserApi} from "./make-signal-browser-api.js"

export const makeSignalServerApi = ({}: {
		signalBrowserApi: RenrakuRemote<ReturnType<typeof makeSignalBrowserApi>>
	}) => renrakuApi({

	discovery: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			async listSessions() {
				return []
			},
		})),

	hosting: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			async establishSession({}: {
					label: string
					discoverable: boolean
				}) {
				return {
					sessionId: "",
					sessionOwnershipKey: "",
				}
			},
			async relayOfferToClient() {},
			async relayIceCandidatesToClient() {},
			async terminateSession() {},
		})),

	connecting: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			async relayRequestToJoinToHost() {
				return {
					clientId: ""
				}
			},
			async relayAnswerToHost() {},
			async relayIceCandidatesToHost() {},
		})),
})
