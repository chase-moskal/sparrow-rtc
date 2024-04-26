
import * as http from "http"
import serveStatic from "serve-static"
import finalHandler from "finalhandler"

import {Details} from "../../types.js"
import {cynicTestFileName} from "../constants.js"
import {makeTestingPage} from "./html/make-testing-page.js"

export function runServer(details: Details) {
	const serve = serveStatic(".", { index: ["index.html", "index.htm"]})

	const server = http.createServer((request, response) => {
		const regex = new RegExp(`\/${cynicTestFileName}(?:|\.html)`, "i")

		if (regex.test(request.url!)) {
			const html = makeTestingPage(details)
			response.writeHead(200, {"Content-Type": "text/html"})
			response.write(html)
			response.end()
		}
		else {
			serve(request, response, finalHandler(request, response))
		}
	})

	server.listen(details.port)
	return server
}
