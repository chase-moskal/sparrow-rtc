
import {Suite, test} from "../../cynic.js"

export default <Suite>{
	"suite passes with zero failing tests": async() => {
		const {report, ...stats} = await test("example suite", {
			"example one": true,
			"example two": async() => true,
			"nested": {
				"example three": async() => true
			}
		})
		return (
			report &&
			report.includes("example suite") &&
			report.includes("0 failed tests") &&
			stats &&
			stats.total === 3 &&
			stats.failed === 0 &&
			stats.errors.length === 0
		)
	},

	"suite fails with one failing test": async() => {
		const {report, ...stats} = await test("example suite", {
			"example one": true,
			"example two": async() => true,
			"nested": {
				"example three": async() => false
			}
		})
		return (
			report &&
			report.includes("example suite") &&
			report.includes("1 FAILED tests") &&
			stats &&
			stats.total === 3 &&
			stats.failed === 1 &&
			stats.errors.length === 0
		)
	},

	"suite fails with one error'd test": async() => {
		const {report, ...stats} = await test("example suite", {
			"example one": true,
			"example two": async() => true,
			"nested": {
				"example three": async() => {
					throw new Error("example error")
				}
			}
		})
		return (
			report &&
			report.includes("example suite") &&
			report.includes("1 FAILED tests") &&
			stats &&
			stats.total === 3 &&
			stats.failed === 1 &&
			stats.errors.length === 1
		)
	},

	"suites returned by a test are tested": async() => {
		const {report, ...stats} = await test("example suite", async() => ({
			"example one": true,
			"example two": async() => true,
			"nested": {
				"example three": async() => false
			}
		}))
		return (
			report &&
			report.includes("example suite") &&
			report.includes("1 FAILED tests") &&
			stats &&
			stats.total === 3 &&
			stats.failed === 1 &&
			stats.errors.length === 0
		)
	},

	"test can pass by returning undefined or null": async() => {
		const {report, ...stats} = await test("example suite", async() => ({
			"example 1": async() => {},
			"example 2": async() => undefined,
			"example 3": async() => null,
		}))
		return report
			&& stats.total === 3
			&& stats.failed === 0
	},
}
