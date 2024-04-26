import { ClientState, HandleJoin, JoinerControls } from "../types.js";
export declare function joinSessionAsClient({ signalServerUrl, sessionId, rtcConfig, handleJoin, onStateChange, }: {
    signalServerUrl: string;
    sessionId: string;
    rtcConfig: RTCConfiguration;
    handleJoin: HandleJoin;
    onStateChange(state: ClientState): void;
}): Promise<{
    controls: JoinerControls;
    readonly state: ClientState;
}>;
