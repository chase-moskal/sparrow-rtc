
import {Partner} from "../types.js"

/**
 * we coordinate the peers to exchange offer, answer, and ice candidates.
 * we also wait to see if both peers say the connection was successful or not.
 */
export async function attempt_rtc_connection(offerer: Partner, answerer: Partner) {
	await Promise.all([
		offerer.api.startPeerConnection(),
		answerer.api.startPeerConnection(),
	])
	const offer = await offerer.api.produceOffer()
	const answer = await answerer.api.produceAnswer(offer)
	await offerer.api.acceptAnswer(answer)
	await Promise.all([
		offerer.api.waitUntilReady(),
		answerer.api.waitUntilReady(),
	])
}

