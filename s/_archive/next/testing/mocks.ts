
import {Core} from "../core/core.js"
import {ReputationClaim} from "../types.js"
import {SparrowMock} from "../browser/sparrow-mock.js"

export class ServerMock {
	core = new Core()

	browser(claim: ReputationClaim | null) {
		const sparrow = new SparrowMock({core: this.core})
		sparrow.claim = claim
		return sparrow
	}
}

