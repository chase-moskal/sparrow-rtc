
import {escapeHtml} from "./escape-html.js"

export const makeTestingPage = ({suitePath, label, cynicPath, importmapPath}: {
		label: string
		suitePath: string
		cynicPath: string
		importmapPath?: string
	}) => `
	<!doctype html>
	<html>
		<head>
			<meta charset="utf-8"/>
			<title>${escapeHtml(label)}</title>
			<style>
				html, body {
					color: #89a76f;
					background: #111;
				}
			</style>

			<script type="importmap-shim">
				{
					"imports": {
						"cynic/": "./${cynicPath}/",
						"cynic": "./${cynicPath}/dist/cynic.js"
					}
				}
			</script>
			${importmapPath ? `<script type="importmap-shim" src="${importmapPath}"></script>` : ""}
			<script async defer type="module-shim"></script>
			<script async defer src="https://unpkg.com/es-module-shims@0.6.0/dist/es-module-shims.js"></script>

			<script async defer type="module-shim">
				import {runBrowser} from "./${cynicPath}/dist/internals/runners/run-browser.js"
				import suite from "./${suitePath}"
				runBrowser(${JSON.stringify(label)}, suite)
			</script>
		</head>
	</html>
`
