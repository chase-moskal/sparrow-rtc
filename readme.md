
# 🐦 sparrow-rtc

*webrtc signalling server, and connections library*

📦 **`npm install sparrow-rtc`**

📡 easily establish webrtc connections and transmit data  
🕹️ designed to provide connectivity for multiplayer games  
🛠️ we run a free instance of the signalling server that you can use  
🧪 early alpha software, expect changes  
💖 free and open source just for you  

free websocket signalling server is running at `wss://sparrow-rtc.benevolent.games/`

<br/>

### start a webrtc session as a host

```ts
import {createSessionAsHost, standardRtcConfig} from "sparrow-rtc"

const hostConnection = await createSessionAsHost({
  label: "my game session",
  signalServerUrl: "wss://sparrow-rtc.benevolent.games/",
  rtcConfig: standardRtcConfig,

  onStateChange({session}) {
    console.log("session state changed:", session)
  },

  handleJoin({clientId, send, close}) {
    console.log(`client has joined: ${clientId}`)
    send("we can send any string or arraybuffer data!")

    // we can close the connection whenever we want
    setTimeout(close, 10_000)

    return {
      handleMessage(message) {
        console.log("message received!", message)
      },
      handleClose() {
        console.log("client connection closed:", clientId)
      },
    }
  },
})

console.log(`now hosting session:`, hostConnection.state.sessionId)
```

<br/>

### connect to a webrtc session as a client

```ts
import {joinSessionAsClient, standardRtcConfig} from "sparrow-rtc"

const clientConnection = await joinSessionAsClient({
  sessionId: "840ead63", // maybe from an invite link!
  signalServerUrl: "wss://sparrow-rtc.benevolent.games/",
  rtcConfig: standardRtcConfig,

  onStateChange({clientId, session}) {
    console.log("state changed", {clientId, session})
  },

  handleJoin({clientId, send, close}) {
    console.log(`client has joined: ${clientId}`)
    send("we can send any string or arraybuffer data!")

    // we can close the connection whenever we want
    setTimeout(close, 10_000)

    return {
      handleMessage(message) {
        console.log("message received!", message)
      },
      handleClose() {
        console.log("client connection closed:", clientId)
      },
    }
  }
})

console.log(`now connected as client to session:`, clientConnection.state.session)
```
