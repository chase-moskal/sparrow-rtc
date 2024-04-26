
import {Type} from "../../types/type.js"
import {affirmatives} from "../constants.js"
import {TypeToValue} from "../../types/type-to-value.js"

export function parseValue<T extends Type>(
		type: T,
		arg: string,
	): TypeToValue<T> {

	switch (type) {

		case String:
			return <any>arg

		case Number:
			return <any>Number(arg)

		case Boolean:
			return <any>affirmatives.includes(arg.toLowerCase())

		default:
			throw new Error("unknown type")
	}
}
