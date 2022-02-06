
import {Logger} from "../../types.js"

export function colorfulLogger(logger: Logger): Logger {

	const codes = {
		reset: "\u001b[0m",
		yellow: "\u001b[33;1m",
		red: "\u001b[31;1m",
	}

	function applyColor(code: string, items: any[]) {
		return items.map(
			item => typeof item === "string"
				? code + item + codes.reset
				: item
		)
	}

	function colorize(log: (...data: any[]) => void, code: string) {
		return (...data: any) => log(...applyColor(code, data))
	}

	return {
		log(...data: any[]) {
			logger.log(...data)
		},
		warn: colorize(logger.warn, codes.yellow),
		error: colorize(logger.error, codes.red),
	}
}
