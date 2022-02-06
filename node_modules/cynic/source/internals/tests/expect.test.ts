
import {Suite, expect} from "../../cynic.js"
import {throwsError} from "./testing.test.js"

export default <Suite>{
	".ok()": async() => {
		const succeedGood = expect(true).ok()
		const failGood = throwsError(() => expect(false).ok())
		return (succeedGood && failGood)
	},

	".not.ok()": async() => {
		const succeedGood = expect(false).not.ok()
		const failGood = throwsError(() => expect(true).not.ok())
		return (succeedGood && failGood)
	},

	".defined()": async() => {
		const succeedGood1 = expect("alpha").defined()
		const succeedGood2 = expect(false).defined()
		const failGood1 = throwsError(() => expect(undefined).defined())
		const failGood2 = throwsError(() => expect(null).defined())
		return (succeedGood1 && succeedGood2 && failGood1 && failGood2)
	},

	".not.defined()": async() => {
		const succeedGood1 = expect(undefined).not.defined()
		const succeedGood2 = expect(null).not.defined()
		const failGood1 = throwsError(() => expect("alpha").not.defined())
		const failGood2 = throwsError(() => expect(false).not.defined())
		return (succeedGood1 && succeedGood2 && failGood1 && failGood2)
	},

	".equals(comparison)": async() => {
		const obj = {}
		const symbol = Symbol()
		const succeedGood1 = expect("alpha").equals("alpha")
		const succeedGood2 = expect(3.14).equals(3.14)
		const succeedGood3 = expect(obj).equals(obj)
		const succeedGood4 = expect(symbol).equals(symbol)
		const failGood1 = throwsError(() => expect("alpha").equals("Alpha"))
		const failGood2 = throwsError(() => expect(3.14).equals(3))
		const failGood3 = throwsError(() => expect({}).equals({}))
		const failGood4 = throwsError(() => expect(Symbol()).equals(Symbol()))
		return (
			succeedGood1 && succeedGood2 && succeedGood3 && succeedGood4 &&
			failGood1 && failGood2 && failGood3 && failGood4
		)
	},

	".not.equals(comparison)": async() => {
		const obj = {}
		const symbol = Symbol()
		const succeedGood1 = expect("alpha").not.equals("Alpha")
		const succeedGood2 = expect(3.14).not.equals(3)
		const succeedGood3 = expect({}).not.equals({})
		const succeedGood4 = expect(Symbol()).not.equals(Symbol())
		const failGood1 = throwsError(() => expect("alpha").not.equals("alpha"))
		const failGood2 = throwsError(() => expect(3.14).not.equals(3.14))
		const failGood3 = throwsError(() => expect(obj).not.equals(obj))
		const failGood4 = throwsError(() => expect(symbol).not.equals(symbol))
		return (
			succeedGood1 && succeedGood2 && succeedGood3 && succeedGood4 &&
			failGood1 && failGood2 && failGood3 && failGood4
		)
	},

	".throws()": async() => {
		expect(() => {throw new Error()}).throws()
		expect(() => {throw "string"}).throws()
		await expect(async() => {throw new Error()}).throws()
		throwsError(() => expect(() => true).throws())
		throwsError(() => expect(() => false).throws())

		let threw = false
		try { await expect(async() => true).throws() }
		catch (e) { threw = true }
		if (!threw) throw "should have thrown because the function didn't throw"
	},

	".not.throws()": async() => {
		const succeedGood1 = expect(() => true).not.throws()
		const succeedGood2 = expect(() => false).not.throws()
		const failGood1 = throwsError(
			() => expect(() => {throw new Error()}).not.throws()
		)
		const failGood2 = throwsError(
			() => expect(() => {throw "string"}).not.throws()
		)
		return (succeedGood1 && succeedGood2 && failGood1 && failGood2)
	},
}
