
import {pub} from "../../toolbox/pub.js"
import {renderWorld} from "../utils/render-world.js"
import {ChannelControls, HostState} from "../../types.js"
import {noop as html} from "../../toolbox/template-noop.js"
import {HeartbeatOptions, HeartbeatWorld} from "../types.js"
import {sessionLink} from "../../toolbox/links/session-link.js"
import {createSessionAsHost} from "../../connect/create-session-as-host.js"

export async function initializeHeartbeatHost({
		app,
		timeout,
		rtcConfig,
		sessionLabel,
		signalServerUrl,
		heartbeatPeriod,
	}: HeartbeatOptions & {
		app: HTMLElement
		sessionLabel: string
	}) {

	app.innerHTML = html`<p>...establishing session...</p>`

	type Client = {
		controls: ChannelControls
		clientTime: number
		lastTime: number
	}

	const clients = new Set<Client>()

	function calculateWorld() {
		return {
			hostTime: Date.now(),
			clients: (() => {
				const worldClients: HeartbeatWorld["clients"] = {}
				for (const client of clients)
					worldClients[client.controls.clientId] = {clientTime: client.clientTime}
				return worldClients
			})(),
		}
	}

	function renderHostState({session, signalServerPing}: HostState) {
		app.innerHTML = html`
			<section>
				<p>session type <span data-cool="2">host</span></p>
				<p>session id <span data-cool>${session.id}</span></p>
				<p>signal server ping <span data-cool>${signalServerPing}</span></p>
				<p>
					session join link
					${(() => {
						const link = sessionLink(location.href, "session", session.id)
						return html`<a target="_blank" href="${link}">${link}</a>`
					})()}
				</p>
			</section>
			${renderWorld(calculateWorld())}
		`
	}

	const closeEvent = pub()

	const hostConnection = await createSessionAsHost({
		rtcConfig,
		signalServerUrl,
		label: sessionLabel,
		onConnectionLost() {
			app.innerHTML = html`<p>connection lost! refresh to try again</p>`
		},
		handleJoin(controls) {
			const client = {controls, clientTime: 0, lastTime: Date.now()}
			clients.add(client)
			const unsubscribeCloseListener = closeEvent.subscribe(controls.close)
			return {
				handleClose() {
					clients.delete(client)
					unsubscribeCloseListener()
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
		onStateChange: state => renderHostState(state),
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

		const world = calculateWorld()
		renderHostState(hostConnection.state)
		for (const client of clients)
			client.controls.send(JSON.stringify(world))
	}, heartbeatPeriod)

	window.onbeforeunload = () => {
		closeEvent.publish()
	}
}

