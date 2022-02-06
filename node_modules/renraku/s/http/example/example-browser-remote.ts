
import type {exampleApi} from "./example-api.js"
import {browserClient} from "../browser-client.js"

export function makeBrowserRemoteForExample() {
	return browserClient<typeof exampleApi>({
		url: "http://localhost:8000/",
		metaMap: {
			greeter: async() => {},
			math: {
				calculator: async() => ({lotto: 9}),
			},
		},
	})
}
