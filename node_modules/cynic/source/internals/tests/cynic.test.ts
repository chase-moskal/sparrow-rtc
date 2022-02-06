
import {Suite} from "../../cynic.js"

import testSuite from "./test.test.js"
import example from "./example.test.js"
import assertions from "./assert.test.js"
import expectations from "./expect.test.js"

export default <Suite>{
	testSuite,
	assertions,
	expectations,
	example,
}
