import { readFileSync } from 'fs';
import { Location } from 'amongus-types';

interface CollisionMap {
  scale: number;
  collisionBlocks: boolean[][];
}

export default class AmongusCollisionMap {
  private collisionMap: CollisionMap;
  constructor(collisionMapPath: string) {
    this.collisionMap = JSON.parse(readFileSync(collisionMapPath, 'utf-8'));
  }

  private getCollisionBlock(x: number, y: number) {
    try {
      return this.collisionMap.collisionBlocks[y][x];
    } catch (err) {
      return false;
    }
  }

  public isColliding(loc: Location, width: number, height: number) {
    // calculates the collision block the player is in, then checks if it is a colliding or noncolliding block
    return (
      this.getCollisionBlock(
        Math.floor(loc.x / this.collisionMap.scale),
        Math.floor(loc.y / this.collisionMap.scale)
      ) ||
      this.getCollisionBlock(
        Math.floor((loc.x + width) / this.collisionMap.scale),
        Math.floor(loc.y / this.collisionMap.scale)
      ) ||
      this.getCollisionBlock(
        Math.floor(loc.x / this.collisionMap.scale),
        Math.floor((loc.y + height) / this.collisionMap.scale)
      ) ||
      this.getCollisionBlock(
        Math.floor((loc.x + width) / this.collisionMap.scale),
        Math.floor((loc.y + height) / this.collisionMap.scale)
      )
    );
  }
}
