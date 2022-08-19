import { Socket } from 'socket.io';
import { EventEmitter } from 'stream';
import AmongusGameManager from './game/AmongusGameManager';
import { v4 as uuidv4 } from 'uuid';
import { SerializedPlayer } from './game/AmongusPlayer';
import { Location } from './utils/types';
import { GameRole } from './game/AmongusGame';

export enum ClientMessageType {
  JOIN = 'client:join',

  MOVE_PLAYER = 'client:movePlayer',

  START_GAME = 'client:startGame',

  FINISH_TASK = 'client:finishTask',
}

export type ClientAmongusPayloadType = {
  [ClientMessageType.JOIN]: {};

  [ClientMessageType.MOVE_PLAYER]: { newPosition: Location };

  [ClientMessageType.START_GAME]: {};

  [ClientMessageType.FINISH_TASK]: { taskType: string };
};

export interface ClientAmongusPayload<T extends ClientMessageType> {
  uuid: string;
  type: T;
  payload: ClientAmongusPayloadType[T];
}

declare interface AmongusSocket {
  on<K extends ClientMessageType>(
    s: K,
    listener: (v: ClientAmongusPayload<K> & { connectionId: string }) => void
  ): this;
}

// ******************

export enum ServerMessageType {
  PLAYER_JOIN = 'server:playerJoin',
  ACCEPT_JOIN = 'server:acceptJoin',
  DENY_JOIN = 'server:denyJoin',
  GAME_END = 'server:endGame',

  PLAYER_MOVE = 'server:playerMove',
  PLAYER_DEATH = 'server:playerDeath',

  LOAD_MAP = 'server:loadMap',

  UUID = 'server:uuid',
  GAME_PLAYER_DATA = 'server:sendGameData',
}

export type ServerAmongusPayloadType = {
  [ServerMessageType.PLAYER_JOIN]: { player: SerializedPlayer };
  [ServerMessageType.ACCEPT_JOIN]: { selfPlayer: SerializedPlayer };
  [ServerMessageType.DENY_JOIN]: { reason: string };
  [ServerMessageType.GAME_END]: { winner: GameRole };

  [ServerMessageType.PLAYER_MOVE]: { playerId: string; position: Location };
  [ServerMessageType.PLAYER_DEATH]: { playerId: string };

  [ServerMessageType.LOAD_MAP]: { resource: string };

  [ServerMessageType.UUID]: { uuid: string };
  [ServerMessageType.GAME_PLAYER_DATA]: {
    tasks: {
      type: string;
      position: Location;
    }[];
  };
};

export interface ServerAmongusPayload<T extends ServerMessageType> {
  type: T;
  payload: ServerAmongusPayloadType[T];
}

class AmongusSocket extends EventEmitter {
  private id: string;

  /*
  
  
  
  */
  constructor(private manager: AmongusGameManager, private socket: Socket) {
    super();
    this.id = uuidv4();
    socket.on(
      'message',
      (
        // data: string
        data: ClientAmongusPayload<any> | string
      ) => {
        // TODO: this may cause errors later on
        const d = typeof data === 'string' ? JSON.parse(data) : data;

        if (!d.uuid || !d.type) return;
        super.emit(d.type, {
          ...d,
          connectionId: this.id,
        });
      }
    );
    socket.on('disconnect', () => {
      manager.removeConnection(this);
    });

    this.send(ServerMessageType.UUID, { uuid: this.id });
  }

  public send<T extends ServerMessageType>(type: T, payload: ServerAmongusPayloadType[T]) {
    console.log('sending: ' + type);

    this.socket.emit(type, payload);
  }

  public getId() {
    return this.id;
  }

  public getSocket() {
    return this.socket;
  }
}

export default AmongusSocket;

// // client
// socket.on('server:playerJoin', ({ player }) => {
//   createPlayer(player);
// });

// socket.emit(
//   JSON.stringify({
//     uuid: 'whatverer',
//     type: 'client:join',
//     payload: {},
//   })
// );
