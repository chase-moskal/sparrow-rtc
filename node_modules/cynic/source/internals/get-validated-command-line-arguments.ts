
import {CommanderStatic} from "commander"
import {parseBoolean} from "./toolbox/parse-boolean.js"

export function getValidatedCommandLineArguments(commander: CommanderStatic) {
	const {
		port,
		open,
		label,
		origin,
		cynicPath,
		importmapPath,
	} = commander
	const [environment, suitePath] = commander.args

	if (!environment) throw new Error(`1st argument 'environment' required`)
	if (!suitePath) throw new Error(`2nd argument 'suitePath' required`)

	return {
		label,
		origin,
		cynicPath,
		suitePath,
		importmapPath,
		port: parseInt(port),
		open: parseBoolean(open),
		environment: environment.toLowerCase(),
	}
}
