
import {Id} from "../../types.js"

export class IdMap<O extends {id: Id}> extends Map<Id, O> {
	add(o: O) {
		this.set(o.id, o)
	}

	require(id: Id) {
		const o = this.get(id)
		if (!o) throw new Error("not found")
		return o
	}
}

