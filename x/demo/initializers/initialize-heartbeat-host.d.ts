import { HeartbeatOptions } from "../types.js";
export declare function initializeHeartbeatHost({ app, timeout, rtcConfig, sessionLabel, signalServerUrl, heartbeatPeriod, }: HeartbeatOptions & {
    app: HTMLElement;
    sessionLabel: string;
}): Promise<void>;
