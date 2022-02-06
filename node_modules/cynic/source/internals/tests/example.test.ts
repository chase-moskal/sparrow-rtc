
import {Suite, expect, assert} from "../../cynic.js"

export default <Suite>{
	"alpha system": {
		"can sum two numbers (boolean return)": async() => {
			const a = 1
			const b = 2
			return (a + b) === 3
		},
		"can sum three numbers (assertion)": async() => {
			const a = 1
			const b = 2
			const c = 3
			assert((a + b + c) === 6, `sum is wrong`)
		}
	},
	"bravo system": {
		"can multiply numbers (expectation)": async() => {
			const a = 2
			const b = 3
			expect(a * b).equals(6)
			expect(a * b * a).equals(12)
		}
	}
}
