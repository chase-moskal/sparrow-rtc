
import {} from "../signaling/parts/people.js"

export type BrowserApi = ReturnType<typeof makeBrowserApi>

export const makeBrowserApi = <Channels>(options: {
		partner: PartnerOptions<Channels>
		doorPolicies: DoorPolicies
	}) => ({

	partner: makePartnerApi(options.partner),

	/** somebody wants to join a room you are hosting.. will you allow it? */
	async knock(roomId: string, personInfo: PersonInfo) {
		const policy = options.doorPolicies.require(roomId)
		return await policy(personInfo)
	},
})

