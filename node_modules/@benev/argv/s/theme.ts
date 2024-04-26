
import {color} from "./tools/colors.js"

export type Theme = typeof stdtheme

export const stdtheme = Object.freeze({
	binary: color.blue,
	arg: color.green,
	param: color.yellow,
	mode: color.blue,
	required: color.red,
	value: color.cyan,
	type: color.magenta,
	readme: color.magenta,
	link: color.cyan,
	tip: color.magenta,
	detected: color.yellow,
})

export const notheme = <Theme>(
	Object.fromEntries(
		[...Object.entries(stdtheme)]
			.map(([key]) => [key, (s: string) => s])
	)
)
