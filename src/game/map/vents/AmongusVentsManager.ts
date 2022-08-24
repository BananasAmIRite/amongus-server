import { AmongusVent } from 'amongus-types';
import { readFileSync } from 'fs';

export default class AmongusVentsManager {
  private vents: AmongusVent[];

  public constructor(ventsPath: string) {
    this.vents = JSON.parse(readFileSync(ventsPath, 'utf-8'));
  }

  public getVent(id: number) {
    return this.vents.find((e) => e.id === id);
  }

  public getVents() {
    return this.vents;
  }
}
