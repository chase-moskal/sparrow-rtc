
import {objectMap} from "../../tools/object-map.js"
import {Api, ApiRemote, MetaMap, Requester, ServiceOptions} from "../../types.js"

export function remoteWithMetaMap<xApi extends Api>(
		requester: Requester,
		map: MetaMap<xApi>,
		options: ServiceOptions = {}
	) {
	function recurse(mapGroup: MetaMap<xApi>, path: string[] = []): ApiRemote<xApi> {
		return objectMap(mapGroup, (value, key) => {
			const newPath = [...path, key]
			if (typeof value === "function") {
				const getMeta: () => Promise<any> = value
				const overrides: {[key: string]: any} = {}
				return new Proxy({}, {
					set: (t, key: string, value: any) => {
						overrides[key] = value
						return true
					},
					get: (t, property: string) => (
						overrides[key] ?? (async(...params: any[]) => {
							const joinedPath = [...newPath, property].join(".")
							const method = "." + joinedPath
							const meta = await getMeta()
							return options.spike
								? options.spike(
									joinedPath,
									async(...params2) => requester({
										meta, method, params: params2
									}),
									...params
								)
								: requester({meta, method, params})
						})
					),
				})
			}
			else {
				return recurse(<any>value, newPath)
			}
		})
	}
	return recurse(map)
}
