import { Injectable } from '@angular/core';
import { Clock, ISpaceTimeRecord, ISpaceTimeSnapshot } from '@epidemics/engine';
import { AbstractReplayRunnerService } from './abstract-replay-runner.service';
import { ReplayRunnerStartConfig } from './runner.interface';

@Injectable({
  providedIn: 'root'
})
export class SyncReplayRunnerService extends AbstractReplayRunnerService {
  constructor() {
    super();
  }

  precompute(config: ReplayRunnerStartConfig): Promise<ISpaceTimeRecord> {
    const unitInMs = config.unitInMs || 1000;
    const durationInMillis = config.duration * unitInMs;
    const duration = config.duration;
    const fps = config.fps;
    const fpms = fps / 1000;
    const numberOfFrames = fpms * durationInMillis;
    const interval = durationInMillis / numberOfFrames;

    const snapshots: ISpaceTimeSnapshot[] = [];

    let time = 0;
    this.world.start(time);

    for (let i = 0; i < numberOfFrames; i++) {
      time += interval;
      this.world.tick(time);
      snapshots.push(this.world.snapshot);
    }

    const record: ISpaceTimeRecord = {
      metadata: {
        fps,
        fpms,
        duration,
        unitInMs
      },
      snapshots
    };

    return Promise.resolve(record);
  }
}
