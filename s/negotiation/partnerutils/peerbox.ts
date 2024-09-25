
import {gather_ice} from "./gather-ice.js"
import {SendIceCandidateFn} from "../types.js"
import {ConnectionReport} from "./connection-report.js"
import {wait_for_connection} from "./wait-for-connection.js"
import {deferredPromise} from "../../tools/deferred-promise.js"

export class Peerbox<Channels> {
	report: ConnectionReport
	peer: RTCPeerConnection
	iceGatheredPromise: Promise<void>
	connectedPromise: Promise<RTCPeerConnection>

	channelsWaiting = deferredPromise<Channels>()

	constructor(
			public rtcConfig: RTCConfiguration,
			sendIceCandidate: SendIceCandidateFn,
			onReport: (report: ConnectionReport) => void,
		) {

		this.peer = new RTCPeerConnection(rtcConfig)
		this.report = new ConnectionReport(onReport)
		this.iceGatheredPromise = gather_ice(this.peer, sendIceCandidate, this.report)
		this.connectedPromise = wait_for_connection(this.peer)
	}
}

