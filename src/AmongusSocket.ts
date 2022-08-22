import { Socket } from 'socket.io';
import { EventEmitter } from 'stream';
import AmongusGameManager from './game/AmongusGameManager';
import { v4 as uuidv4 } from 'uuid';
import {
  ClientAmongusPayloadType,
  ClientMessageType,
  ServerAmongusPayloadType,
  ServerMessageType,
} from 'amongus-types';

export interface ClientAmongusPayload<T extends ClientMessageType> {
  type: T;
  payload: ClientAmongusPayloadType[T];
}

declare interface AmongusSocket {
  on<K extends ClientMessageType>(
    s: K,
    listener: (v: ClientAmongusPayload<K> & { connectionId: string }) => void
  ): this;
}

export interface ServerAmongusPayload<T extends ServerMessageType> {
  type: T;
  payload: ServerAmongusPayloadType[T];
}

class AmongusSocket extends EventEmitter {
  private id: string;

  constructor(private manager: AmongusGameManager, private socket: Socket, private displayName: string) {
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

        if (!d.type) return;
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

  public getDisplayName() {
    return this.displayName;
  }
}

export default AmongusSocket;
