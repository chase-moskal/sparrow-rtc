
import {expose, webSocketRemote} from "renraku"

import {Sparrow} from "../sparrow.js"
import {version} from "../../version.js"
import {makeBrowserApi} from "../api.js"
import {ConnectOptions} from "../types.js"
import {pubsub} from "../../tools/pubsub.js"
import {Cable} from "../../negotiation/types.js"
import {SignalingApi} from "../../signaling/api.js"
import {ConnectionReport} from "../../negotiation/partnerutils/connection-report.js"

export async function connect<Channels>(options: ConnectOptions<Channels>) {
	const onCable = pubsub<[Cable<Channels>]>()
	const onReport = pubsub<[ConnectionReport]>()

	const {socket, fns: signalingApi} = await webSocketRemote<SignalingApi>({
		url: options.url,
		getLocalEndpoint: signalingApi => expose(() => makeBrowserApi({
			allowJoin: options.allowJoin,
			partner: {
				signalingApi,
				rtcConfig: options.rtcConfig,
				channelsConfig: options.channelsConfig,
				onCable: onCable.publish,
				onReport: onReport.publish,
			},
		})),
	})

	await signalingApi.hello(version)

	return new Sparrow<Channels>(socket, signalingApi, onCable, onReport)
}

