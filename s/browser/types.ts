
import {AgentInfo} from "../signaling/agent/types.js"
import {ChannelsConfig} from "../negotiation/types.js"

export type ConnectOptions<Channels> = {
	url: string
	rtcConfig: RTCConfiguration
	channelsConfig: ChannelsConfig<Channels>
}

export type AllowFn = (agent: AgentInfo) => Promise<boolean>

