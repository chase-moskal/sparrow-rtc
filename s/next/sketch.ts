
export type Id = string

export class Sessions {
	#owners = new Map<Id, {}>()
	#joiners = new Map<Id, {}>()
}

