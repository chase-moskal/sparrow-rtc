
import {Sessions} from "./parts/sessions.js"
import {BrowserApi} from "../browser/api.js"
import {People, Person} from "./parts/people.js"

export class Core {
	people = new People()
	sessions = new Sessions()

	async acceptNewPerson(
			ip: string,
			browserApi: BrowserApi,
			disconnect: () => void,
		) {
		const person = await Person.make(ip, browserApi, disconnect)
		this.people.add(person)
		return person
	}

	personDisconnected(person: Person) {
		this.people.remove(person)

		// remove any rooms which this person is hosting
		for (const room of this.sessions.values()) {
			if (room.host === person) {
				this.sessions.delete(room.id)
				break
			}
		}
	}
}

