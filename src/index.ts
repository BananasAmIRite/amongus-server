import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import AmongusGameManager from './game/AmongusGameManager';

const gameManager = new AmongusGameManager();

const app = express();

const server = createServer(app);

const io = new SocketServer(server);

io.on('connection', (socket) => {
  gameManager.addConnection(socket);
});

app.post('/newgame', (req, res) => {
  const ownerUUID = req.query.owner;

  if (!ownerUUID || typeof ownerUUID !== 'string') return res.status(400).end();

  const owner = gameManager.getConnection(ownerUUID);

  if (!owner) return res.status(400).end();

  res.status(200).send(gameManager.createGame(owner));
  res.end();
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
