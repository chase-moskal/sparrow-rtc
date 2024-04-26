export interface SessionInfo {
    id: string;
    label: string;
    discoverable: boolean;
}
export interface Session extends SessionInfo {
    key: string;
}
export interface SignalBrowserHost {
    handleJoiner(clientId: string): Promise<{
        offer: any;
    }>;
    handleAnswer(clientId: string, answer: any): Promise<void>;
    handleIceCandidates(clientId: string, candidates: any[]): Promise<void>;
}
export interface SignalBrowserClient {
    handleIceCandidates(candidates: any[]): Promise<void>;
}
export interface HostState {
    session: Session | undefined;
}
export interface ClientState {
    clientId: string | undefined;
    sessionInfo: SessionInfo | undefined;
}
export interface HostControls {
    close: () => void;
    state: HostState;
}
export interface JoinerControls {
    clientId: string;
    close(): void;
    send(data: string | ArrayBuffer): void;
}
export interface JoinerHandlers {
    handleClose(): void;
    handleMessage(message: string | ArrayBuffer): void;
}
export interface HandleJoin {
    ({}: JoinerControls): JoinerHandlers;
}
