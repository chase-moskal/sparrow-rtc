
export interface SessionInfo {
	id: string
	label: string
	discoverable: boolean
}

export interface Session extends SessionInfo {
	key: string
}
