
export abstract class Logger {
	abstract log(...s: any[]): void
	abstract error(...s: any[]): void
}

export class ConsoleLogger extends Logger {
	log(...s: string[]) { console.log(...s) }
	error(...s: string[]) { console.error(...s) }
}

export class DisabledLogger extends Logger {
	log(...s: string[]) {}
	error(...s: string[]) {}
}

export class MemoryLogger extends Logger {
	logs: string[] = []
	errors: string[] = []
	log(...s: string[]) { this.logs.push(s.join(" ")) }
	error(...s: string[]) { this.errors.push(s.join(" ")) }
}
