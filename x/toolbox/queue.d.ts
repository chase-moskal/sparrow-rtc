export declare function queue<X>(action: (x: X[]) => Promise<void>): {
    add(x: X): Promise<void>;
    ready(): Promise<void>;
};
