
import {isVoid} from "./is-void.js"

/**
 * return a value within an object tree, found at the given path.
 */
export function obtain<xResult>(
		object: {[key: string]: any},
		path: string[],
	): xResult {

	let current: any = object

	for (const key of path) {
		current = current[key]
		if (isVoid(current))
			break
	}

	return current
}
