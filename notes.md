# Backend Notes

## Player-Game Handshake:

```
- player logs into the server (through websocket request)
  - receives a player uuid
- player uses player uuid to create a new game by inputting as the owner
- player receives the game uuid
  - player has to then join the by sending a `client:join` request to the websocket

... player waits for other players to join

- player sends a client:startGame request to start the game
```

## Player Movement:

```
- player sends movement request to the server (through `client:movePlayer`)
- server verifies that this movement is legal (collision checks and whatnot)
    - if legal, broadcasts player movement to all players in the game
    - if not legal, does not broadcast anything

```

# Frontend Notes

```

- For things like voting and other secondary screens, maybe use some sort of HTML element overlaying the main screen for easier coding (cuz I do NOT wanna make a scroll pane)

```

## Player movement:

```
- to make it so that movement data that is sent is being optimized enough, send only once every like 1/30secs with an async thread
    - To move, add the total movement to that thread
    - when 1/30 secs have passed, the async thread will push the movement data to the server
```
