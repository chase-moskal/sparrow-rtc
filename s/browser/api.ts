
import {PartnerOptions} from "../negotiation/types.js"
import {makePartnerApi} from "../negotiation/partner-api.js"

export type BrowserApi = ReturnType<typeof makeBrowserApi>

export const makeBrowserApi = <Channels>(options: {
		partner: PartnerOptions<Channels>
	}) => ({

	partner: makePartnerApi(options.partner),

	/** somebody wants to join.. will we allow it? */
	async knock(joinerId: string) {

		// all are welcome 'round here
		return true
	},
})

