
import {mincolumns} from "../constants.js"
import {uncolor} from "../../tools/colors.js"

export function wrappist(columns: number, text: string) {
	columns = columns < mincolumns
		? mincolumns
		: columns

	return text
		.split("\n")
		.map(line => {
			line = line.trim()
			const colorless = uncolor(line)

			if (colorless.length <= columns)
				return line

			const words = line.split(/\s+/)
			let index = 0
			let length = 0
			let newline = ""

			for (let word of words) {
				word = index === 0
					? word
					: " " + word

				const wordlength = uncolor(word).length
				const length_if_word_added = length + wordlength

				if (length_if_word_added >= columns) {
					length = 0
					newline += "\n"
				}

				newline += word
				length += wordlength
				index += 1
			}

			return newline
		})
		.join("\n")
}
