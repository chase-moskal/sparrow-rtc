
import * as Renraku from "renraku"
import {BrowserApi, ReputationClaim, ServerApi} from "../../types.js"

export const browserMetas = Renraku.metas<BrowserApi>({
	v1: {
		partner: async() => {},
	},
})

export const serverMetas = (getMeta: () => Promise<{claim: ReputationClaim}>) => Renraku.metas<ServerApi>({
	v1: {
		basic: async() => {},
		hosting: getMeta,
		peering: getMeta,
		discovery: getMeta,
	},
})

