
export interface SessionInfo {
	id: string
	label: string
	discoverable: boolean
}

export interface Session extends SessionInfo {
	key: string
}

export interface SignalBrowserHost {
	handleJoiner(clientId: string): Promise<{offer: any}>
	handleAnswer(clientId: string, answer: any): Promise<void>
	handleIceCandidates(clientId: string, candidates: any[]): Promise<void>
}

export interface SignalBrowserClient {
	handleIceCandidates(candidates: any[]): Promise<void>
}

export interface HostState {
	session: Session | undefined
}

export interface ClientState {
	clientId: string | undefined
	sessionInfo: SessionInfo | undefined
}

export interface HandleJoin {
	({}: {
		clientId: string
		send(data: string | ArrayBuffer): void
		close(): void
	}): {
		handleMessage(message: string | ArrayBuffer): void
		handleClose(): void
	}
}
