
import {pub} from "../../toolbox/pub.js"
import {ClientState} from "../../types.js"
import {renderWorld} from "./utils/render-world.js"
import {HeartbeatOptions, HeartbeatWorld} from "./types.js"
import {noop as html} from "../../toolbox/template-noop.js"
import {joinSessionAsClient} from "../../connect/join-session-as-client.js"

export async function initializeHeartbeatClient({
		app,
		timeout,
		sessionId,
		rtcConfig,
		heartbeatPeriod,
		signalServerUrl,
	}: HeartbeatOptions & {
		app: HTMLElement
		sessionId: string
	}) {

	let lastCommunication = Date.now()

	let world: HeartbeatWorld = {
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

	const clientConnection = await joinSessionAsClient({
		sessionId,
		rtcConfig,
		signalServerUrl,
		handleJoin({send, close}) {
			lastCommunication = Date.now()
			const unsubscribeCloseEvent = closeEvent.subscribe(close)
			const interval = setInterval(() => {
				const timeSinceLastCommunication = Date.now() - lastCommunication
				if (timeSinceLastCommunication > timeout) {
					console.log("host timed out")
					close()
				}
				else {
					const update = JSON.stringify({clientTime: Date.now()})
					send(update)
				}
			}, heartbeatPeriod)
			return {
				handleClose() {
					clearInterval(interval)
					unsubscribeCloseEvent()
				},
				handleMessage(message) {
					lastCommunication = Date.now()
					const newWorld = JSON.parse(<string>message)
					world = newWorld
					render(clientConnection.state)
				},
			}
		},
		onStateChange: render,
	})

	window.onbeforeunload = () => {
		closeEvent.publish()
	}
}
