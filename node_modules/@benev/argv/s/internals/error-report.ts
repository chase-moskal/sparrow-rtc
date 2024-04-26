
import {color} from "../tools/colors.js"
import {ArgvError} from "../errors/argv-error.js"

export function errorReport(err: any) {
	const flag = color.red("ERR!!")

	return (
		(err instanceof Error)

			? (err instanceof ArgvError)
				? [
					flag + " " +
					color.yellow(err.name) + " " +
					color.green(err.message)
				]
				: [
					flag + " " +
					color.yellow(err.name) + " " +
					color.green(err.message) + "\n" +
					color.red(
						(err
							.stack
							?.split("\n")
							.slice(1)
							.map(s => s.trim())
							.join("\n")
						) ?? ""
					)
				]

			: [flag + " ", err]
	)
}
