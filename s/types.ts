
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
