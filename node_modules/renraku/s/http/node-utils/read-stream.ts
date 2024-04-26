
import {Readable} from "stream"
import {ApiError} from "../../error.js"

export async function readStream(stream: Readable, maxBytes: number): Promise<string> {
	return new Promise((resolve, reject) => {

		let bytes = 0
		const chunks: Uint8Array[] = []

		stream.on("data", chunk => {
			bytes += chunk.length
			if (bytes <= maxBytes) {
				chunks.push(chunk)
			}
			else {
				reject(new ApiError(413, "exceeded maximum request size"))
				stream.destroy()
			}
		})

		stream.on("error", reject)

		stream.on("end", () => resolve(
			Buffer.concat(chunks).toString("utf8")
		))
	})
}
