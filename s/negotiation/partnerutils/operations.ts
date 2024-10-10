
import {Pool} from "../../tools/map2.js"
import {gather_ice} from "./gather-ice.js"
import {SendIceCandidateFn} from "../types.js"
import {ConnectionReport} from "./connection-report.js"
import {AgentInfo} from "../../signaling/agent/types.js"
import {wait_for_connection} from "./wait-for-connection.js"
import {deferredPromise} from "../../tools/deferred-promise.js"

export type OperationOptions = {
	agent: AgentInfo
	rtcConfig: RTCConfiguration
	sendIceCandidate: SendIceCandidateFn
	onReport: (report: ConnectionReport) => void,
}

export class Operations<Channels> extends Pool<Operation<Channels>> {
	#id = 0

	create(options: OperationOptions) {
		const operation = new Operation<Channels>(this.#id++, options)
		this.add(operation)
		return operation
	}
}

export class Operation<Channels> {
	agent: AgentInfo
	report: ConnectionReport
	peer: RTCPeerConnection
	iceGatheredPromise: Promise<void>
	connectedPromise: Promise<RTCPeerConnection>

	channelsWaiting = deferredPromise<Channels>()

	constructor(public id: number, public options: OperationOptions) {
		this.agent = options.agent
		this.peer = new RTCPeerConnection(options.rtcConfig)
		this.report = new ConnectionReport(options.agent, options.onReport)
		this.iceGatheredPromise = gather_ice(this.peer, options.sendIceCandidate, this.report)
		this.connectedPromise = wait_for_connection(this.peer)
	}
}

