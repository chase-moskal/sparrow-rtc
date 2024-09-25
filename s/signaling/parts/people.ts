
import {Pool} from "../../tools/map2.js"
import {hexId} from "../../tools/hex-id.js"
import {BrowserApi} from "../../browser/api.js"
import {asyncPub} from "../../tools/async-pub.js"

export class People extends Pool<Person> {}

export class Person {
	id = hexId()
	onIceCandidate = asyncPub<[RTCIceCandidate]>()

	constructor(
		public name: string,
		public browserApi: BrowserApi,
		public disconnect: () => void,
	) {}
}

