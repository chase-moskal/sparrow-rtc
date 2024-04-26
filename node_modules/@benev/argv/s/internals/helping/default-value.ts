
import {val} from "./val.js"
import {Theme} from "../../theme.js"
import {Type} from "../../types/type.js"
import {Field} from "../../types/field.js"

export function defaultValue(theme: Theme, field: Field.Default<Type>) {
	return "default" in field
		? " " + theme.value(val(field.default))
		: ""
}
