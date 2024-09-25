
# 🐦 sparrow-rtc

🌟 ***sparrow makes webrtc super easy.***  
🫂 webrtc is peer-to-peer networking between browser tabs.  
🎮 perfect for making player-hosted multiplayer web games.  
📽️ capable of multimedia streaming.  
🧠 simple concepts like `people` in `rooms`.  
💖 free and open source.  

<br/>

## 🐦 learn by example

1. install sparrow-rtc
    ```sh
    npm i sparrow-rtc
    ```
1. connect to the sparrow server
    ```ts
    import {Sparrow} from "sparrow-rtc"

    const sparrow = await Sparrow.connect()
    ```

### join a room

1. you just need the `roomId`
    ```ts
    const room = await sparrow.join(roomId)
    ```
1. see who else is in the room
    ```ts
    for (const person of room.people)
      console.log(person.name)
    ```
1. communicate with the host
    ```ts
    room.host.channels.reliable.send("hello")
    room.host.channels.unreliable.send("hello")
    room.host.channels.reliable.onmessage(message => console.log(message))
    ```
1. leave the room
    ```ts
    await room.leave()
    ```

### host a room

1. provide some room settings
    ```ts
    const room = await sparrow.host({
      label: "my cool club",
      discoverable: true,
      allowJoin: person => true,
    })

    // send this to your friends so they can join
    const roomId = room.id
    ```
1. react to people joining or leaving
    ```ts
    room.onJoin(person => {
      console.log(`${person.name} joined the room`)
      person.channels.unreliable.send("hello")
      person.channels.reliable.send("world")
    })

    room.onLeave(person => {
      console.log(`${person.name} has left the room`)
    })
    ```
1. send a message to each person in the room
    ```ts
    for (const person of room.people)
      person.channels.reliable.send("lol")
    ```
1. kick somebody out of the room
    ```ts
    await room.kick(person)
    ```
1. terminate the room
    ```ts
    await room.terminate()
    ```

<br/>

## 🐦 learn more about sparrow

📡 defaults to use sparrow's free signaling server.  
⛅ defaults to use google stun/turn servers.  
🤖 defaults to giving you dual data channels.  

### reconfigure the defaults
  ```ts
  import {Sparrow} from "sparrow-rtc"

  const sparrow = await Sparrow.connect({
    url: "wss://sparrow.benev.gg/",
    rtcConfig: stdRtcConfig(),
    channelsConfig: stdDataChannels(),
  })
  ```

<br/>

## 🐦 setup multimedia streaming

*TODO*


