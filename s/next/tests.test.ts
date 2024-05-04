
import {Suite, expect} from "cynic"
import {setup} from "./testing/utils.js"

export default <Suite>{
	"scenarios": {
		async "user creates an reputation"() {
			const server = setup()
			const user = server.connect()
			const reputation = await user.serverRemote.v1.basic.createReputation()
			expect(reputation).ok()
			expect(reputation.id).ok()
			expect(reputation.secret).ok()
		},
	},
}

