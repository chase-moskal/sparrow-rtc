
import {FailedExpectation} from "./failed-expectation.js"

export const expect = (message: string) => ({
	that: (subject: any) => ({
		is: (expected: any) => {
			if (subject !== expected)
				throw new FailedExpectation(
					`${message}, expected "${expected}", got "${subject}"`
				)
		},
	}),
})
