import { pub } from "../../toolbox/pub.js";
import { renderWorld } from "../utils/render-world.js";
import { noop as html } from "../../toolbox/template-noop.js";
import { joinSessionAsClient } from "../../connect/join-session-as-client.js";
export async function initializeHeartbeatClient({ app, timeout, sessionId, rtcConfig, heartbeatPeriod, signalServerUrl, }) {
    let lastCommunication = Date.now();
    let world = {
        hostTime: 0,
        clients: {},
    };
    function render(state) {
        var _a;
        app.innerHTML = state.sessionInfo ?
            html `
				<section>
					<p>session type <span data-cool="2">client</span></p>
					<p>session id <span data-cool>${state.sessionInfo.id}</span></p>
					<p>session label <span data-cool>${state.sessionInfo.label}</span></p>
					<p>session discoverable <span data-cool>${state.sessionInfo.discoverable}</span></p>
					<p>client id <span data-cool>${(_a = state.clientId) !== null && _a !== void 0 ? _a : "(no client id)"}</span></p>
				</section>
				${renderWorld(world)}
			` :
            html `
				<p>no session</p>
			`;
    }
    const closeEvent = pub();
    const clientConnection = await joinSessionAsClient({
        sessionId,
        rtcConfig,
        signalServerUrl,
        handleJoin({ send, close }) {
            lastCommunication = Date.now();
            const unsubscribeCloseEvent = closeEvent.subscribe(close);
            const interval = setInterval(() => {
                const timeSinceLastCommunication = Date.now() - lastCommunication;
                if (timeSinceLastCommunication > timeout) {
                    console.log("host timed out");
                    close();
                }
                else {
                    const update = JSON.stringify({ clientTime: Date.now() });
                    send(update);
                }
            }, heartbeatPeriod);
            return {
                handleClose() {
                    clearInterval(interval);
                    unsubscribeCloseEvent();
                },
                handleMessage(message) {
                    lastCommunication = Date.now();
                    const newWorld = JSON.parse(message);
                    world = newWorld;
                    render(clientConnection.state);
                },
            };
        },
        onStateChange: render,
    });
    window.onbeforeunload = () => {
        closeEvent.publish();
    };
}
//# sourceMappingURL=initialize-heartbeat-client.js.map