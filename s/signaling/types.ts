
import {RoomInfo} from "./parts/rooms.js"

export type JoinResult = JoinAccepted | JoinDenied
export type JoinAccepted = {room: RoomInfo}
export type JoinDenied = {denied: true}

