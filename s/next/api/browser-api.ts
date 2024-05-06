
import * as Renraku from "renraku"
import {PeerUnit, make_peer_unit} from "./parts/make_peer_unit.js"
import {ConnectionStatus, EstablishChannels, ServerRemote} from "../types.js"

export function makeBrowserApi<Channels>({
		server: {v1: {peering}},
		rtcConfig,
		onChannelsReady: onReady,
		onConnectionStatus,
		establishChannels,
	}: {
		server: ServerRemote
		rtcConfig: RTCConfiguration
		establishChannels: EstablishChannels<Channels>
		onConnectionStatus: (status: ConnectionStatus) => void
		onChannelsReady: (peer: RTCPeerConnection, channels: Channels) => void
	}) {

	let peerUnit: PeerUnit | null = null
	let ready: Promise<void> = Promise.resolve()

	function requirePeerUnit() {
		if (peerUnit) return peerUnit
		else throw new Error("invalid, peer connection not yet started")
	}

	const v1 = Renraku.api({

		/**
		 * this is the service that each browser peer exposes to the signalling server.
		 * these are the levers that the signal server can pull to control each peer during the connection process.
		 * the signal server acts like a "traffic cop" (with the whistle), directing each peer to coordinate a successful connection.
		 */
		partner: Renraku.serviette(() => ({
			async startPeerConnection() {
				onConnectionStatus("start")
				if (peerUnit) peerUnit.peer.close()
				peerUnit = make_peer_unit({peering, rtcConfig})
			},

			async produceOffer(): Promise<any> {
				onConnectionStatus("offer")
				const {peer} = requirePeerUnit()
				ready = establishChannels.offering(peer)
					.then(channels => onReady(peer, channels))
				const offer = await peer.createOffer()
				await peer.setLocalDescription(offer)
				return offer
			},

			async produceAnswer(offer: RTCSessionDescription): Promise<any> {
				onConnectionStatus("answer")
				const {peer} = requirePeerUnit()
				ready = establishChannels.answering(peer)
					.then(channels => onReady(peer, channels))
				await peer.setRemoteDescription(offer)
				const answer = await peer.createAnswer()
				await peer.setLocalDescription(answer)
				return answer
			},

			async acceptAnswer(answer: RTCSessionDescription): Promise<void> {
				onConnectionStatus("accept")
				const {peer} = requirePeerUnit()
				await peer.setRemoteDescription(answer)
			},

			async acceptIceCandidate(ice: RTCIceCandidate): Promise<void> {
				const {peer} = requirePeerUnit()
				await peer.addIceCandidate(ice)
			},

			async waitUntilReady() {
				onConnectionStatus("trickle")
				const {ice, connection} = requirePeerUnit()
				return Promise.all([ready, ice, connection])
					.then(() => {})
			},

		})),
	})

	return Renraku.api({v1})
}

