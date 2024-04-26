
import {Field} from "../../types/field.js"
import {Values} from "../../types/values.js"
import {ArgvError} from "../../errors/argv-error.js"

export function validateRequirements(fields: Field.Group, values: Values) {
	for (const [key, field] of Object.entries(fields)) {
		if (field.mode === "requirement")
			if (!(key in values))
				throw new ArgvError(`missing required arg "${key}"`)
	}
}
