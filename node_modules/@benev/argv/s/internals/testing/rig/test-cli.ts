
import {cli} from "../../../cli.js"
import {Field} from "../../../types/field.js"
import {Values} from "../../../types/values.js"
import {MemoryLogger} from "../utils/logger.js"
import {CliTestRig} from "./types/cli-test-rig.js"

export function testCli<
		A extends Values,
		P extends Values
	>() {

	return function<
			FA extends Field.GroupFromValues<A>,
			FP extends Field.GroupFromValues<P>
		>({argorder, args, params}: {
			argorder: (keyof FA)[]
			args: FA
			params: FP
		}): CliTestRig<FA, FP> {

		return function(argv, {columns = 80} = {}) {
			let lastExitCode: undefined | number
			const exit = (code: number) => { lastExitCode = code }

			const logger = new MemoryLogger()
			const cliopts = {logger, exit}

			const command = cli<A, P>(cliopts)({
				program: "test",
				readme: "https://github.com/benevolent-games/argv",
				help: "test cli program",
				argv,
				columns,
				argorder,
				args,
				params,
			})

			return {
				logger,
				command,
				get exitCode() { return lastExitCode },
			}
		}
	}
}
