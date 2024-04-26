
import {cli} from "@benev/argv"
import {RawArgs, RawParams} from "./types.js"

export function makeCommand() {
	return cli<RawArgs, RawParams>()({
		program: "cynic",
		argv: process.argv,
		columns: process.stdout.columns,

		readme: "https://github.com/chase-moskal/cynic",
		help: "run a cynic test suite module",

		argorder: ["runtime", "suite"],

		args: {

			runtime: {
				type: String,
				mode: "requirement",
				help: `can be "node", "browser", or "puppeteer"`,
			},

			suite: {
				type: String,
				mode: "requirement",
				help: `path to cynic test suite module (eg, "dist/suite.test.js")`,
			},

		},

		params: {

			help: {
				type: Boolean,
				mode: "option",
				help: `trigger the help page`,
			},

			label: {
				type: String,
				mode: "default",
				default: "test suite",
				help: `name of the test suite`,
			},

			cynic: {
				type: String,
				mode: "default",
				default: "node_modules/cynic",
				help: `path to cynic library root`,
			},

			importmap: {
				type: String,
				mode: "option",
				help: `path to your own import map`,
			},

			open: {
				type: Boolean,
				mode: "option",
				help: `(when runtime=browser) attempt to prompt open default web browser`,
			},

			port: {
				type: Number,
				mode: "default",
				default: 8021,
				help: `(when runtime=puppeteer) port to run puppeteer server`,
			},

			host: {
				type: String,
				mode: "default",
				default: "http://localhost",
				help: `(when runtime=puppeteer) url hostname to puppeteer server`,
			},

		},
	})
}
