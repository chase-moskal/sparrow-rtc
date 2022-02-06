import { HeartbeatOptions } from "../types.js";
export declare function initializeHeartbeatClient({ app, timeout, sessionId, rtcConfig, heartbeatPeriod, signalServerUrl, }: HeartbeatOptions & {
    app: HTMLElement;
    sessionId: string;
}): Promise<void>;
