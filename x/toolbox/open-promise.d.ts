export declare function openPromise<R>(): {
    promise: Promise<R>;
    resolve: (result: R) => void;
    reject: (reason: any) => void;
};
