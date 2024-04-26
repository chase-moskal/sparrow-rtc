
import {api, service} from "../../service-and-api.js"
import {ConnectionControls, Remote} from "../../types.js"

export const clientsideApi = api({
	clientService: service()
		.policy(async() => {})
		.expose(() => ({
			async getClientTime() {
				return Date.now()
			},
		})),
})

export const makeServersideApi = (
		controls: ConnectionControls,
		clientside: Remote<typeof clientsideApi>
	) => (
	api({
		serverService: service()
			.policy(async() => {})
			.expose(() => ({
				async getServerTime() {
					return Date.now()
				},
				async promptToAskBack() {
					return clientside.clientService.getClientTime()
				},
			})),
	})
)
