import AmongusPlayer from '../AmongusPlayer';
import AmongusCollisionMap from './collision/AmongusCollisionMap';
import AmongusTasksManager from './task/AmongusTasksManager';

export default class AmongusMap {
  private tasks: AmongusTasksManager;
  private collisionMap: AmongusCollisionMap;
  constructor(
    private clientMapAssetPath: string,
    private serverMapCollisionMapPath: string,
    private serverMapTasksPath: string
  ) {
    this.tasks = new AmongusTasksManager(serverMapTasksPath);
    this.collisionMap = this.loadCollisionMap(serverMapCollisionMapPath);
  }

  public getAssetPath() {
    return this.clientMapAssetPath;
  }

  public getCollisionPath() {
    return this.serverMapCollisionMapPath;
  }

  public getTasksPath() {
    return this.serverMapTasksPath;
  }

  private loadCollisionMap(path: string): AmongusCollisionMap {
    return new AmongusCollisionMap(path);
  }

  public isColliding(player: AmongusPlayer): boolean {
    return this.collisionMap.isColliding(player.getPosition());
  }

  public getTasks() {
    return this.tasks;
  }
}
