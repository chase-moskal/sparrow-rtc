
import {AllowFn} from "../types.js"

export const allowEveryone = (): AllowFn => {
	return async() => true
}

