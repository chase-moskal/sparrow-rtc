
import {ArgvError} from "../../errors/argv-error.js"

export function validateParamAssignmentsAreCompleted(param: string | undefined) {
	if (param)
		throw new ArgvError(`missing value for param "${param}"`)
}
