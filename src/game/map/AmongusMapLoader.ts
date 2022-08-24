import AmongusGame from '../AmongusGame';
import AmongusMap from './AmongusMap';
import AmongusPlayer from '../AmongusPlayer';
import { ServerMessageType } from 'amongus-types';

export default class AmongusMapLoader {
  private currentMap!: AmongusMap;
  public constructor(private game: AmongusGame, initialAssetConfigPath: string) {
    this.setMap(initialAssetConfigPath);
  }

  public setMap(assetConfigPath: string) {
    const m = new AmongusMap(assetConfigPath);
    this.currentMap = m;
    this.game.broadcast(ServerMessageType.LOAD_MAP, { resource: this.currentMap.getAssetPath() });
  }

  public onPlayerJoin(p: AmongusPlayer) {
    if (!this.currentMap) return;

    this.game.broadcastToPlayer(p, ServerMessageType.LOAD_MAP, { resource: this.currentMap.getAssetPath() });
  }

  public getCurrentMap() {
    return this.currentMap;
  }
}
