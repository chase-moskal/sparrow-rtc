
export class RenrakuError extends Error {
	readonly name = this.constructor.name
}

export class ApiError extends RenrakuError {
	readonly code: number

	constructor(code: number, message: string) {
		super(message)
		this.code = code
	}
}

export class TimeoutError extends RenrakuError {}
