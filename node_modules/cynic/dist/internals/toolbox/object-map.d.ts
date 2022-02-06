export declare function objectMap<V = any, X = any, O extends {} = {}>(input: O, mapper: (value: X, key: string) => V): {
    [P in keyof O]: V;
};
