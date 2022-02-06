import * as renraku from "renraku";
export const makeSignalBrowserApi = ({ host, client }) => renraku.api({
    host: renraku.service()
        .policy(async () => { })
        .expose(() => ({ ...host })),
    client: renraku.service()
        .policy(async () => { })
        .expose(() => ({ ...client })),
});
//# sourceMappingURL=make-signal-browser-api.js.map