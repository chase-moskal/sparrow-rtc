
import {Spec} from "../types/spec.js"
import {Field} from "../types/field.js"
import {Command} from "../types/command.js"
import {parsingMachine} from "./parsing/machine.js"
import {validateArgOrdering} from "./parsing/validate-arg-ordering.js"
import {validateParamAssignmentsAreCompleted} from "./parsing/validate-param-assignments-are-completed.js"

export function parse<
		FA extends Field.Group,
		FP extends Field.Group
	>(spec: Spec<FA, FP>): Command<FA, FP> {

	validateArgOrdering(spec)
	const [executable, module, ...items] = spec.argv

	const {
		args,
		params,
		saveArg,
		saveParamTrue,
		saveScheduledParam,
		saveEqualSignedParam,
		saveShorthandBoolean,
		scheduledParamAssignment,
		scheduleNextItemAsParamValue,
	} = parsingMachine(spec)

	for (const item of items) {
		if (scheduledParamAssignment())
			saveScheduledParam(item)
		else {
			if (item.startsWith("--"))
				if (item.includes("="))
					saveEqualSignedParam(item)
				else
					if (item === "--help")
						saveParamTrue(item)
					else
						scheduleNextItemAsParamValue(item)
			else if (item.startsWith("+"))
				saveShorthandBoolean(item)
			else
				saveArg(item)
		}
	}

	validateParamAssignmentsAreCompleted(scheduledParamAssignment())
	return {spec, args, params, executable, module}
}
