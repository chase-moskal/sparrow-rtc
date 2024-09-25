
import {Partner} from "../types.js"

/**
 * allow the browser peers to freely exchange ice canadidates with each other.
 */
export function start_exchanging_ice_candidates(alice: Partner, bob: Partner) {
	const stopA = alice.person.onIceCandidate(bob.api.acceptIceCandidate)
	const stopB = bob.person.onIceCandidate(alice.api.acceptIceCandidate)
	return {
		stop: () => {
			stopA()
			stopB()
		},
	}
}

