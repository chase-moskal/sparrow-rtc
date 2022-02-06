
import {api, service} from "../../renraku.js"

export const exampleApi = api({
	greeter: (service()
		.policy(async() => {})
		.expose(auth => ({
			async sayHello() {
				return "hello"
			},
		}))
	),
	math: {
		calculator: (service()
			.policy(async(meta: {lotto: number}) => ({winner: meta.lotto === 9}))
			.expose(auth => ({
				async sum(a: number, b: number) {
					return a + b
				},
				async isWinner() {
					return auth.winner
				},
			}))
		),
	},
})
