
import {Pool} from "../../tools/map2.js"
import {hash} from "../../tools/hash.js"
import {hexId} from "../../tools/hex-id.js"
import {pubsub} from "../../tools/pubsub.js"
import {BrowserApi} from "../../browser/api.js"

export class People extends Pool<Person> {}

export class Person {
	static salt = hexId()

	static async make(
			ip: string,
			browserApi: BrowserApi,
			disconnect: () => void,
		) {
		const tag = await hash(ip + this.salt)
		return new this(tag, browserApi, disconnect)
	}

	id = hexId()
	onIceCandidate = pubsub<[RTCIceCandidate]>()

	constructor(
			public tag: string,
			public browserApi: BrowserApi,
			public disconnect: () => void,
		) {
	}

	info(): PersonInfo {
		return {
			id: this.id,
			tag: this.tag,
		}
	}
}

export type PersonInfo = {

	/** identifier for the connection. */
	id: string

	/** identifier derived from the user's ip address. makes persistent bans possible. */
	tag: string
}

