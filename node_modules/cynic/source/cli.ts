#!/usr/bin/env node

import commander from "commander"
import {dieOnError} from "./internals/toolbox/die-on-error.js"
import {executeNodeTesting} from "./internals/execute-node-testing.js"
import {executeBrowserTesting} from "./internals/execute-browser-testing.js"
import {executePuppeteerTesting} from "./internals/execute-puppeteer-testing.js"
import {getValidatedCommandLineArguments} from "./internals/get-validated-command-line-arguments.js"

;(async() => {

	dieOnError()

	commander
		.arguments("<environment> <suitePath>")
		.option("-l, --label <string>", "name of the test suite", "test suite")
		.option("-o, --open <boolean>", "open the browser automatically", "false")
		.option("-p, --port <number>", "port to run puppeteer", "8021")
		.option("-O, --origin <string>", "url origin to test suite page", "http://localhost:8021")
		.option("-c, --cynic-path <string>", "path to cynic library root", "node_modules/cynic")
		.option("-i, --importmap-path <string>", "path to your own import map", undefined)
		.parse(process.argv)

	const args = getValidatedCommandLineArguments(commander)

	if (args.environment === "node") executeNodeTesting(args)
	else if (args.environment === "browser") executeBrowserTesting(args)
	else if (args.environment === "puppeteer") executePuppeteerTesting(args)
	else throw new Error(`environment must be 'node', 'browser', or 'puppeteer'`)
})()
