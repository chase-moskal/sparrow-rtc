
import {Suite} from "cynic"

export default <Suite>{
	"signal server": {
		async "owner starts a session, and two joiners join"() { return true },

		"session administration": {
			async "owner can terminate the session"() { return true },
			async "owner can kick people"() { return true },
		},

		"session ownership can be transferred": {
			async "owner leaves gracefully"() { return true },
			async "owner hard disconnects"() { return true },
		},
	},
}
