export function simplestate({ state: initialState, render }) {
    let currentState = initialState;
    render(currentState);
    return {
        get state() {
            return currentState;
        },
        set state(s) {
            currentState = s;
            render(currentState);
        },
    };
}
//# sourceMappingURL=simplestate.js.map