
import {ApiError} from "./error.js"
import {objectMap} from "./tools/object-map.js"
import {Api, MetaMap, ApiRemote, AuthMap, Service, Methods, is_service, HttpHeaders, ServiceOptions} from "./types.js"

export const mock = (options: ServiceOptions = {}) => ({
	forService: <xService extends Service<any, any, Methods>>(
			service: xService
		) => mockService(service, [], options),
	forApi<xApi extends Api>(api: xApi) {
		return {
			withMetaMap(
					map: MetaMap<xApi>,
					getHeaders: () => Promise<HttpHeaders> = async() => undefined
				): ApiRemote<xApi> {
				const recurse2 = prepareRecursiveMapping(
					(service, getter, path) => mockService(service, path, options).withMeta(getter, getHeaders)
				)
				return <ApiRemote<xApi>>recurse2(api, map)
			},
			withAuthMap(map: AuthMap<xApi>): ApiRemote<xApi> {
				const recurse2 = prepareRecursiveMapping(
					(service, getter, path) => mockService(service, path, options).withAuth(getter)
				)
				return <ApiRemote<xApi>>recurse2(api, map)
			},
		}
	},
})

function mockService<xService extends Service<any, any, Methods>>(service: xService, path: string[], options: ServiceOptions) {
	type xMeta = xService extends Service<infer X, any, Methods>
		? X
		: never
	type xAuth = xService extends Service<any, infer X, Methods>
		? X
		: never
	type xMethods = xService extends Service<any, any, infer X>
		? X
		: never
	function prepareProxy(getAuth: () => Promise<xAuth>): xMethods {
		const overrides: {[key: string]: any} = {}
		return new Proxy(<xMethods>{}, {
			set: (t, key: string, value: any) => {
				overrides[key] = value
				return true
			},
			get: (t, key: string) => (
				overrides[key] ?? (async(...params: any[]) => {
					const auth = await getAuth()
					const method = service.expose(auth)[key]
					if (method) {
						return options.spike
							? options.spike([...path, key].join("."), method, ...params)
							: method(...params)
					}
					else
						throw new ApiError(400, `renraku remote method "${key}" not found`)
				})
			),
		})
	}
	return {
		withMeta(
				getMeta: () => Promise<xMeta>,
				getHeaders: () => Promise<HttpHeaders> = async() => undefined
			): xMethods {
			return prepareProxy(
				async() => service.policy(
					await getMeta(),
					await getHeaders()
				)
			)
		},
		withAuth(getAuth: () => Promise<xAuth>): xMethods {
			return prepareProxy(getAuth)
		},
	}
}

function prepareRecursiveMapping(
		handler: (
			service: Service<any, any, Methods>,
			getter: () => Promise<any>,
			path: string[]
		) => Methods
	) {
	return function recursiveMapping(
			apiGroup: Api,
			mapGroup: MetaMap<Api> | AuthMap<Api>,
			path: string[] = []
		): ApiRemote<Api> {
		return objectMap(apiGroup, (value, key) => {
			const newPath = [...path, key]
			if (value[is_service]) {
				const service = value
				return handler(service, mapGroup[key], newPath)
			}
			else {
				const nextApiGroup = value
				const nextMapGroup = mapGroup[key]
				return recursiveMapping(nextApiGroup, nextMapGroup, newPath)
			}
		})
	}
}
