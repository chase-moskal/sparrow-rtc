
import {Agent} from "./agent/agent.js"
import {Agents} from "./agent/agents.js"
import {BrowserApi} from "../browser/api.js"

export class Core {
	agents = new Agents()

	async acceptAgent(
			ip: string,
			browserApi: BrowserApi,
			disconnect: () => void,
		) {
		const agent = await Agent.make(ip, browserApi, disconnect)
		this.agents.add(agent)
		return agent
	}

	agentDisconnected(agent: Agent) {
		this.agents.remove(agent)
	}
}

