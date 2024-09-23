
import {pubsub} from "../../../toolbox/pubsub.js"
import {Clientizer, ConnectionStatus, ReputationClaim, SocketClient} from "../../types.js"

export class SparrowClient {
	#socket: SocketClient | null = null
	claim: ReputationClaim | null = null
	onConnectionChange = pubsub<[]>()
	onConnectionStatus = pubsub<[ConnectionStatus]>()
	onChannelsReady = pubsub<[RTCPeerConnection, unknown]>()

	constructor(public clientizer: Clientizer) {}

	get connection() {
		const claim = this.claim
		const remote = this.#socket?.remote
		return (remote && claim)
			? {remote, claim}
			: null
	}

	close() {
		if (this.#socket) {
			this.#socket.close()
			this.#socket = null
			this.onConnectionChange.publish()
		}
	}

	async requireConnection() {
		const {connection} = this

		if (connection)
			return connection

		this.#socket = await this.clientizer(this.claim)
		const {remote} = this.#socket
		const claim = await remote.v1.basic.claimReputation(this.claim)
		this.claim = claim
		this.onConnectionChange.publish()

		return {remote, claim}
	}
}

