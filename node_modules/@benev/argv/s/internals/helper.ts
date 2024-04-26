
import {Spec} from "../types/spec.js"
import {Field} from "../types/field.js"
import {makeTips, stdcolumns} from "./constants.js"
import {Values} from "../types/values.js"
import {stdtheme} from "../theme.js"
import {textblock} from "./helping/textblock.js"
import {fieldReport} from "./helping/field-report.js"
import {retrieveValue} from "./helping/retrieve-value.js"

export function *helper<FA extends Field.Group, FP extends Field.Group>({
		spec,
		args = {},
		params = {},
	}: {
		spec: Spec<FA, FP>,
		args?: Values
		params?: Values
	}) {

	const theme = spec.theme ?? stdtheme

	const tips = spec.tips ?? true
	const columns = (spec.columns ?? stdcolumns) - 4
	const argorder = <string[]>spec.argorder
	const argnum = argorder.length

	yield (
		theme.binary(spec.program)
		+ " "
		+ (
			argorder
				.map(a => theme.arg(`<${a}>`))
				.join(" ")
		)
		+ (argnum === 0 ?"" : " ")
		+ theme.param("{parameters}")
	)

	if (spec.readme)
		yield theme.readme("  readme ") + theme.link(spec.readme)
	
	if (spec.help)
		yield textblock({
			columns,
			indent: [2, " "],
			text: spec.help,
		})

	for (const name of argorder)
		yield fieldReport({
			name,
			columns,
			theme,
			field: spec.args[name],
			value: retrieveValue(args, name),
			color: theme.arg,
		})

	for (const [name, field] of Object.entries(spec.params))
		yield fieldReport({
			name: "--" + name,
			field,
			columns,
			theme,
			value: retrieveValue(params, name),
			color: theme.param,
		})

	if (tips) {
		yield ""
		yield theme.tip("tips")
		yield textblock({
			columns,
			indent: [2, " "],
			text: makeTips(theme),
		})
	}
}
