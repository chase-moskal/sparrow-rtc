
import {ChannelsConfig} from "../negotiation/types.js"
import {PersonInfo} from "../signaling/parts/people.js"

export type ConnectOptions<Channels> = {
	url: string
	rtcConfig: RTCConfiguration
	channelsConfig: ChannelsConfig<Channels>
	allowJoin: AllowJoinFn
}

export type AllowJoinFn = (personInfo: PersonInfo) => Promise<boolean>

