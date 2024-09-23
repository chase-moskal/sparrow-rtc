
export function simplestate<xState extends {}>({
		state: initialState,
		onChange,
	}: {
		state: xState
		onChange: (state: xState) => void
	}) {

	let currentState = initialState
	onChange(currentState)

	return {
		get state() {
			return currentState
		},
		set state(s: xState) {
			currentState = s
			onChange(currentState)
		},
		dispatch() {
			onChange(currentState)
		},
	}
}
