
import {JoinResult, Partner} from "./types.js"
import {attempt_rtc_connection} from "./negutils/attempt-rtc-connection.js"
import {start_exchanging_ice_candidates} from "./negutils/start-exchanging-ice-candidates.js"

/**
 * the signaling server uses this algorithm to connect two webrtc browser peers.
 */
export async function negotiate_rtc_connection(
		host: Partner,
		client: Partner,
	): Promise<JoinResult> {

	const iceExchange = start_exchanging_ice_candidates(host, client)

	const promise = (
		// try it this way: host as offerer
		attempt_rtc_connection(host, client)
			// try it that way: client as offerer
			.catch(() => attempt_rtc_connection(client, host))
	)

	return promise
		.then((): JoinResult => "succeeded")
		.catch((): JoinResult => "failed")
		.finally(() => iceExchange.stop())
}

