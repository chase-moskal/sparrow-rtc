
import {renrakuApi, renrakuService} from "renraku"

export const makeSignalBrowserApi = ({
		handleJoiner,
	}: {
		handleJoiner(clientId: string): Promise<{offer: any}>
	}) => renrakuApi({

	host: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			handleJoiner,
		})),

	client: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			async handleOfferFromHost() {},
			async handleIceCandidatesFromHost() {},
		})),
})
