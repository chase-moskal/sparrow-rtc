import {Theme} from "../theme.js"

export const stdcolumns = 72
export const mincolumns = 10

export const affirmatives = [
	"true",
	"yes",
	"y",
	"on",
	"ok",
	"enabled",
]

export function makeTips(theme: Theme) {

	const synonyms = affirmatives
		.filter(s => s !== "true")
		.map(s => theme.value(s))
		.join("/")

	const lines = [
		`${theme.param("--param value")} is same as ${theme.param(`--param="value"`)}`,
		`${theme.param("+param")} is shorthand for ${theme.param("--param=true")}`,
		`${theme.value("true")} has synonyms ${synonyms}`
	]

	return lines
		.map(s => theme.tip("~ ") + s)
		.join("\n")
}
