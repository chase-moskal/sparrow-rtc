
import {renrakuApi, RenrakuRemote, renrakuService} from "renraku"

export const signallingApi = ({}: {
		browserApi: RenrakuRemote<ReturnType<typeof browserApi>>
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

export const browserApi = () => renrakuApi({
	host: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			async handleClientRequestToJoin() {},
		})),
	client: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			async handleOfferFromHost() {},
			async handleIceCandidatesFromHost() {},
		})),
})
