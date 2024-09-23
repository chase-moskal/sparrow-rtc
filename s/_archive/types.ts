
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
	session: Session
	signalServerPing: number
}

export interface ClientState {
	sessionInfo: SessionInfo
}

export interface HostControls {
	state: HostState
	close: () => void
}

export interface ChannelControls {
	clientId: string
	close(): void
	send(data: string | ArrayBuffer): void
}

export interface ChannelHandlers {
	handleClose(): void
	handleMessage(message: string | ArrayBuffer): void
}

