
import {renrakuApi, renrakuService} from "renraku"

export const makeSignalBrowserApi = () => renrakuApi({
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
