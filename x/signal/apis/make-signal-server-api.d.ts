import * as renraku from "renraku";
import type { makeSessionManager } from "../cores/make-session-manager.js";
export declare const makeSignalServerApi: ({ sessionProvider, sessionFinder, clientManager }: {
    sessionFinder: ReturnType<typeof makeSessionManager>["sessionFinder"];
    sessionProvider: ReturnType<ReturnType<typeof makeSessionManager>["makeSessionProvider"]>;
    clientManager: ReturnType<ReturnType<typeof makeSessionManager>["makeClientManager"]>;
}) => {
    hosting: renraku.Service<unknown, void, {
        keepAlive(): Promise<number>;
        establishSession: (options: {
            label: string;
            discoverable: boolean;
        }) => Promise<import("../../types.js").Session>;
        submitIceCandidates(clientId: string, candidates: any[]): Promise<void>;
        terminateSession: (key: string) => Promise<void>;
    }>;
    discovery: renraku.Service<unknown, void, {
        listSessions(): Promise<never[]>;
    }>;
    connecting: renraku.Service<unknown, void, {
        joinSession(sessionId: string): Promise<{
            clientId: string;
            offer: any;
            sessionInfo: import("../../types.js").SessionInfo;
        } | undefined>;
        submitAnswer(sessionId: string, clientId: string, answer: any): Promise<void>;
        submitIceCandidates(sessionId: string, clientId: string, candidates: any[]): Promise<void>;
    }>;
};
