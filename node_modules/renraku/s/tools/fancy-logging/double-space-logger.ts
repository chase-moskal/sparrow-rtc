
import {Logger} from "../../types.js"

export function doubleSpaceLogger(logger: Logger): Logger {

	function double(log: (...data: any[]) => void) {
		return (...data: any[]) => {
			if (data.length > 0 && typeof data[0] === "string") {
				const [first, ...rest] = data
				log("\n" + first, ...rest)
			}
			else {
				log("\n", ...data)
			}
		}
	}

	return {
		log: double(logger.log),
		warn: double(logger.warn),
		error: double(logger.error),
	}
}
