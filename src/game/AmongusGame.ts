import AmongusGameManager from './AmongusGameManager';
import AmongusMapLoader from './map/AmongusMapLoader';
import AmongusPlayer from './AmongusPlayer';
import AmongusSocket from '../AmongusSocket';
import { ClientMessageType, ServerAmongusPayloadType, ServerMessageType, GameRole } from 'amongus-types';
import { randomSubset } from '../utils/utils';
import { IMPOSTER_AMOUNT } from '../constants';

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
      './assets/lobby-map-collision.json',
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
    if (this.players.findIndex((e) => e.getId() === p.getId()) !== -1)
      return this.broadcastToPlayer(p, ServerMessageType.DENY_JOIN, { reason: 'Already joined' });

    this.broadcastToPlayer(p, ServerMessageType.ACCEPT_JOIN, { gameUuid: this.id, selfPlayer: p.serialize() });
    this.mapLoader.onPlayerJoin(p);
    this.broadcast(ServerMessageType.PLAYER_JOIN, { player: p.serialize() });
    this.players.push(p);
  }

  public removePlayer(plr: AmongusPlayer) {
    const i = this.players.findIndex((e) => e.getId() === plr.getId());
    if (i < 0) return;

    this.players.splice(i, 1);

    this.broadcast(ServerMessageType.PLAYER_LEAVE, { playerId: plr.getId() });
    this.checkGameOver();
    this.removeImposter(plr);
  }

  private removeImposter(imposter: AmongusPlayer) {
    const i = this.imposters.findIndex((e) => e.getId() === imposter.getId());
    if (i < 0) return;

    this.imposters.splice(i, 1);
    this.checkGameOver();
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
    this.mapLoader.setMap('main-map.png', './assets/main-map-collision.json', './assets/main-map-tasks.json');
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

  private removeAllListeners(p: AmongusPlayer) {
    // remove ALL listeners EXCEPT the JOIN listener because we need that for future join requests
    for (const evt of Object.values(ClientMessageType)) {
      if (evt === ClientMessageType.JOIN) continue;
      p.getConnection().removeAllListeners(evt);
    }
  }

  private end() {
    for (const p of this.players) {
      this.removeAllListeners(p);
    }
    this.manager.removeGame(this.id);
  }
}
