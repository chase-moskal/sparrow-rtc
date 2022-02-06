
export function simplestate<xState extends {}>({
		state: initialState,
		render
	}: {
		state: xState
		render: (state: xState) => void
	}) {

	let currentState = initialState
	render(currentState)

	return {
		get state() {
			return currentState
		},
		set state(s: xState) {
			currentState = s
			render(currentState)
		},
	}
}
