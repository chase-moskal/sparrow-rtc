
import {makeCommand} from "./command.js"

export type Suite = (
	void
	| boolean
	| (() => Promise<Suite>)
	| {[key: string]: Suite}
)

export interface Stats {
	total: number
	failed: number
	errors: Error[]
	duration: number
}

export interface FnMock {
	calls: {
		args: any[]
		returned: any
	}[]
}

export type RawArgs = {
	runtime: string
	suite: string
}

export type RawParams = {
	label: string
	cynic: string
	importmap: string
	port: number
	host: string
	open: boolean
}

export type Args = ReturnType<typeof makeCommand>["args"]
export type Params = ReturnType<typeof makeCommand>["params"]
export type Details = Args & Params
