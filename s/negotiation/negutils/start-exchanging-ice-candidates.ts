
import {Partner} from "../types.js"

/**
 * allow the browser peers to freely exchange ice canadidates with each other.
 */
export function start_exchanging_ice_candidates(alice: Partner, bob: Partner) {
	const stopA = alice.onIceCandidate(bob.acceptIceCandidate)
	const stopB = bob.onIceCandidate(alice.acceptIceCandidate)
	return {
		stop: () => {
			stopA()
			stopB()
		},
	}
}

