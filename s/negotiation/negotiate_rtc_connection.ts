
import {Partner} from "./types.js"

/**
 * this is the signal server's routine for establishing a webrtc connection between a host and client browser peers.
 * first, we attempt the connection with the host as the offerer.
 * if that doesn't work, then we attempt the connection with the client as the offerer.
 */
export async function negotiate_rtc_connection(host: Partner, client: Partner) {
	const iceExchange = start_exchanging_ice_candidates(host, client)
	return attempt_rtc_connection(host, client).then(() => true)
		.catch(() => attempt_rtc_connection(client, host)).then(() => true)
		.catch(() => false)
		.finally(() => iceExchange.stop())
}

//////////////////////////////////////////////////

/**
 * allow the browser peers to freely exchange ice canadidates with each other.
 */
function start_exchanging_ice_candidates(alice: Partner, bob: Partner) {
	const stopA = alice.onIceCandidate(bob.acceptIceCandidate)
	const stopB = bob.onIceCandidate(alice.acceptIceCandidate)
	return {
		stop: () => {
			stopA()
			stopB()
		},
	}
}

/**
 * we coordinate the peers to exchange offer, answer, and ice candidates.
 * we also wait to see if both peers say the connection was successful or not.
 */
async function attempt_rtc_connection(offerer: Partner, answerer: Partner) {
	await Promise.all([
		offerer.startPeerConnection(),
		answerer.startPeerConnection(),
	])
	const offer = await offerer.produceOffer()
	const answer = await answerer.produceAnswer(offer)
	await offerer.acceptAnswer(answer)
	await Promise.all([
		offerer.waitUntilReady(),
		answerer.waitUntilReady(),
	])
}

