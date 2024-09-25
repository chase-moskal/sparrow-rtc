
import {Hat} from "./hat.js"

export class FunnyNames {
	adjectives = new Hat([
		"Angry", "Shiny", "Lazy", "Drunk", "Psychedelic", "Sassy", "Fluffy", "Bored",
		"Spicy", "Awkward", "Deadpan", "Gigantic", "Tiny", "Moist", "Deranged",
		"Neon", "Hyperactive", "Sleepy", "Salty", "Radioactive", "Suspicious",
		"Hypnotized", "Unstable", "Ferocious", "Flammable", "Goth", "Zombie",
		"Rainbow", "Quantum", "Schizophrenic", "Sweaty", "Explosive", "Mysterious",
		"Nefarious", "Snarky", "Loud", "Muted", "Invisible", "Eldritch", "Cranky",
		"Outrageous", "Oblivious", "Chaotic", "Unhinged", "Caffeinated", "Paranoid",
		"Woke", "Edgy", "Crunchy", "Jaded", "Cheesy"
	])

	nouns = new Hat([
		"Ninja", "Banana", "Platypus", "Vampire", "Toaster", "Spaceship", "Unicorn",
		"Meme", "Goblin", "Squirrel", "Taco", "Cactus", "Octopus", "Dragon",
		"Sock", "Donut", "Laser", "Duck", "Cyborg", "Squid", "Giraffe", "Skeleton",
		"Ghost", "Robot", "Dumpster", "Kangaroo", "Sloth", "Cheeseburger", "Shark",
		"Pineapple", "Broccoli", "Narwhal", "Alien", "Penguin", "Pizza", "Llama",
		"Shovel", "Chainsaw", "Dumpsterfire", "UFO", "Hamster", "Waffle",
		"Poltergeist", "Jellyfish", "Moth", "Pickle", "Zebra", "Tractor",
		"Manatee", "Raccoon"
	])

	generate() {
		const adj1 = this.adjectives.pull()
		const adj2 = this.adjectives.pull()
		const noun1 = this.nouns.pull()
		const noun2 = this.nouns.pull()

		const formats = [
			`${adj1} ${noun1}`,
			`${adj1} ${noun1} ${noun2}`,
			`${adj1}-${adj2}-${noun1.toLowerCase()}`,
			`${adj1} ${adj2} ${noun1.toUpperCase()}`,
			`${adj1}-${noun1.toLowerCase()}`,
		]

		return formats[Math.floor(Math.random() * formats.length)]
	}
}

