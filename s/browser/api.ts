
import {AllowJoinFn} from "./types.js"
import {PartnerOptions} from "../negotiation/types.js"
import {PersonInfo} from "../signaling/parts/people.js"
import {makePartnerApi} from "../negotiation/partner-api.js"

export type BrowserApi = ReturnType<typeof makeBrowserApi>

export const makeBrowserApi = <Channels>(options: {
		partner: PartnerOptions<Channels>
		allowJoin: AllowJoinFn
	}) => ({

	partner: makePartnerApi(options.partner),

	/** somebody wants to join.. will we allow it? */
	async knock(personInfo: PersonInfo) {
		return await options.allowJoin(personInfo)
	},
})

