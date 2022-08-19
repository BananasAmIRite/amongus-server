import AmongusGameManager from './AmongusGameManager';
import AmongusMapLoader from './map/AmongusMapLoader';
import AmongusPlayer from './AmongusPlayer';
import AmongusSocket, { ClientMessageType, ServerAmongusPayloadType, ServerMessageType } from '../AmongusSocket';
import { randomSubset } from '../utils/utils';
import { IMPOSTER_AMOUNT } from '../constants';

// declare interface AmongusSocket {
//   on<K extends ClientMessageType>(s: K, listener: (v: AmongusPayload<K>) => void): this;
// }

export enum GameRole {
  IMPOSTER = 'imposter',
  CREWMATES = 'crewmate',
}

export default class AmongusGame {
  private players: AmongusPlayer[] = [];

  private started: boolean = false;
  private imposters: AmongusPlayer[] = [];

  private mapLoader: AmongusMapLoader;

  public constructor(private manager: AmongusGameManager, private id: string, private initiatingSocket: AmongusSocket) {
    // set initial lobby state
    this.mapLoader = new AmongusMapLoader(
      this,
      'lobby-map.png',
      './assets/lobby-map-collision.png',
      './assets/lobby-map-tasks.json'
    );

    this.initiatingSocket.getSocket().on('disconnect', () => {
      this.end();
    });

    initiatingSocket.on(ClientMessageType.START_GAME, () => {
      this.start();
    });
  }

  public addPlayer(conn: AmongusSocket) {
    const p = new AmongusPlayer(this, conn);

    if (this.started)
      return this.broadcastToPlayer(p, ServerMessageType.DENY_JOIN, { reason: 'Game has already started' });

    this.broadcastToPlayer(p, ServerMessageType.ACCEPT_JOIN, { selfPlayer: p.serialize() });
    this.mapLoader.onPlayerJoin(p);
    this.broadcast(ServerMessageType.PLAYER_JOIN, { player: p.serialize() });
    this.players.push(p);
  }

  public removePlayer(conn: AmongusSocket) {
    const i = this.players.findIndex((e) => e.getConnection() === conn);
    if (i >= 0) this.players.splice(i, 1);
  }

  public broadcast<T extends ServerMessageType>(type: T, payload: ServerAmongusPayloadType[T]) {
    for (const player of this.players) {
      player.getConnection().send(type, payload);
    }
  }

  public broadcastToPlayer<T extends ServerMessageType>(
    player: AmongusPlayer,
    type: T,
    payload: ServerAmongusPayloadType[T]
  ) {
    player.getConnection().send(type, payload);
  }

  private start() {
    this.started = true;
    this.mapLoader.setMap('map-map.png', './assets/main-map-collision.png', './assets/main-map-tasks.json');
    this.imposters = randomSubset(this.players, IMPOSTER_AMOUNT);
  }

  public checkGameOver() {
    if (this.players.reduce((a, b) => a + b.getTasks().length, 0) === 0) {
      // no more tasks left;
      this.endGame(GameRole.CREWMATES);
    } else if (this.players.length <= 2 * this.imposters.filter((e) => e.isAlive()).length) {
      this.endGame(GameRole.IMPOSTER);
    }
  }

  public getCurrentMap() {
    return this.mapLoader.getCurrentMap();
  }

  private endGame(roleWin: GameRole) {
    this.broadcast(ServerMessageType.GAME_END, {
      winner: roleWin,
    });
    this.end();
  }

  private end() {
    this.manager.removeGame(this.id);
  }
}
