
export class CynicBrokenAssertion extends Error {
	constructor(message: string) {
		super(message)
		this.name = this.constructor.name
	}
}

export class CynicBrokenExpectation extends Error {
	constructor(message: string) {
		super(message)
		this.name = this.constructor.name
	}
}
