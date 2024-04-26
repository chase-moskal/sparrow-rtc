
import {Logger} from "../../types.js"

export function noLogger(): Logger {
	return {
		log() {},
		warn() {},
		error() {},
	}
}
