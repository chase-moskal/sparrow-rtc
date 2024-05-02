
import * as Renraku from "renraku"
import {makeServerApi} from "./api/server.js"
import {makeBrowserApi} from "./api/browser.js"

export type Id = string

export type ServerApi = ReturnType<typeof makeServerApi>
export type ServerRemote = Renraku.Remote<ServerApi>

export type BrowserApi = ReturnType<typeof makeBrowserApi>
export type BrowserRemote = Renraku.Remote<BrowserApi>

