
import {val} from "./val.js"
import {mode} from "./mode.js"
import {stype} from "./stype.js"
import {Theme} from "../../theme.js"
import {textblock} from "./textblock.js"
import {Type} from "../../types/type.js"
import {Field} from "../../types/field.js"
import {defaultValue} from "./default-value.js"

export function fieldReport({
		name,
		columns,
		field,
		value,
		theme,
		color,
	}: {
		name: string
		columns: number
		theme: Theme
		field: Field.Any<Type>
		value: undefined | {v: any}
		color: (s: string) => string
	}) {

	let report = ""

	report += "\n"
	report += textblock({
		columns,
		indent: [1, " "],
		text: `${color(name)}`
			+ ` ${mode(theme, field.mode)}`
			+ ` ${theme.type(stype(field.type))}`
			+ `${defaultValue(theme, <any>field)}`
			+ (value
				? " " + theme.detected("got ") + theme.value(val(value.v))
				: "")
			,
	})

	if (field.help)
		report += "\n" + textblock({
			columns,
			indent: [3, " "],
			text: field.help,
		})

	return report
}
