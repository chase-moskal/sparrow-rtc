
import {Spec} from "./types/spec.js"
import {Field} from "./types/field.js"
import {Values} from "./types/values.js"
import {Command} from "./types/command.js"
import {parse} from "./internals/parse.js"
import {helper} from "./internals/helper.js"
import {errorReport} from "./internals/error-report.js"
import {Logger} from "./internals/testing/utils/logger.js"
import {applyDefaults} from "./internals/parsing/apply-defaults.js"
import {validateRequirements} from "./internals/parsing/validate-requirements.js"

export function cli<A extends Values, P extends Values>({
		logger = console,
		exit = code => process.exit(code),
	}: {
		logger?: Logger
		exit?: (code: number) => void
	} = {}) {

	return function<
			FA extends Field.GroupFromValues<A>,
			FP extends Field.GroupFromValues<P>
		>(spec: Spec<FA, FP>): Command<FA, FP> {

		try {
			const command = parse(spec)

			if ("help" in command.params) {
				for (const report of helper(command))
					logger.log(report)

				return <any>exit(0)
			}

			validateRequirements(command.spec.args, command.args)
			validateRequirements(command.spec.params, command.params)

			applyDefaults(command.spec.args, command.args)
			applyDefaults(command.spec.params, command.params)

			return command
		}
		catch (err: any) {
			const errortext = errorReport(err)
			const printError = () => logger.error(errortext.join(" "))
			printError()
			logger.error("")

			for (const report of helper({spec}))
				logger.error(report)

			logger.error("")
			printError()
			return <any>exit(1)
		}
	}
}
