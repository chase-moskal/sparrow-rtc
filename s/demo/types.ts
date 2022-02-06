
export interface HeartbeatOptions {
	signalServerUrl: string
	rtcConfig: RTCConfiguration
	timeout: number
	heartbeatPeriod: number
}

export interface HeartbeatWorld {
	hostTime: number
	clients: {
		[clientId: string]: {
			clientTime: number | undefined
		}
	}
}
