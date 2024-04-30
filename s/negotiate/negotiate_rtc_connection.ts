
import {Partner} from "./types.js"

/**
 * this is the signal server's routine for establishing a webrtc connection between a host and client browser peers.
 * first, we attempt the connection with the host as the offerer.
 * if that doesn't work, then we attempt the connection with the client as the offerer.
 */
export async function negotiate_rtc_connection(host: Partner, client: Partner) {
	return attempt_rtc_connection(host, client).then(() => true)
		.catch(() => attempt_rtc_connection(client, host)).then(() => true)
		.catch(() => false)
}

//////

/**
 * we coordinate the peers to exchange offer, answer, and ice candidates.
 * we also wait to see if both peers say the connection was successful or not.
 */
async function attempt_rtc_connection(offerer: Partner, answerer: Partner) {
	const doneIce = startExchangingIceCandidates(offerer, answerer)
	const offer = await offerer.produceOffer()
	const answer = await answerer.produceAnswer(offer)
	await offerer.acceptAnswer(answer)
	await doneIce
}

//////

function startExchangingIceCandidates(alice: Partner, bob: Partner) {
	return Promise.all([
		iceForwarding(alice, bob),
		iceForwarding(bob, alice),
	])
}

async function iceForwarding(alpha: Partner, bravo: Partner) {
	const stopListening = alpha.onIceCandidate(bravo.acceptIceCandidate)
	await alpha.waitUntilReady().finally(stopListening)
}

