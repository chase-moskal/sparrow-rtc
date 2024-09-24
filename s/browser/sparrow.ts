
import {ConnectOptions} from "./types.js"

export class Sparrow {
	static options(): ConnectOptions {
		return {
			url: `wss://sparrow.benev.gg/`,
		}
	}

	static async connect(options: ConnectOptions) {
		// const socket = new WebSocket()
		// return new this()
	}

	constructor(socket: WebSocket) {}
}

