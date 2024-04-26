import { queue } from "../toolbox/queue.js";
import { simplestate } from "../toolbox/simplestate.js";
import { connectToSignalServer } from "./utils/connect-to-signal-server.js";
export async function createSessionAsHost({ label, signalServerUrl, rtcConfig, handleJoin, onStateChange, }) {
    const peerDetails = new Map();
    const simple = simplestate({
        state: {
            session: undefined,
        },
        render: onStateChange,
    });
    const connection = await connectToSignalServer({
        url: signalServerUrl,
        host: {
            async handleJoiner(clientId) {
                const peer = new RTCPeerConnection(rtcConfig);
                const iceQueue = queue(async (candidates) => connection.signalServer
                    .hosting.submitIceCandidates(clientId, candidates));
                peerDetails.set(clientId, { peer, iceQueue });
                peer.onicecandidate = event => {
                    if (event.candidate)
                        iceQueue.add(event.candidate);
                };
                const channel = peer.createDataChannel("data", {
                    ordered: false,
                    maxRetransmits: undefined,
                });
                channel.binaryType = "arraybuffer";
                function kill() {
                    channel.close();
                    peer.close();
                    peerDetails.delete(clientId);
                }
                channel.onopen = () => {
                    const controls = handleJoin({
                        clientId,
                        send(data) {
                            if (channel.readyState === "open")
                                channel.send(data);
                        },
                        close() {
                            kill();
                        },
                    });
                    channel.onclose = () => {
                        kill();
                        controls.handleClose();
                    };
                    channel.onmessage = event => {
                        controls.handleMessage(event.data);
                    };
                };
                const offer = await peer.createOffer();
                peer.setLocalDescription(offer);
                return { offer };
            },
            async handleAnswer(clientId, answer) {
                const { peer, iceQueue } = peerDetails.get(clientId);
                await peer.setRemoteDescription(new RTCSessionDescription(answer));
                await iceQueue.ready();
            },
            async handleIceCandidates(clientId, candidates) {
                const { peer } = peerDetails.get(clientId);
                for (const candidate of candidates)
                    await peer.addIceCandidate(candidate);
            },
        },
    });
    setInterval(async () => {
        const start = Date.now();
        const serverNow = await connection.signalServer.hosting.keepAlive();
        const ping = Date.now() - start;
        console.log(`ping ${ping}ms, server time ${serverNow}`);
    }, 10000);
    const session = await connection.signalServer.hosting.establishSession({
        label,
        discoverable: true,
    });
    simple.state = { ...simple.state, session };
    return {
        close: connection.close,
        get state() { return simple.state; },
    };
}
//# sourceMappingURL=create-session-as-host.js.map