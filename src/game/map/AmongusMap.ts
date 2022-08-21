import AmongusPlayer from '../AmongusPlayer';
import AmongusCollisionMap from './AmongusCollisionMap';
import AmongusTasksManager from './task/AmongusTasksManager';

export default class AmongusMap {
  private tasks: AmongusTasksManager;
  constructor(
    private clientMapAssetPath: string,
    private serverMapCollisionMapPath: string,
    private serverMapTasksPath: string
  ) {
    this.tasks = new AmongusTasksManager(serverMapTasksPath);
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

  private loadCollisionMap(): AmongusCollisionMap {
    return new AmongusCollisionMap();
  }

  public isColliding(player: AmongusPlayer): boolean {
    throw new Error('collision detection not implemented');
  }

  public getTasks() {
    return this.tasks;
  }
}
