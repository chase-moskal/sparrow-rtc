import * as renraku from "renraku";
import { randomId } from "../../toolbox/random-id.js";
import { extractSessionInfo } from "../cores/utils/extract-session-info.js";
export const makeSignalServerApi = ({ sessionProvider, sessionFinder, clientManager }) => renraku.api({
    hosting: renraku.service()
        .policy(async () => { })
        .expose(() => ({
        async keepAlive() {
            return Date.now();
        },
        establishSession: sessionProvider.establishSession,
        async submitIceCandidates(clientId, candidates) {
            const client = clientManager.getClient(clientId);
            await client.handleIceCandidates(candidates);
        },
        terminateSession: sessionProvider.terminateSession,
    })),
    discovery: renraku.service()
        .policy(async () => { })
        .expose(() => ({
        async listSessions() {
            return [];
        },
    })),
    connecting: renraku.service()
        .policy(async () => { })
        .expose(() => ({
        async joinSession(sessionId) {
            const session = sessionFinder.findSessionById(sessionId);
            if (session) {
                const host = sessionFinder.getSessionHost(session);
                const clientId = randomId();
                const accepted = await host.handleJoiner(clientId);
                if (accepted) {
                    clientManager.addClient(clientId);
                    return {
                        clientId,
                        offer: accepted.offer,
                        sessionInfo: extractSessionInfo(session),
                    };
                }
                else {
                    return undefined;
                }
            }
            else {
                throw new Error("session not found");
            }
        },
        async submitAnswer(sessionId, clientId, answer) {
            const session = sessionFinder.findSessionById(sessionId);
            if (session) {
                const host = sessionFinder.getSessionHost(session);
                await host.handleAnswer(clientId, answer);
            }
            else {
                throw new Error("session not found");
            }
        },
        async submitIceCandidates(sessionId, clientId, candidates) {
            const host = sessionFinder.findHostBySessionId(sessionId);
            await host.handleIceCandidates(clientId, candidates);
        },
    })),
});
//# sourceMappingURL=make-signal-server-api.js.map