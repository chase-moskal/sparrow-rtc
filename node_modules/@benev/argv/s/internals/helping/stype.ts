
import {Type} from "../../types/type.js"

export function stype(type: Type) {
	switch (type) {

		case String:
			return "string"

		case Number:
			return "number"

		case Boolean:
			return "boolean"

		default:
			return "unknown"
	}
}
