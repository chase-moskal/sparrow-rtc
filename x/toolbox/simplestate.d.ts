export declare function simplestate<xState extends {}>({ state: initialState, render }: {
    state: xState;
    render: (state: xState) => void;
}): {
    state: xState;
};
