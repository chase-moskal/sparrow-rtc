#!/usr/bin/env node

import {makeCommand} from "./command.js"
import {dieOnError} from "./internals/toolbox/die-on-error.js"
import {executeNodeTesting} from "./internals/execute-node-testing.js"
import {executeBrowserTesting} from "./internals/execute-browser-testing.js"
import {executePuppeteerTesting} from "./internals/execute-puppeteer-testing.js"

dieOnError()

const {args, params} = makeCommand()
const details = {...args, ...params}

switch (args.runtime) {

	case "node":
		await executeNodeTesting(details)
		break

	case "browser":
		await executeBrowserTesting(details)
		break

	case "puppeteer":
		await executePuppeteerTesting(details)
		break

	default:
		throw new Error(`invalid runtime "${args.runtime}", expected "node", "browser", or "puppeteer"`)
}
