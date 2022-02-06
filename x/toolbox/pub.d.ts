export declare type Listener = (...args: any[]) => void | Promise<void>;
export declare function pub<L extends Listener = () => void | Promise<void>>(): {
    subscribe(...listeners: L[]): () => void;
    publish(...args: Parameters<L>): Promise<void>;
    clear(): void;
};
