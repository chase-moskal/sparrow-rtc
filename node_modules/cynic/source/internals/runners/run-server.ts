
import * as http from "http"
import handler from "serve-handler"

import {cynicTestFileName} from "../constants.js"
import {makeTestingPage} from "./html/make-testing-page.js"

export function runServer(args: {
		port: number
		label: string
		suitePath: string
		cynicPath: string
		importmapPath?: string
	}) {
	const server = http.createServer((request, response) => {
		const regex = new RegExp(`\/${cynicTestFileName}(?:|\.html)`, "i")
		if (regex.test(request.url)) {
			const html = makeTestingPage(args)
			response.writeHead(200, {"Content-Type": "text/html"})
			response.write(html)
			response.end()
		}
		else {
			handler(request, response)
		}
	})
	server.listen(args.port)
	return server
}
