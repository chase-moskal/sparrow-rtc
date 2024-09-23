
import {Suite, expect} from "cynic"
import {ServerMock} from "./testing/mocks.js"

export default <Suite>{
	"scenarios": {
		async "user creates an reputation"() {
			const server = new ServerMock()
			const browser = server.browser(null)
			const {claim} = await browser.requireConnection()
			expect(claim).ok()
			expect(claim.id).ok()
			expect(claim.secret).ok()
		},

		async "user can disconnect and reclaim reputation"() {
			const server = new ServerMock()
			const b1 = server.browser(null)
			const {claim} = await b1.requireConnection()
			b1.close()
			const b2 = server.browser(claim)
			const {claim: claim2} = await b2.requireConnection()
			expect(claim.id).equals(claim2.id)
		},

		async "user can create a session and become a host"() {
			// const server = setup()
			// const user1 = await server.connect()
			// const claim = await user1.server.v1.basic.claimReputation(null)
			// const sessionData = await user1.server.v1.hosting.startSession({
			// 	label: "test session",
			// 	maxClients: 12,
			// 	discoverable: false,
			// })
			// // const session = server.core.sessions.require(sessionData.id)
			// // expect(session).ok()
			// // expect(session.host.id).equals(claim.id)
		},
	},
}

