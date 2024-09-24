
import {Pool} from "../../tools/map2.js"
import {hexId} from "../../tools/hex-id.js"

export class People extends Pool<Person> {}

export class Person {
	id = hexId()

	constructor(public settings: {
		name: string
	}) {}
}

