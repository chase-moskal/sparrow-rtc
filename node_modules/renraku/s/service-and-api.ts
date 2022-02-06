
import {Policy, Methods, Expose, Api, Service, is_service} from "./types.js"

export const service = () => ({
	policy<xMeta, xAuth>(p: Policy<xMeta, xAuth>) {
		return {
			expose<xMethods extends Methods>(e: Expose<xAuth, xMethods>): Service<xMeta, xAuth, xMethods> {
				return {
					[is_service]: is_service,
					expose: e,
					policy: p,
				}
			},
		}
	},
})

export function api<xApi extends Api>(api: xApi): xApi {
	return api
}
