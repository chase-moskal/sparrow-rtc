
import {pub} from "../toolbox/pub.js"
import {sessionLink} from "../toolbox/session-link.js"
import {noop as html} from "../toolbox/template-noop.js"
import {ClientState, HostState, JoinerControls} from "../types.js"
import {joinSessionAsClient} from "../connect/join-session-as-client.js"
import {createSessionAsHost} from "../connect/create-session-as-host.js"
import {standardRtcConfig} from "../connect/utils/standard-rtc-config.js"
import {parseHashForSessionId} from "../toolbox/parse-hash-for-session-id.js"

const timeout = 10_000
const heartbeatPeriod = 101

void async function main() {
	console.log("💖 sparrow demo")
	const sessionId = parseHashForSessionId(location.hash)
	const app = <HTMLElement>document.querySelector(".app")
	if (sessionId)
		await initializeClientSession({app, sessionId})
	else
		await initializeHostSession({app})
	console.log("🌠 connected")
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
	type Client = {
		controls: JoinerControls
		clientTime: number
		lastTime: number
	}

	const clients = new Set<Client>()

	function calculateWorld() {
		return {
			hostTime: Date.now(),
			clients: (() => {
				const worldClients: World["clients"] = {}
				for (const client of clients)
					worldClients[client.controls.clientId] = {clientTime: client.clientTime}
				return worldClients
			})(),
		}
	}

	function render(state: HostState, world: World) {
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
				${renderWorld(calculateWorld())}
			`:
			html`
				<p>...establishing session...</p>
			`
	}

	const closeEvent = pub()

	const host = await createSessionAsHost({
		rtcConfig: standardRtcConfig,
		signalServerUrl: `ws://${location.hostname}:8192/`,
		handleJoin(controls) {
			const client = {controls, clientTime: 0, lastTime: Date.now()}
			clients.add(client)
			closeEvent.subscribe(close)
			return {
				handleClose() {
					clients.delete(client)
				},
				handleMessage(message) {
					client.lastTime = Date.now()
					const {clientTime} = JSON.parse(<string>message)
					if (typeof clientTime !== "number")
						throw new Error("clientTime failed validation")
					client.clientTime = clientTime
				},
			}
		},
		onStateChange: state => render(state, calculateWorld()),
	})

	setInterval(() => {
		const timedOutClients: Client[] = []
		for (const client of clients) {
			const timeSinceLastMessage = Date.now() - client.lastTime
			if (timeSinceLastMessage > timeout) {
				timedOutClients.push(client)
			}
		}
		for (const client of timedOutClients) {
			console.log(`client timed out ${client.controls.clientId}`)
			client.controls.close()
			clients.delete(client)
		}

		const state = host.state
		const world = calculateWorld()
		render(state, world)
		for (const client of clients)
			client.controls.send(JSON.stringify(world))
	}, heartbeatPeriod)

	window.onbeforeunload = () => {
		closeEvent.publish()
	}
}

async function initializeClientSession({app, sessionId}: {
		app: HTMLElement
		sessionId: string
	}) {

	let lastCommunication = Date.now()

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
			lastCommunication = Date.now()
			const interval = setInterval(() => {
				const timeSinceLastCommunication = Date.now() - lastCommunication
				if (timeSinceLastCommunication > timeout) {
					console.log("host timed out")
					close()
				}
				else {
					const update = JSON.stringify({clientTime: Date.now()})
					send(update)
					closeEvent.subscribe(close)
				}
			}, heartbeatPeriod)
			return {
				handleClose() {
					clearInterval(interval)
				},
				handleMessage(message) {
					lastCommunication = Date.now()
					const newWorld = JSON.parse(<string>message)
					world = newWorld
					render(connection.state)
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
