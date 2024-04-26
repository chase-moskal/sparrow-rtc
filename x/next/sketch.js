var _SessionManager_owners, _SessionManager_joiners;
export class SessionManager {
    constructor() {
        _SessionManager_owners.set(this, new Map());
        _SessionManager_joiners.set(this, new Map());
    }
}
_SessionManager_owners = new WeakMap(), _SessionManager_joiners = new WeakMap();
//# sourceMappingURL=sketch.js.map