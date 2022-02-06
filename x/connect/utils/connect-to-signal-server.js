import { webSocketClient } from "renraku";
import { makeSignalBrowserApi } from "../../signal/apis/make-signal-browser-api.js";
const duds = {
    host: {
        async handleJoiner() { throw new Error("nope"); },
        async handleAnswer() { throw new Error("nope"); },
        async handleIceCandidates() { throw new Error("nope"); },
    },
    client: {
        async handleOffer() { throw new Error("nope"); },
        async handleIceCandidates() { throw new Error("nope"); },
    },
};
export async function connectToSignalServer(options) {
    const { remote, close } = await webSocketClient({
        link: options.url,
        timeout: 10000,
        clientApi: makeSignalBrowserApi(options.host ?
            { host: options.host, client: duds.client } :
            { client: options.client, host: duds.host }),
        handleConnectionClosed() { },
        metaMap: {
            hosting: async () => { },
            discovery: async () => { },
            connecting: async () => { },
        },
    });
    return {
        signalServer: remote,
        close,
    };
}
//# sourceMappingURL=connect-to-signal-server.js.map