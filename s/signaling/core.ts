
import {Sessions} from "./parts/sessions.js"
import {BrowserApi} from "../browser/api.js"
import {People, Person} from "./parts/people.js"
import {FunnyNames} from "../tools/funny-names.js"

export class Core {
	people = new People()
	sessions = new Sessions()
	#funnyNames = new FunnyNames()

	acceptNewPerson(browserApi: BrowserApi, disconnect: () => void) {
		const name = this.#funnyNames.generate()
		const person = new Person(name, browserApi, disconnect)
		this.people.add(person)
		return person
	}

	personDisconnected(person: Person) {
		this.people.remove(person)
	}
}

