
export function val(v: any) {
	return v === undefined
		? "undefined"
		: JSON.stringify(v)
}
