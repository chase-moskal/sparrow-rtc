import { escapeRegex } from "../escape-regex.js";
export function parseHashForSessionId(hash, term) {
    hash = (hash.length && hash[0] === "#")
        ? hash.slice(1)
        : hash;
    const regex = new RegExp('^' + escapeRegex(term) + String.raw `=(\S+)($|\&)`, "i");
    const result = hash.match(regex);
    return result
        ? result[1]
        : undefined;
}
//# sourceMappingURL=parse-hash-for-session-id.js.map