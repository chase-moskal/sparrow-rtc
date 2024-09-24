
import {ConnectionStatus} from "../types.js"

export class ConnectionReport {
	#iceCount = 0
	#status: ConnectionStatus = "start"

	constructor(public onChange: (report: ConnectionReport) => void) {}

	get iceCount() { return this.#iceCount }
	set iceCount(x: number) {
		this.#iceCount = x
		this.onChange(this)
	}

	get status() { return this.#status }
	set status(s: ConnectionStatus) {
		this.#status = s
		this.onChange(this)
	}

	reset() {
		this.#iceCount = 0
		this.#status = "init"
		this.onChange(this)
	}
}

