import { HandleJoin, HostControls, HostState } from "../types.js";
export declare function createSessionAsHost({ label, signalServerUrl, rtcConfig, handleJoin, onStateChange, }: {
    label: string;
    signalServerUrl: string;
    rtcConfig: RTCConfiguration;
    handleJoin: HandleJoin;
    onStateChange(state: HostState): void;
}): Promise<HostControls>;
