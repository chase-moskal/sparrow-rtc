import { pub } from "../../toolbox/pub.js";
import { renderWorld } from "../utils/render-world.js";
import { noop as html } from "../../toolbox/template-noop.js";
import { sessionLink } from "../../toolbox/links/session-link.js";
import { createSessionAsHost } from "../../connect/create-session-as-host.js";
export async function initializeHeartbeatHost({ app, timeout, rtcConfig, sessionLabel, signalServerUrl, heartbeatPeriod, }) {
    const clients = new Set();
    function calculateWorld() {
        return {
            hostTime: Date.now(),
            clients: (() => {
                const worldClients = {};
                for (const client of clients)
                    worldClients[client.controls.clientId] = { clientTime: client.clientTime };
                return worldClients;
            })(),
        };
    }
    function render(state) {
        app.innerHTML = state.session ?
            html `
				<section>
					<p>session type <span data-cool="2">host</span></p>
					<p>session id <span data-cool>${state.session.id}</span></p>
					<p>
						session join link
						${(() => {
                const link = sessionLink(location.href, "session", state.session.id);
                return html `<a target="_blank" href="${link}">${link}</a>`;
            })()}
					</p>
				</section>
				${renderWorld(calculateWorld())}
			` :
            html `
				<p>...establishing session...</p>
			`;
    }
    const closeEvent = pub();
    const hostConnection = await createSessionAsHost({
        rtcConfig,
        signalServerUrl,
        label: sessionLabel,
        handleJoin(controls) {
            const client = { controls, clientTime: 0, lastTime: Date.now() };
            clients.add(client);
            const unsubscribeCloseListener = closeEvent.subscribe(controls.close);
            return {
                handleClose() {
                    clients.delete(client);
                    unsubscribeCloseListener();
                },
                handleMessage(message) {
                    client.lastTime = Date.now();
                    const { clientTime } = JSON.parse(message);
                    if (typeof clientTime !== "number")
                        throw new Error("clientTime failed validation");
                    client.clientTime = clientTime;
                },
            };
        },
        onStateChange: state => render(state),
    });
    setInterval(() => {
        const timedOutClients = [];
        for (const client of clients) {
            const timeSinceLastMessage = Date.now() - client.lastTime;
            if (timeSinceLastMessage > timeout) {
                timedOutClients.push(client);
            }
        }
        for (const client of timedOutClients) {
            console.log(`client timed out ${client.controls.clientId}`);
            client.controls.close();
            clients.delete(client);
        }
        const world = calculateWorld();
        render(hostConnection.state);
        for (const client of clients)
            client.controls.send(JSON.stringify(world));
    }, heartbeatPeriod);
    window.onbeforeunload = () => {
        closeEvent.publish();
    };
}
//# sourceMappingURL=initialize-heartbeat-host.js.map