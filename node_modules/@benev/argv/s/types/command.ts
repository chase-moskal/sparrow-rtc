
import {Spec} from "./spec.js"
import {Field} from "./field.js"
import {Values} from "./values.js"

export type Command<
		FA extends Field.GroupFromValues<Values>,
		FP extends Field.GroupFromValues<Values>
	> = {
	spec: Spec<FA, FP>
	args: Field.ValuesFromGroup<FA>
	params: Field.ValuesFromGroup<FP>
	executable: string
	module: string
}
