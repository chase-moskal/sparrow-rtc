
import {AllowJoinFn} from "../types.js"

export const allowEveryone = (): AllowJoinFn => {
	return async() => true
}

