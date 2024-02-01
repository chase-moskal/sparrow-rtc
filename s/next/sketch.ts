
export type Id = string

export class SessionManager {
	#owners = new Map<Id, {}>()
	#joiners = new Map<Id, {}>()
}

