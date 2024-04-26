
import {FailedAssertion} from "./failed-assertion.js"

export function assert(message: string, x: boolean) {
	if (!x)
		throw new FailedAssertion(message)
}
