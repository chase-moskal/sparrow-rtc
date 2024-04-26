
import {Theme} from "../../theme.js"
import {Field} from "../../types/field.js"

export function mode(theme: Theme, mode: Field.Mode) {
	switch (mode) {

		case "requirement":
			return theme.required("required")

		case "option":
			return theme.mode("optional")

		case "default":
			return theme.mode("default")
	}
}
