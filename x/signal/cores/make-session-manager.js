import { randomId } from "../../toolbox/random-id.js";
export function makeSessionManager() {
    const sessions = new Set();
    const hosts = new Map();
    const clients = new Map();
    function createSession({ label, discoverable, signalBrowser }) {
        const session = {
            id: randomId(),
            key: randomId(),
            label,
            discoverable,
        };
        sessions.add(session);
        hosts.set(session, signalBrowser.host);
        console.log("sessions", sessions.size);
        return session;
    }
    function deleteSession(session) {
        sessions.delete(session);
        hosts.delete(session);
        console.log("sessions", sessions.size);
    }
    function findSessionById(id) {
        for (const session of sessions)
            if (session.id === id)
                return session;
    }
    function getSessionHost(session) {
        return hosts.get(session);
    }
    function makeSessionProvider({ signalBrowser }) {
        let session;
        return {
            async establishSession(options) {
                if (!session) {
                    session = createSession({ ...options, signalBrowser });
                    return session;
                }
                else {
                    throw new Error("cannot overwrite existing session");
                }
            },
            async terminateSession(key) {
                if (session) {
                    if (session.key === key) {
                        deleteSession(session);
                        session = undefined;
                    }
                    else {
                        throw new Error("wrong session key");
                    }
                }
                else {
                    throw new Error("no session to terminate");
                }
            },
            async purge() {
                if (session) {
                    deleteSession(session);
                    session = undefined;
                }
            },
        };
    }
    return {
        makeSessionProvider,
        sessionFinder: {
            findSessionById,
            getSessionHost,
            findHostBySessionId(id) {
                const session = findSessionById(id);
                if (session)
                    return getSessionHost(session);
                else
                    throw new Error("session not found");
            },
        },
        makeClientManager(client) {
            return {
                addClient(clientId) {
                    clients.set(clientId, client);
                },
                getClient(clientId) {
                    return clients.get(clientId);
                },
            };
        },
    };
}
//# sourceMappingURL=make-session-manager.js.map