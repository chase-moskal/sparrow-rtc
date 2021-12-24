
import {pub} from "../toolbox/pub.js"
import {ClientState, HostState} from "../types.js"
import {sessionLink} from "../toolbox/session-link.js"
import {noop as html} from "../toolbox/template-noop.js"
import {joinSessionAsClient} from "../connect/join-session-as-client.js"
import {createSessionAsHost} from "../connect/create-session-as-host.js"
import {standardRtcConfig} from "../connect/utils/standard-rtc-config.js"
import {parseHashForSessionId} from "../toolbox/parse-hash-for-session-id.js"

const heartbeatPeriod = 101

void async function main() {
	console.log("💖 sparrow demo")
	const sessionId = parseHashForSessionId(location.hash)
	const app = <HTMLElement>document.querySelector(".app")
	if (sessionId)
		await initializeClientSession({app, sessionId})
	else
		await initializeHostSession({app})
}()

interface World {
	hostTime: number
	clients: {
		[clientId: string]: {
			clientTime: number | undefined
		}
	}
}

async function initializeHostSession({app}: {app: HTMLElement}) {
	const world: World = {
		hostTime: Date.now(),
		clients: {},
	}

	function render(state: HostState) {
		app.innerHTML = state.session?
			html`
				<section>
					<p>session type <span data-cool="2">host</span></p>
					<p>session id <span data-cool>${state.session.id}</span></p>
					<p>
						session join link
						${(() => {
							const link = sessionLink(location.href, state.session.id)
							return html`<a target="_blank" href="${link}">${link}</a>`
						})()}
					</p>
				</section>
				${renderWorld(world)}
			`:
			html`
				<p>...establishing session...</p>
			`
	}

	const worldActions = {
		updateHostTime() {
			world.hostTime = Date.now()
			render(session.getState())
		},
		addClient(clientId: string) {
			world.clients[clientId] = {clientTime: undefined}
			render(session.getState())
		},
		updateClientTime(clientId: string, clientTime: number) {
			world.clients[clientId].clientTime = clientTime
			render(session.getState())
		},
		removeClient(clientId: string) {
			delete world.clients[clientId]
			render(session.getState())
		},
	}

	const closeEvent = pub()

	const session = await createSessionAsHost({
		rtcConfig: standardRtcConfig,
		signalServerUrl: `ws://${location.hostname}:8192/`,
		handleJoin({clientId, send, close}) {
			worldActions.addClient(clientId)
			const interval = setInterval(() => {
				worldActions.updateHostTime()
				send(JSON.stringify(world))
			}, heartbeatPeriod)
			closeEvent.subscribe(close)
			return {
				handleClose() {
					clearInterval(interval)
					worldActions.removeClient(clientId)
				},
				handleMessage(message) {
					const {clientTime} = JSON.parse(<string>message)
					worldActions.updateClientTime(clientId, clientTime)
				},
			}
		},
		onStateChange: render,
	})

	window.onbeforeunload = () => {
		closeEvent.publish()
	}
}

async function initializeClientSession({app, sessionId}: {
		app: HTMLElement
		sessionId: string
	}) {

	let world: World = {
		hostTime: 0,
		clients: {},
	}

	function render(state: ClientState) {
		app.innerHTML = state.sessionInfo?
			html`
				<section>
					<p>session type <span data-cool="2">client</span></p>
					<p>session id <span data-cool>${state.sessionInfo.id}</span></p>
					<p>session label <span data-cool>${state.sessionInfo.label}</span></p>
					<p>session discoverable <span data-cool>${state.sessionInfo.discoverable}</span></p>
					<p>client id <span data-cool>${state.clientId ?? "(no client id)"}</span></p>
				</section>
				${renderWorld(world)}
			`:
			html`
				<p>no session</p>
			`
	}

	const closeEvent = pub()

	const connection = await joinSessionAsClient({
		sessionId,
		rtcConfig: standardRtcConfig,
		signalServerUrl: `ws://${location.hostname}:8192/`,
		handleJoin({send, close}) {
			const interval = setInterval(() => {
				const update = JSON.stringify({clientTime: Date.now()})
				send(update)
				closeEvent.subscribe(close)
			}, heartbeatPeriod)
			return {
				handleClose() {
					clearInterval(interval)
					console.log("onClose")
				},
				handleMessage(message) {
					const newWorld = JSON.parse(<string>message)
					world = newWorld
					render(connection.getState())
				},
			}
		},
		onStateChange: render,
	})

	window.onbeforeunload = () => {
		closeEvent.publish()
	}
}

function renderWorld(world: World) {
	return html`
		<p>host <span data-cool="1">${world.hostTime}</span></p>
		<ol>
			${Object.entries(world.clients).map(([id, {clientTime}]) => html`
				<li>${id} <span data-cool="1">${clientTime}</span></li>
			`).join("\n")}
		</ol>
	`
}
