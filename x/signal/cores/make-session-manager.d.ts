import * as renraku from "renraku";
import { Session } from "../../types.js";
import type { makeSignalBrowserApi } from "../apis/make-signal-browser-api.js";
export declare function makeSessionManager(): {
    makeSessionProvider: ({ signalBrowser }: {
        signalBrowser: renraku.Remote<ReturnType<typeof makeSignalBrowserApi>>;
    }) => {
        establishSession(options: {
            label: string;
            discoverable: boolean;
        }): Promise<Session>;
        terminateSession(key: string): Promise<void>;
        purge(): Promise<void>;
    };
    sessionFinder: {
        findSessionById: (id: string) => Session | undefined;
        getSessionHost: (session: Session) => {
            handleJoiner(clientId: string): Promise<{
                offer: any;
            }>;
            handleAnswer(clientId: string, answer: any): Promise<void>;
            handleIceCandidates(clientId: string, candidates: any[]): Promise<void>;
        } | undefined;
        findHostBySessionId(id: string): {
            handleJoiner(clientId: string): Promise<{
                offer: any;
            }>;
            handleAnswer(clientId: string, answer: any): Promise<void>;
            handleIceCandidates(clientId: string, candidates: any[]): Promise<void>;
        };
    };
    makeClientManager(client: renraku.Remote<ReturnType<typeof makeSignalBrowserApi>>["client"]): {
        addClient(clientId: string): void;
        getClient(clientId: string): {
            handleIceCandidates(candidates: any[]): Promise<void>;
        } | undefined;
    };
};
