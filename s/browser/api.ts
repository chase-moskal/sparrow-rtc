
import {PartnerOptions} from "../negotiation/types.js"
import {makePartnerApi} from "../negotiation/partner-api.js"

export type BrowserApi = ReturnType<typeof makeBrowserApi>

export const makeBrowserApi = <Channels>(options: {
		partner: PartnerOptions<Channels>
	}) => ({

	v0: {
		partner: makePartnerApi(options.partner),
	},
})

