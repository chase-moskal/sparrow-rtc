
import {ConnectionReport} from "./connection-report.js"
import {AgentInfo} from "../../signaling/agent/types.js"

export class Cable<Channels> {

	/** this is the id of the agent this cable is connected to */
	readonly id: string

	constructor(
			public agent: AgentInfo,
			public channels: Channels,
			public peer: RTCPeerConnection,
			public report: ConnectionReport,
		) {
		this.id = agent.id
	}
}

