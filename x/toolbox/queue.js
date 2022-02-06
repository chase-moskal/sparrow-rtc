export function queue(action) {
    let data = [];
    let isReady = false;
    return {
        async add(x) {
            if (isReady)
                await action([x]);
            else
                data.push(x);
        },
        async ready() {
            isReady = true;
            if (data.length)
                await action(data);
        },
    };
}
//# sourceMappingURL=queue.js.map