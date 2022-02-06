
import {expect, Suite} from "cynic"
import * as renraku from "./renraku.js"
import {noLogger} from "./renraku.js"
import {nap} from "./tools/nap.js"
import {JsonRpcResponse} from "./types.js"
import {negotiator} from "./websocket/negotiator/negotiator.js"

export default <Suite>{

	"renrakuMock": {

		async "mock service"() {
			function setup() {
				const calculator = renraku.service()
					.policy(async() => {})
					.expose(() => ({
						async sum(a: number, b: number) {
							return a + b
						},
					}))
				return {
					calculator: renraku.mock()
						.forService(calculator)
						.withMeta(async() => {})
				}
			}
			return {
				async "calling method returns a result"() {
					const {calculator} = setup()
					const result = await calculator.sum(1, 2)
					expect(result).equals(3)
					await expect(async() => (<any>calculator).lol()).throws()
				},
				async "calling missing method throws an error"() {
					const {calculator} = setup()
					await expect(async() => (<any>calculator).lol()).throws()
				},
				async "meta is processed into auth"() {
					const lottoService = renraku.service()
						.policy(async(meta: number) => ({win: meta === 1}))
						.expose(auth => ({
							async isWinner() {
								return auth.win
							},
						}))
					const lotto0 = renraku.mock()
						.forService(lottoService)
						.withMeta(async() => 0)
					const lotto1 = renraku.mock()
						.forService(lottoService)
						.withMeta(async() => 1)
					expect(await lotto0.isWinner()).equals(false)
					expect(await lotto1.isWinner()).equals(true)
				},
			}
		},

		async "mock api"() {
			function setup() {
				const api = renraku.api({
					greeter: renraku.service()
						.policy(async() => {})
						.expose(() => ({
							async sayHello() {
								return "hello"
							},
						})),
					math: {
						calculator: renraku.service()
							.policy(async() => {})
							.expose(() => ({
								async sum(a: number, b: number) {
									return a + b
								},
							}))
					},
				})
				return {
					api: renraku.mock()
						.forApi(api)
						.withMetaMap({
							greeter: async() => {},
							math: {
								calculator: async() => {},
							},
						})
				}
			}
			return {
				async "calling a method returns a result"() {
					const {api} = setup()
					const result1 = await api.greeter.sayHello()
					const result2 = await api.math.calculator.sum(1, 2)
					expect(result1).equals("hello")
					expect(result2).equals(3)
				},
				async "calling a missing service throws an error"() {
					const {api} = setup()
					await expect(async() => (<any>api).lol()).throws()
					await expect(async() => (<any>api).math.lol()).throws()
				},
				async "calling a missing method throws an error"() {
					const {api} = setup()
					await expect(async() => (<any>api).greeter.lol()).throws()
					await expect(async() => (<any>api).math.calculator.lol()).throws()
				},
				async "metas are processed into auth"() {
					const lottoApi = renraku.api({
						winnerIs1: renraku.service()
							.policy(async(meta: number) => ({win: meta === 1}))
							.expose(auth => ({
								async isWinner() {
									return auth.win
								},
							})),
						winnerIs2: renraku.service()
							.policy(async(meta: number) => ({win: meta === 2}))
							.expose(auth => ({
								async isWinner() {
									return auth.win
								},
							}))
					})
					const lotto0 = renraku.mock()
						.forApi(lottoApi)
						.withMetaMap({
							winnerIs1: async() => 0,
							winnerIs2: async() => 0,
						})
					const lotto1 = renraku.mock()
						.forApi(lottoApi)
						.withMetaMap({
							winnerIs1: async() => 1,
							winnerIs2: async() => 1,
						})
					const lotto2 = renraku.mock()
						.forApi(lottoApi)
						.withMetaMap({
							winnerIs1: async() => 2,
							winnerIs2: async() => 2,
						})
					expect(await lotto0.winnerIs1.isWinner()).equals(false)
					expect(await lotto0.winnerIs2.isWinner()).equals(false)

					expect(await lotto1.winnerIs1.isWinner()).equals(true)
					expect(await lotto1.winnerIs2.isWinner()).equals(false)

					expect(await lotto2.winnerIs1.isWinner()).equals(false)
					expect(await lotto2.winnerIs2.isWinner()).equals(true)
				},
			}
		},
	},

	"renraku websocket negotiator": {
		async "timeout works"() {
			const {startWaitingForResponse} = negotiator({
				exposeErrors: true,
				logger: noLogger(),
				timeout: 100,
			})
			const {response} = startWaitingForResponse()
			let error: any
			response.catch(err => error = err)
			await nap(101)
			expect(error).ok()
		},
		async "timeout isn't thrown when a response comes in"() {
			const {startWaitingForResponse, acceptIncoming} = negotiator({
				exposeErrors: true,
				logger: noLogger(),
				timeout: 100,
			})
			const {id, response} = startWaitingForResponse()
			let error: any
			response.catch(err => error = err)
			acceptIncoming({
				headers: {},
				incoming: {
					id,
					jsonrpc: "2.0",
					result: undefined,
					meta: undefined,
					params: [],
				},
				respond() {},
				servelet: async() => {},
			})
			await nap(101)
			expect(error).not.ok()
		},
	},
}
