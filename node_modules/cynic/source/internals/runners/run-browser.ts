
import {test} from "../../test.js"
import {Suite} from "../../types.js"

export async function runBrowser(label: string, suite: Suite) {
	const {report, failed} = await test(label, suite)

	const pre = document.createElement("pre")
	pre.className = "report"
	pre.textContent = report
	document.body.appendChild(pre)

	if (failed > 0) {
		const pre2 = document.createElement("pre")
		pre2.className = "failed"
		document.body.appendChild(pre2)
	}
}
