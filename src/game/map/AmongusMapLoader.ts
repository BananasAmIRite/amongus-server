import AmongusGame from '../AmongusGame';
import AmongusMap from './AmongusMap';
import AmongusPlayer from '../AmongusPlayer';
import { ServerMessageType } from '../../AmongusSocket';

export default class AmongusMapLoader {
  private currentMap!: AmongusMap;
  public constructor(
    private game: AmongusGame,
    initialAssetPath: string,
    initialCollisionPath: string,
    initialTasksPath: string
  ) {
    this.setMap(initialAssetPath, initialCollisionPath, initialTasksPath);
  }

  public setMap(assetPath: string, collisionMapPath: string, tasksPath: string) {
    const m = new AmongusMap(assetPath, collisionMapPath, tasksPath);
    this.currentMap = m;
    this.game.broadcast(ServerMessageType.LOAD_MAP, { resource: assetPath });
  }

  public onPlayerJoin(p: AmongusPlayer) {
    if (!this.currentMap) return;

    this.game.broadcastToPlayer(p, ServerMessageType.LOAD_MAP, { resource: this.currentMap.getAssetPath() });
  }

  public getCurrentMap() {
    return this.currentMap;
  }
}
