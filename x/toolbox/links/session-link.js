export function sessionLink(link, term, sessionId) {
    const url = new URL(link);
    url.hash = `#${term}=${sessionId}`;
    return url.toString();
}
//# sourceMappingURL=session-link.js.map