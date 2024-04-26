
import {Field} from "../../types/field.js"
import {Values} from "../../types/values.js"

export function applyDefaults(fields: Field.Group, values: Values) {
	for (const [key, field] of Object.entries(fields)) {
		if (field.mode === "default") {
			if (!(key in values)) {
				values[key] = field.default
			}
		}
	}
}
