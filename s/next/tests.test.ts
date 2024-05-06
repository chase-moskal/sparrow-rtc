
import {Suite, expect} from "cynic"
import {setup} from "./testing/utils.js"

export default <Suite>{
	"scenarios": {
		async "user creates an reputation"() {
			const server = setup()
			const user = await server.connect()
			const claim = await user.server.v1.basic.claimReputation(null)
			expect(claim).ok()
			expect(claim.id).ok()
			expect(claim.secret).ok()
		},

		async "user can disconnect and reclaim reputation"() {
			const server = setup()
			const user1 = await server.connect()
			const claim = await user1.server.v1.basic.claimReputation(null)
			user1.close()
			const user2 = await server.connect()
			const result = await user2.server.v1.basic.claimReputation(claim)
			expect(result).ok()
		},

		async "user can create a session and become a host"() {
			const server = setup()
			const user1 = await server.connect()
			const claim = await user1.server.v1.basic.claimReputation(null)
			const sessionData = await user1.server.v1.hosting.startSession({
				label: "test session",
				maxClients: 12,
				discoverable: false,
			})
			// const session = server.core.sessions.require(sessionData.id)
			// expect(session).ok()
			// expect(session.host.id).equals(claim.id)
		},
	},
}

