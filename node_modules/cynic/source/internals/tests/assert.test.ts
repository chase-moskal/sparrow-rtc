
import {Suite, assert} from "../../cynic.js"
import {throwsError} from "./testing.test.js"

export default <Suite>{
	"assert throws an error": async() => {
		const failGood = throwsError(() => {
			assert(false, "assertfail")
		})
		assert(true, "assertsucceed")
		return failGood
	},
}
