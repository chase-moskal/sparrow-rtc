import { SignalBrowserClient, SignalBrowserHost } from "../../types.js";
interface CommonOptions {
    url: string;
}
interface HostOptions extends CommonOptions {
    host: SignalBrowserHost;
}
interface ClientOptions extends CommonOptions {
    client: SignalBrowserClient;
}
type ConnectOptions = HostOptions | ClientOptions;
export declare function connectToSignalServer(options: ConnectOptions): Promise<{
    signalServer: import("renraku").ApiRemote<{
        hosting: import("renraku").Service<unknown, void, {
            keepAlive(): Promise<number>;
            establishSession: (options: {
                label: string;
                discoverable: boolean;
            }) => Promise<import("../../types.js").Session>;
            submitIceCandidates(clientId: string, candidates: any[]): Promise<void>;
            terminateSession: (key: string) => Promise<void>;
        }>;
        discovery: import("renraku").Service<unknown, void, {
            listSessions(): Promise<never[]>;
        }>;
        connecting: import("renraku").Service<unknown, void, {
            joinSession(sessionId: string): Promise<{
                clientId: string;
                offer: any;
                sessionInfo: import("../../types.js").SessionInfo;
            } | undefined>;
            submitAnswer(sessionId: string, clientId: string, answer: any): Promise<void>;
            submitIceCandidates(sessionId: string, clientId: string, candidates: any[]): Promise<void>;
        }>;
    }>;
    close: () => void;
}>;
export {};
