
import {renrakuApi, renrakuService} from "renraku"
import {SignalBrowserClient, SignalBrowserHost} from "../../types.js"

export const makeSignalBrowserApi = ({host, client}: {
		host: SignalBrowserHost
		client: SignalBrowserClient
	}) => renrakuApi({

	host: renrakuService()
		.policy(async() => {})
		.expose(() => ({...host})),

	client: renrakuService()
		.policy(async() => {})
		.expose(() => ({...client})),
})
