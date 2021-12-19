
import {renrakuWebSocketClient} from "renraku/x/websocket/socket-client.js"

import {noop as html} from "../toolbox/template-noop.js"
import {makeSignalServerApi} from "../signal/apis/make-signal-server-api.js"
import {makeSignalBrowserApi} from "../signal/apis/make-signal-browser-api.js"
import {Session, SessionInfo, SignalBrowserClient, SignalBrowserHost} from "../types.js"

const heartbeatPeriod = 21

const rtcConfig: RTCConfiguration = {
	iceServers: [
		{
			urls: [
				"stun:stun.l.google.com:19302",
				"stun:stun1.l.google.com:19302",
				"stun:stun2.l.google.com:19302",
				"stun:stun3.l.google.com:19302",
				"stun:stun4.l.google.com:19302",
			]
		},
	]
}

const duds = {
	host: <SignalBrowserHost>{
		async handleJoiner() { throw new Error("nope") },
		async handleAnswer() { throw new Error("nope") },
		async handleIceCandidates() { throw new Error("nope") },
	},
	client: <SignalBrowserClient>{
		async handleOffer() { throw new Error("nope") },
		async handleIceCandidates() { throw new Error("nope") },
	},
}

void async function main() {
	console.log("💖 sparrow demo")
	const sessionId = parseHashForSessionId(location.hash)
	const app = <HTMLElement>document.querySelector(".app")
	if (sessionId)
		await initializeClientSession({app, sessionId})
	else
		await initializeHostSession({app})
}()

function parseHashForSessionId(hash: string) {
	hash = (hash.length && hash[0] === "#")
		? hash.slice(1)
		: hash
	const result = hash.match(/^session=(\S+)($|\&)/i)
	return result
		? result[1]
		: undefined
}

async function initializeHostSession({app}: {app: HTMLElement}) {
	const peerDetails = new Map<string, {
		peer: RTCPeerConnection
		iceQueue: ReturnType<typeof makeQueue>
	}>()

	const simple = simplestate({
		state: {
			session: undefined as Session | undefined,
			clientTime: undefined as number | undefined,
		},
		render: state => {
			app.innerHTML = html`
				<p>host session</p>
				${state.session
					? html`
						<p>session id: ${state.session.id}</p>
						<p>
							${(() => {
								const link = makeSessionLink(state.session.id)
								return html`<a target="_blank" href="${link}">${link}</a>`
							})()}
						</p>
						${state.clientTime
							? html`<p>client time: <span class="time">${state.clientTime}</span></p>`
							: ""}
					`
					: html`
						<p>establishing session...</p>
					`}
			`
		}
	})

	const connection = await connectToSignalServer({
		client: duds.client,
		host: {
			async handleJoiner(clientId) {
				console.log("clientId", clientId)
				const peer = new RTCPeerConnection(rtcConfig)
				const iceQueue = makeQueue(
					async(candidates: any[]) => connection.signalServer.hosting.submitIceCandidates(clientId, candidates)
				)
				peer.onicecandidate = event => {
					const candidate = event.candidate
					if (candidate) {
						console.log("ON ICE CANDIDATE", event)
						iceQueue.add(candidate)
					}
				}
				console.log("peer established", peer)
				const channel = peer.createDataChannel("data", {
					ordered: false,
					maxRetransmits: undefined,
					
				})
				console.log("data channel", channel)
				let interval: any
				function startHeartbeat() {
					interval = setInterval(() => {
						const hostTime = Date.now()
						channel.send(JSON.stringify({hostTime}))
					}, heartbeatPeriod)
				}
				channel.onopen = () => {
					console.log("DATACHANNEL OPEN")
					startHeartbeat()
				}
				channel.onclose = () => {
					console.log("DATACHANNEL CLOSE")
					clearInterval(interval)
				}
				channel.onmessage = event => {
					const {clientTime} = JSON.parse(event.data)
					simple.state = {...simple.state, clientTime}
				}
				console.log("creating offer")
				const offer = await peer.createOffer()
				console.log("offer", offer)
				peer.setLocalDescription(offer)
				peerDetails.set(clientId, {peer, iceQueue})
				return {offer}
			},
			async handleAnswer(clientId, answer) {
				const {peer, iceQueue} = peerDetails.get(clientId)!
				await peer.setRemoteDescription(new RTCSessionDescription(answer))
				await iceQueue.ready()
			},
			async handleIceCandidates(clientId, candidates) {
				const {peer} = peerDetails.get(clientId)!
				console.log("handle ice candidates", candidates)
				for (const candidate of candidates)
					await peer.addIceCandidate(candidate)
				console.log("added ice candidates")
			},
		},
	})

	const session = await connection.signalServer.hosting.establishSession({
		discoverable: true,
		label: "test session",
	})

	simple.state = {...simple.state, session}

	return {}
}

