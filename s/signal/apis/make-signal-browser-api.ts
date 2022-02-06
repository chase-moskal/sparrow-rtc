
import * as renraku from "renraku"
import {SignalBrowserClient, SignalBrowserHost} from "../../types.js"

export const makeSignalBrowserApi = ({host, client}: {
		host: SignalBrowserHost
		client: SignalBrowserClient
	}) => renraku.api({

	host: renraku.service()
		.policy(async() => {})
		.expose(() => ({...host})),

	client: renraku.service()
		.policy(async() => {})
		.expose(() => ({...client})),
})
