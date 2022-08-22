import { Socket } from 'socket.io';
import { customAlphabet } from 'nanoid';
import AmongusGame from './AmongusGame';
import AmongusSocket from '../AmongusSocket';
import { ClientMessageType, ServerMessageType } from 'amongus-types';

export default class AmongusGameManager {
  private games: Map<string, AmongusGame>;

  private connections: AmongusSocket[];

  public constructor() {
    this.games = new Map();
    this.connections = [];
  }

  private generateId(): string {
    const alpha = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const id = customAlphabet(alpha, 5)();
    return this.games.has(id) ? this.generateId() : id;
  }

  public addConnection(socket: Socket, displayName: string) {
    const s = new AmongusSocket(this, socket, displayName);
    this.connections.push(s);
    s.on(ClientMessageType.JOIN, ({ payload: { uuid } }) => {
      const game = this.getGame(uuid);
      if (game) {
        game.addPlayer(s);
      } else {
        s.send(ServerMessageType.DENY_JOIN, { reason: 'No game found' });
      }
    });
  }

  public createGame(owner: AmongusSocket): string {
    const id = this.generateId();
    this.games.set(id, new AmongusGame(this, id, owner));
    return id;
  }

  public getConnection(uuid: string): AmongusSocket | undefined {
    return this.connections.find((e) => e.getId() === uuid);
  }

  public getGame(id: string) {
    return this.games.get(id);
  }

  public removeGame(id: string) {
    this.games.delete(id);
  }

  public removeConnection(socket: AmongusSocket) {
    const i = this.connections.indexOf(socket);
    if (i >= 0) this.connections.splice(i, 1);
  }
}
