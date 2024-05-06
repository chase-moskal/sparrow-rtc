
import * as Renraku from "renraku"
import {BrowserApi, ServerApi} from "../../types.js"

export const browserMetas = Renraku.metas<BrowserApi>({
	v1: {
		partner: async() => {},
	},
})

export const serverMetas = Renraku.metas<ServerApi>({
	v1: {
		basic: async() => {},
		hosting: async() => {},
		peering: async() => {},
		discovery: async() => {},
	},
})

