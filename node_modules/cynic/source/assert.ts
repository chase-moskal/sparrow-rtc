
import {CynicBrokenAssertion} from "./errors.js"

export function assert(
	condition: any,
	fail: string | Error = "failed assert"
): boolean {

	if (!!condition) return true
	else {
		const error = typeof fail === "string"
			? new CynicBrokenAssertion(fail)
			: fail
		throw error
	}
}
