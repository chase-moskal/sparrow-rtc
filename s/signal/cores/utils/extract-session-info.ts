
import {Session, SessionInfo} from "../../../types.js"

export function extractSessionInfo(session: Session): SessionInfo {
	return {
		id: session.id,
		label: session.label,
		discoverable: session.discoverable,
	}
}
