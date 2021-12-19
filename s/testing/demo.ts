
import {renrakuWebSocketClient} from "renraku/x/websocket/socket-client.js"

import {Session, SessionInfo} from "../types.js"
import {noop as html} from "../toolbox/template-noop.js"
import {makeSignalServerApi} from "../signal/apis/make-signal-server-api.js"
import {makeSignalBrowserApi} from "../signal/apis/make-signal-browser-api.js"

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
	async function handleJoiner(clientId: string) {
		console.log("clientId", clientId)
		return {
			offer: "offer",
		}
	}
	const connection = await connectToSignalServer({handleJoiner})

	const simple = simplestate({
		state: {
			session: undefined as undefined | Session
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
					`
					: html`
						<p>establishing session...</p>
					`}
			`
		}
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

	const connection = await connectToSignalServer({
		handleJoiner: () => {
			throw new Error("client cannot accept a join request")
		}
	})

	const simple = simplestate({
		state: {
			sessionInfo: undefined as SessionInfo | undefined,
			clientId: undefined as string | undefined,
		},
		render: state => {
			app.innerHTML = html`
				<p>client session</p>
				${state.sessionInfo
					? html`
						<p>session id: ${state.sessionInfo.id}</p>
						<p>session label: ${state.sessionInfo.label}</p>
						<p>session discoverable: ${state.sessionInfo.discoverable}</p>
					`
					: html`
						<p>no session</p>
					`}
			`
		}
	})

	const result = await connection.signalServer.connecting.joinSession(sessionId)
	if (result) {
		simple.state = {
			clientId: result.clientId,
			sessionInfo: result.sessionInfo,
		}
		console.log("offer", result.offer)
	}

	return {}
}

function simplestate<xState extends {}>({state: initialState, render}: {
		state: xState,
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

async function connectToSignalServer({handleJoiner}: {
		handleJoiner(clientId: string): Promise<{offer: any}>
	}) {
	const {remote, close} = await renrakuWebSocketClient<ReturnType<typeof makeSignalServerApi>>({
		link: "ws://localhost:8192/",
		clientApi: makeSignalBrowserApi({handleJoiner}),
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
