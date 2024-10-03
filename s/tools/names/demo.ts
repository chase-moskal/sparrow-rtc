
import {FunnyNames} from "./funny.js"
import {syllabicName} from "./syllabic.js"

console.log("====== syllabic names ======")

for (let i = 0; i < 20; i++)
	console.log(" - ", syllabicName())

const funny = new FunnyNames()

console.log("====== funny names ======")

for (let i = 0; i < 20; i++)
	console.log(" - ", funny.generate())

