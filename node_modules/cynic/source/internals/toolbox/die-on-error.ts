
export function dieOnError() {

	process.on("unhandledRejection", (reason, error) => {
		console.error(reason, error)
		process.exit(1)
	})

	process.on("uncaughtException", error => {
		console.error(error)
		process.exit(1)
	})
}
