export function pub() {
    const records = new Map();
    return {
        subscribe(...listeners) {
            if (listeners.length) {
                const id = Symbol();
                records.set(id, listeners);
                return () => {
                    records.delete(id);
                };
            }
            return () => { };
        },
        async publish(...args) {
            await Promise.all(Array.from(records.values())
                .flat()
                .map(listener => listener(...args)));
        },
        clear() {
            records.clear();
        },
    };
}
//# sourceMappingURL=pub.js.map