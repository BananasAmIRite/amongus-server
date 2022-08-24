import AmongusPlayer from '../AmongusPlayer';
import AmongusCollisionMap from './collision/AmongusCollisionMap';
import AmongusTasksManager from './task/AmongusTasksManager';
import { readFileSync } from 'fs';
import AmongusVentsManager from './vents/AmongusVentsManager';

export interface MapConfig {
  asset: string;
  collision: string;
  tasks: string;
  vents: string;
}

export default class AmongusMap {
  private tasks: AmongusTasksManager;
  private collisionMap: AmongusCollisionMap;
  private vents: AmongusVentsManager;
  private config: MapConfig;
  constructor(private mapAssetConfigPath: string) {
    this.config = JSON.parse(readFileSync(mapAssetConfigPath, 'utf-8'));
    if (!isMapConfig(this.config)) throw new Error(`Invalid map config: ${mapAssetConfigPath}`);
    this.tasks = new AmongusTasksManager(this.config.tasks);
    this.collisionMap = new AmongusCollisionMap(this.config.collision);
    this.vents = new AmongusVentsManager(this.config.vents);
  }

  public getAssetPath() {
    return this.config.asset;
  }

  public getCollisionPath() {
    return this.config.collision;
  }

  public getTasksPath() {
    return this.config.tasks;
  }

  public getVentsPath() {
    return this.config.vents;
  }

  public isColliding(player: AmongusPlayer): boolean {
    return this.collisionMap.isColliding(player.getPosition());
  }

  public getTasks() {
    return this.tasks;
  }

  public getCollisionMap() {
    return this.collisionMap;
  }

  public getVents() {
    return this.vents;
  }
}

function isMapConfig(obj: any): obj is MapConfig {
  return 'asset' in obj && 'collision' in obj && 'tasks' in obj && 'vents' in obj;
}
