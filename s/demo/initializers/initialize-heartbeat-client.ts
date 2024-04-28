
import {pub} from "../../toolbox/pub.js"
import {ClientState} from "../../types.js"
import {renderWorld} from "../utils/render-world.js"
import {noop as html} from "../../toolbox/template-noop.js"
import {HeartbeatOptions, HeartbeatWorld} from "../types.js"
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

	app.innerHTML = html`<p>...establishing connection...</p>`

	let lastCommunication = Date.now()

	let world: HeartbeatWorld = {
		hostTime: 0,
		clients: {},
	}

	function renderClientState(clientId: string, {sessionInfo}: ClientState) {
		app.innerHTML = html`
			<section>
				<p>session type <span data-cool="2">client</span></p>
				<p>session id <span data-cool>${sessionInfo.id}</span></p>
				<p>session label <span data-cool>${sessionInfo.label}</span></p>
				<p>session discoverable <span data-cool>${sessionInfo.discoverable}</span></p>
				<p>client id <span data-cool>${clientId}</span></p>
			</section>
			${renderWorld(world)}
		`
	}

	function renderConnectionLost() {
		app.innerHTML = html`<p>connection lost</p>`
	}

	const closeEvent = pub()

	const clientConnection = await joinSessionAsClient({
		sessionId,
		rtcConfig,
		signalServerUrl,
		onClosed() {
			renderConnectionLost()
		},
		handleJoin({send, close}) {
			lastCommunication = Date.now()
			const unsubscribeCloseEvent = closeEvent.subscribe(close)
			const interval = setInterval(() => {
				const timeSinceLastCommunication = Date.now() - lastCommunication
				if (timeSinceLastCommunication > timeout) {
					console.log("host timed out")
					renderConnectionLost()
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
					const {clientId, state} = clientConnection
					renderClientState(clientId, state)
				},
			}
		},
		onStateChange: state => renderClientState(clientConnection.clientId, state),
	})

	window.onbeforeunload = () => {
		closeEvent.publish()
	}
}