async function initializeClientSession({app, sessionId}: {
		app: HTMLElement
		sessionId: string
	}) {

	const peer = new RTCPeerConnection(rtcConfig)

	const connection = await connectToSignalServer({
		host: duds.host,
		client: {
			async handleIceCandidates(candidates) {
				console.log("handle ice candidates", candidates)
				for (const candidate of candidates)
					await peer.addIceCandidate(candidate)
				console.log("ice candidates added")
			},
		},
	})

	const simple = simplestate({
		state: {
			sessionInfo: undefined as SessionInfo | undefined,
			clientId: undefined as string | undefined,
			hostTime: undefined as number | undefined,
		},
		render: state => {
			app.innerHTML = html`
				<p>client session</p>
				${state.sessionInfo
					? html`
						<p>session id: ${state.sessionInfo.id}</p>
						<p>session label: ${state.sessionInfo.label}</p>
						<p>session discoverable: ${state.sessionInfo.discoverable}</p>
						${state.hostTime
							? html`<p>client time: <span class="time">${state.hostTime}</span></p>`
							: ""}
					`
					: html`
						<p>no session</p>
					`}
			`
		}
	})

	const iceQueue = makeQueue(
		async(candidates: any[]) => await connection.signalServer.connecting
			.submitIceCandidates(sessionId, simple.state.clientId!, candidates)
	)

	peer.onicecandidate = event => {
		const candidate = event.candidate
		if (candidate) {
			console.log("ICE CANDIDATE", candidate)
			iceQueue.add(candidate)
		}
	}

	peer.ondatachannel = event => {
		const channel = event.channel
		console.log("RECEIVED DATA CHANNEL", channel)
		let interval: any
		function startHeartbeat() {
			interval = setInterval(() => {
				channel.send(JSON.stringify({clientTime: Date.now()}))
			}, heartbeatPeriod)
		}
		channel.onopen = () => {
			console.log("data channel open")
			startHeartbeat()
		}
		channel.onclose = () => {
			console.log("data channel closed")
			clearInterval(interval)
		}
		channel.onmessage = event => {
			const {hostTime} = JSON.parse(event.data)
			simple.state = {...simple.state, hostTime}
		}
	}

	const result = await connection.signalServer.connecting.joinSession(sessionId)
	if (result) {
		simple.state = {
			clientId: result.clientId,
			sessionInfo: result.sessionInfo,
			hostTime: undefined,
		}
		console.log("offer", result.offer)
		await peer.setRemoteDescription(result.offer)
		const answer = await peer.createAnswer()
		console.log("create answer", answer)
		await peer.setLocalDescription(new RTCSessionDescription(answer))
		const {clientId, sessionInfo} = result
		await connection.signalServer.connecting.submitAnswer(sessionInfo.id, clientId, answer)
		console.log("submitted answer")
		await iceQueue.ready()
	}

	return {}
}

function makeQueue<X>(action: (x: X[]) => Promise<void>) {
	let queue: X[] = []
	let isReady = false
	return {
		async add(x: X) {
			if (isReady)
				await action([x])
			else
				queue.push(x)
		},
		async ready() {
			isReady = true
			if (queue.length)
				await action(queue)
		},
	}
}

function simplestate<xState extends {}>({state: initialState, render}: {
		state: xState
		render: (state: xState) => void
	}) {
	let currentState = initialState
	render(currentState)
	return {
		get state() {
			return currentState
		},
		set state(s: xState) {
			currentState = s
			render(currentState)
		},
	}
}

function makeSessionLink(sessionId: string) {
	const url = new URL(window.location.href)
	url.hash = `#session=${sessionId}`
	return url.toString()
}

async function connectToSignalServer({host, client}: {
		host: SignalBrowserHost
		client: SignalBrowserClient
	}) {
	const {remote, close} = await renrakuWebSocketClient<ReturnType<typeof makeSignalServerApi>>({
		link: "ws://localhost:8192/",
		clientApi: makeSignalBrowserApi({
			host,
			client,
		}),
		handleConnectionClosed() {},
		metaMap: {
			hosting: async() => {},
			discovery: async() => {},
			connecting: async() => {},
		},
	})
	return {
		signalServer: remote,
		close,
	}
}
