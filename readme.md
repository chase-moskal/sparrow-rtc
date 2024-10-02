
# 🐦 sparrow-rtc

🌟 ***sparrow makes webrtc super easy.***  
🫂 webrtc is peer-to-peer networking between browser tabs.  
🎮 perfect for making player-hosted multiplayer web games.  
📽️ also capable of multimedia streaming.  
💖 free and open source.  

<br/>

## 🐦 hosting and joining

1. **install sparrow-rtc**
    ```sh
    npm i sparrow-rtc
    ```
1. **host a session**
    ```ts
    import {Sparrow} from "sparrow-rtc"

    const session = await Sparrow.host({
      onJoin: peer => {
        console.log("somebody joined the game")
        peer.channels.unreliable.send("world")
        peer.channels.unreliable.onmessage = m => console.log(m.data)
        return () => console.log("somebody left the game")
      },
    })
    ```
    - this creates a websocket connection to the sparrow signaling server
    - people can join using the invite string
      ```ts
      session.invite
        // "8ab469956da27aff3825a3681b4f6452"
      ```
1. **join a session**
    ```ts
    import {Sparrow} from "sparrow-rtc"

    const session = await Sparrow.join({
      invite: "8ab469956da27aff3825a3681b4f6452",
      onDisconnected: () => console.log("you've been disconnected"),
    })
    ```

<br/>

## 🐦 learn more about sparrow

- `Sparrow.host` and `Sparrow.join` both accept these common options
  ```ts
  import {CommonOptions} from "sparrow-rtc"

  const options: CommonOptions = {

    // defaults to use sparrow's free signaling server
    url: "wss://sparrow.benev.gg/",

    // defaults to using google's free stun/turn servers
    rtcConfig: stdRtcConfig(),

    // defaults to dual data channels, one reliable, one unreliable
    channelsConfig: stdDataChannels(),
  })
  ```

<br/>

## 🐦 setup multimedia streaming

*TODO*


