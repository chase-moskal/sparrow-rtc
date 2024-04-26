
import {Suite} from "../../types.js"
import {objectMapAsync} from "../toolbox/object-map-async.js"

import {Results} from "./execution-types.js"
import {
	s_pass,
	s_error,
	s_counts,
} from "./symbols.js"

export async function execute(suite: Suite): Promise<Results> {
	if (typeof suite === "boolean") {
		return {
			[s_pass]: suite,
			[s_error]: null,
			[s_counts]: true,
		}
	}
	else if (typeof suite === "function") {
		try {
			const result = await suite()
			if (typeof result === "boolean") {
				return {
					[s_pass]: result,
					[s_error]: null,
					[s_counts]: true,
				}
			}
			else if (result && typeof result === "object") {
				return await execute(result)
			}
			else {
				return {
					[s_pass]: true,
					[s_error]: null,
					[s_counts]: true,
				}
			}
		}
		catch (err) {
			return {
				[s_pass]: false,
				[s_error]: err,
				[s_counts]: true,
			}
		}
	}
	else if (typeof suite === "object") {
		let all = true
		const results = await objectMapAsync(suite, async value => {
			const r = await execute(value)
			if (!r[s_pass]) all = false
			return r
		})
		return {
			...results,
			[s_pass]: all,
			[s_error]: null,
			[s_counts]: false,
		}
	}
	else throw new Error("invalid suite item")
}
