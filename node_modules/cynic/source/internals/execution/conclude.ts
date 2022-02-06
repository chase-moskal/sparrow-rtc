
import {Stats} from "../../types.js"

export function conclude({total, failed, errors, duration}: Stats) {
	let output = ""
	const lines = [
		`${failed} ${failed ? "FAILED" : "failed"} tests`,
		`${errors.length} thrown errors`,
		`${total - failed} passed tests`,
		`${total} total tests`,
		`${(duration / 1000).toFixed(2)} seconds`,
	]
	output += `\n${lines.join("\n")}`
	return output
}
