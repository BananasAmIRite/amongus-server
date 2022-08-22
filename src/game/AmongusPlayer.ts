import AmongusGame from './AmongusGame';
import AmongusSocket from '../AmongusSocket';
import {
  Location,
  ClientAmongusPayloadType,
  ClientMessageType,
  ServerMessageType,
  SerializedPlayer,
  GameRole,
  AmongusTask,
} from 'amongus-types';
import { TASK_AMOUNT } from '../constants';

type ClientListener<T extends ClientMessageType> = (data: ClientAmongusPayloadType[T]) => void;

export default class AmongusPlayer {
  private position: Location = { x: 0, y: 0 };
  private tasks: AmongusTask[] = [];
  private isDead: boolean = false;
  private deadBodyPosition: Location = { x: 0, y: 0 };

  private _moveListener: ClientListener<ClientMessageType.MOVE_PLAYER> = (data) => {
    const oldPos = this.getPosition();
    this.setPositionWithoutUpdate(data.newPosition);
    if (this.game.getCurrentMap().isColliding(this)) {
      this.setPositionWithoutUpdate(oldPos);
      return;
    }
    this.setPosition(data.newPosition);
  };

  private _finishTaskListener: ClientListener<ClientMessageType.FINISH_TASK> = (data) => {
    const taskIdx = this.tasks.findIndex((e) => e.type === data.taskType);
    this.tasks.splice(taskIdx, 1);
  };

  public constructor(private game: AmongusGame, private connection: AmongusSocket) {
    connection.getSocket().on('disconnect', () => {
      game.removePlayer(this);
    });

    connection.on(ClientMessageType.LEAVE, () => {
      game.removePlayer(this);
    });
  }

  public startGame(isImposter: boolean) {
    this.isDead = false;
    this.setupListeners(isImposter);
    this.tasks = this.game.getCurrentMap().getTasks().randomTaskSet(TASK_AMOUNT);
    this.game.broadcastToPlayer(this, ServerMessageType.GAME_PLAYER_DATA, {
      tasks: this.tasks,
      role: isImposter ? GameRole.IMPOSTER : GameRole.CREWMATES,
    });
  }

  // listeners
  private setupListeners(isImposter: boolean) {
    this.connection.addListener(ClientMessageType.MOVE_PLAYER, this._moveListener);
    if (!isImposter) this.connection.addListener(ClientMessageType.FINISH_TASK, this._finishTaskListener);
  }

  private removeListeners() {
    this.connection.removeListener(ClientMessageType.MOVE_PLAYER, this._moveListener);
    this.connection.removeListener(ClientMessageType.FINISH_TASK, this._finishTaskListener);
  }

  public destroy() {
    this.removeListeners();
  }

  private setPositionWithoutUpdate(pos: Location) {
    this.position = pos;
  }

  public setPosition(pos: Location) {
    this.setPositionWithoutUpdate(pos);
    this.game.broadcast(ServerMessageType.PLAYER_MOVE, { playerId: this.getId(), position: this.position });
  }

  public getConnection() {
    return this.connection;
  }

  public getId() {
    return this.connection.getId();
  }

  public getPosition() {
    return this.position;
  }

  public kill() {
    this.isDead = true;
    this.deadBodyPosition = this.position;
    this.game.broadcast(ServerMessageType.PLAYER_DEATH, { playerId: this.getId() });
  }

  public getTasks() {
    return this.tasks;
  }

  public serialize(): SerializedPlayer {
    return {
      id: this.getId(),
      position: this.position,
      isDead: this.isDead,
      deadBodyPosition: this.deadBodyPosition,
    };
  }

  public isAlive() {
    return !this.isDead;
  }
}
