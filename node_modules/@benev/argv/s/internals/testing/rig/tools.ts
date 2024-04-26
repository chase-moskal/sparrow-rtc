
import {stdargv} from "./stdargv.js"
import {Field} from "../../../types/field.js"
import {CliTestRig} from "./types/cli-test-rig.js"

export function tools<
		FA extends Field.Group,
		FP extends Field.Group
	>(cli: CliTestRig<FA, FP>) {

	const run = (...a: string[]) => cli(stdargv(...a), {columns: 80})
	const args = (...a: string[]) => run(...a).command.args
	const params = (...a: string[]) => run(...a).command.params
	const exitCode = (...a: string[]) => run(...a).exitCode

	return {run, args, params, exitCode}
}
