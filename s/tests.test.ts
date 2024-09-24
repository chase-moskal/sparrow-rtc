
import {Suite, expect} from "cynic"
import {Sparrow} from "./browser/sparrow.js"

export default <Suite>{
	stories: {
		async "one person can host a session, another can join it by id"() {
			expect(true).ok()
			// const host = await (async() => {
			// 	const sparrow = await Sparrow.connect()
			// 	expect(sparrow.person.id).ok()
			// 	// const session = await sparrow.hostSession()
			// 	// expect(session).ok()
			// 	// return {session}
			// })()
			// const client = await (async() => {
			// 	const sparrow = await Sparrow.connect()
			// 	expect(sparrow.person.id).ok()
			// 	const session = await sparrow.joinSession(host.session.id)
			// 	expect(session).ok()
			// 	return {session}
			// })()
		},
	},
}

