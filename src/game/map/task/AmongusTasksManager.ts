import { readFileSync } from 'fs';
import { Location } from 'amongus-types';
import { randomSubset } from '../../../utils/utils';

export interface AmongusTask {
  type: string;
  position: Location;
}

export default class AmongusTasksManager {
  private tasks: AmongusTask[];
  public constructor(tasksPath: string) {
    this.tasks = this.loadTasks(tasksPath);
  }

  private loadTasks(tasksPath: string) {
    return JSON.parse(readFileSync(tasksPath, 'utf-8'));
  }

  public randomTask() {
    return this.tasks[Math.floor(Math.random() * this.tasks.length)];
  }

  public randomTaskSet(amount: number) {
    return randomSubset(this.tasks, amount);
  }
}
