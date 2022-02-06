
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
