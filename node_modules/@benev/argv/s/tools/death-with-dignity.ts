
import {Logger} from "../internals/testing/utils/logger.js"

export function deathWithDignity(
		logger: Logger = console,
		lastWillAndTestament?: () => void
	) {

	const rubberneckers = new Set<() => void>()

	if (lastWillAndTestament)
		rubberneckers.add(lastWillAndTestament)

	function death(code: number) {
		for (const notifyNextOfKin of rubberneckers)
			notifyNextOfKin()
		process.exit(code)
	}

	process.on("SIGINT", () => {
		logger.log("💣 SIGINT")
		death(0)
	})
	
	process.on("SIGTERM", () => {
		logger.log("🗡️ SIGTERM")
		death(0)
	})

	process.on("uncaughtException", error => {
		logger.error("🚨 unhandled exception:", error)
		death(1)
	})

	process.on("unhandledRejection", (reason, error) => {
		logger.error("🚨 unhandled rejection:", reason, error)
		death(1)
	})

	return {
		onDeath: (listener: () => void) => {
			rubberneckers.add(listener)
		},
	}
}
