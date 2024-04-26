
import {Values} from "../../types/values.js"

export function retrieveValue(values: Values, name: string) {
	return name in values
		? {v: values[name]}
		: undefined
}
