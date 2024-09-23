
# the sparrow-rtc signal server

## terminology

- **server** -- this refers to the sparrow-rtc signal server.
- **connection** -- this is a websocket connection to the signal server.
- **identity** -- users start by registering an identity.
- **host** -- this is a connection that has decided to act as a host, by creating a session they can control.
- **client** -- this is a connection that has decided to act as a client, by joining a session.

## operation

### server

the server accepts new connections.

- a connection can choose to generate an identity, where and the server provides a "username" and a "password" that are actually just randomly generated keys.
- if a user's connection is lost, the user can start a new connection and reclaim their identity by using the password.

