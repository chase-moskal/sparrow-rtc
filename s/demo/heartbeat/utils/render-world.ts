
import {HeartbeatWorld} from "../types.js"
import {noop as html} from "../../../toolbox/template-noop.js"

export function renderWorld(world: HeartbeatWorld) {
	return html`
		<p>host <span data-cool="1">${world.hostTime}</span></p>
		<ol>
			${Object.entries(world.clients).map(([id, {clientTime}]) => html`
				<li>${id} <span data-cool="1">${clientTime}</span></li>
			`).join("\n")}
		</ol>
	`
}
