
import * as Renraku from "renraku"

export function makeServerApi() {
	const service = Renraku.service().policy(async() => {})
	return Renraku.api({
		basic: service.expose(() => ({
			async keepAlive() {
				return Date.now()
			},
		})),

		hosting: service.expose(() => ({
			async startSession() {},
			async terminateSession() {},
			async transferSessionOwnership() {},
		})),

		discovery: service.expose(() => ({
			async querySessions() {},
		})),

		connecting: service.expose(() => ({
			async joinSession() {},
		})),

		mediator: service.expose(() => ({
			async sendIceCandidate(candidate: RTCIceCandidateInit) {},
		})),
	})
}

