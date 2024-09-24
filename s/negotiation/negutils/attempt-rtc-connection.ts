
import {Partner} from "../types.js"

/**
 * we coordinate the peers to exchange offer, answer, and ice candidates.
 * we also wait to see if both peers say the connection was successful or not.
 */
export async function attempt_rtc_connection(offerer: Partner, answerer: Partner) {
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

