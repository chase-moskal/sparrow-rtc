
import {Sessions} from "./sessions.js"
import {Connections} from "./connections.js"

export class SignalCore {
	readonly sessions = new Sessions()
	readonly connections = new Connections()
}

