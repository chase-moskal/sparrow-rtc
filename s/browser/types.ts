
import {EstablishChannels} from "../negotiation/types.js"

export type ConnectOptions<Channels> = {
	url: string
	rtcConfig: RTCConfiguration
	establishChannels: EstablishChannels<Channels>
	allowJoin: (personId: string) => Promise<boolean>
}

