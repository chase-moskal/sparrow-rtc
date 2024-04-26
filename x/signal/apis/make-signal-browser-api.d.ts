import * as renraku from "renraku";
import { SignalBrowserClient, SignalBrowserHost } from "../../types.js";
export declare const makeSignalBrowserApi: ({ host, client }: {
    host: SignalBrowserHost;
    client: SignalBrowserClient;
}) => {
    host: renraku.Service<unknown, void, {
        handleJoiner(clientId: string): Promise<{
            offer: any;
        }>;
        handleAnswer(clientId: string, answer: any): Promise<void>;
        handleIceCandidates(clientId: string, candidates: any[]): Promise<void>;
    }>;
    client: renraku.Service<unknown, void, {
        handleIceCandidates(candidates: any[]): Promise<void>;
    }>;
};
