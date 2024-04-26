
import {CynicBrokenExpectation} from "./errors.js"

export function expect<xValue>(value: xValue) {

	const ok = () => !!value

	const defined = () => (value !== undefined && value !== null)
		? true
		: false

	const equals = (comparison: any) => {
		return value === comparison
	}

	function isPromise(val: any) {
		return typeof (val ?? {}).then === "function"
	}

	const throws = (): xValue extends (...args: any) => never
			? boolean
			: xValue extends (...args: any[]) => Promise<any>
				? Promise<boolean>
				: boolean => {
		if (typeof value !== "function")
			throw new CynicBrokenExpectation(`non-function cannot throw (${s(value)})`)
		const throwFailure = () => {
			throw new CynicBrokenExpectation(`expect(${s(value)}).throws(): function should throw, but didn't`)
		}
		let threw = false
		try {
			const result = value()
			if (isPromise(result)) {
				const promise: Promise<any> = result
				return <any>promise
					.catch(() => threw = true)
					.then(() => {
						if (!threw) throwFailure()
						else return true
					})
			}
		}
		catch (e) {
			threw = true
		}
		if (!threw) throwFailure()
		else return <any>true
	}

	return {
		ok: throwOnFailure(
			ok,
			`expect(${s(value)}).ok(): not ok, should be`
		),

		defined: throwOnFailure(
			defined,
			`expect(${s(value)}): should not be undefined or null, but is`
		),

		equals: (comparison: any) => throwOnFailure(
			equals,
			`expect(${s(value)}).equals(${s(comparison)}): not equal, should be`
		)(comparison),

		throws,

		not: {
			ok: throwOnFailure(
				invert(ok),
				`expect(${s(value)}).not.ok(): should not be ok, but is`
			),

			defined: throwOnFailure(
				invert(defined),
				`expect(${s(value)}).defined(): should be undefined or null, but is not`
			),

			equals: (comparison: any) => throwOnFailure(
				invert(equals),
				`expect(${s(value)}).not.equals(${s(comparison)}): `
					+ `should not be equal, but is`
			)(comparison),

			throws: throwOnFailure(
				() => {
					try {
						throws()
						return false
					}
					catch (e) {
						return true
					}
				},
				`expect(${s(value)}).not.throws(): function should not throw, but did`
			),
		},
	}
}

function invert<F extends (...args: any[]) => boolean>(func: F): F {
	const inverted = (...args: any[]): boolean => !func(...args)
	return <F>inverted
}

function throwOnFailure<F extends (...args: any[]) => boolean>(func: F, message: string): F {
	const composite = (...args: any[]): boolean => {
		const result = func(...args)
		if (result) return result
		else throw new CynicBrokenExpectation(message)
	}
	return <F>composite
}

function s(x: any) {
	try { return x.toString() }
	catch (error) { return "<unknown>" }
}
