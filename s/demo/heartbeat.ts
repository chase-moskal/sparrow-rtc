
import {host} from "../connect/host.js"
import {client} from "../connect/client.js"
import {ClientState, HostState} from "../types.js"
import {sessionLink} from "../toolbox/session-link.js"
import {noop as html} from "../toolbox/template-noop.js"
import {generateRandomId} from "../toolbox/generate-random-id.js"
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
		},
	}
}

async function initializeHostSession({app}: {app: HTMLElement}) {
	const world: World = {
		hostTime: Date.now(),
		clients: {},
	}

	function render(state: HostState) {
		app.innerHTML = html`
			<p>host session</p>
			${state.session?
				html`
					<p>session id: ${state.session.id}</p>
					<p>
						${(() => {
							const link = sessionLink(location.href, state.session.id)
							return html`<a target="_blank" href="${link}">${link}</a>`
						})()}
					</p>
					${renderClients(world)}
				`:
				html`
					<p>establishing session...</p>
				`}
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

	const session = await host({
		rtcConfig: standardRtcConfig,
		signalServerUrl: `ws://${location.hostname}:8192/`,
		handleJoin({send, close}) {
			const clientId = generateRandomId()
			worldActions.addClient(clientId)
			const interval = setInterval(() => {
				worldActions.updateHostTime()
				send(JSON.stringify(world))
			}, heartbeatPeriod)
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
		app.innerHTML = html`
			<p>client session</p>
			${state.sessionInfo
				? html`
					<p>session id: ${state.sessionInfo.id}</p>
					<p>session label: ${state.sessionInfo.label}</p>
					<p>session discoverable: ${state.sessionInfo.discoverable}</p>
					<hr/>
					<p>host time: <span class=time>${world.hostTime}</span></p>
					${renderClients(world)}
				`
				: html`
					<p>no session</p>
				`}
		`
	}

	const connection = await client({
		sessionId,
		rtcConfig: standardRtcConfig,
		signalServerUrl: `ws://${location.hostname}:8192/`,
		handleJoin({send, close}) {
			const interval = setInterval(() => {
				const update = JSON.stringify({clientTime: Date.now()})
				send(update)
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
}

function renderClients(world: World) {
	return html`
		<ol>
			${Object.entries(world.clients).map(([id, {clientTime}]) => html`
				<li>${id} <span class=time>${clientTime}</span></li>
			`).join("\n")}
		</ol>
	`
}
