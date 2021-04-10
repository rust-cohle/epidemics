import { Injectable } from '@angular/core';
import { ISpaceTimeRecord, WorldConfig } from '@epidemics/engine';
import { last, map, takeWhile } from 'rxjs/operators';
import { ComputationEvent, SocketService } from '../io/socket/socket.service';
import { AbstractReplayRunnerService } from './abstract-replay-runner.service';
import { ReplayRunnerStartConfig } from './runner.interface';

@Injectable({
  providedIn: 'root'
})
export class RemoteReplayRunnerService extends AbstractReplayRunnerService {
  constructor(protected socketService: SocketService) {
    super();
  }
  
  precompute(config: ReplayRunnerStartConfig, worldConfig: WorldConfig): Promise<ISpaceTimeRecord> {
    this.socketService.requestComputation(config, worldConfig);
    return this.socketService.computationProgress$()
      .pipe(
        takeWhile(computationProgressEvent => computationProgressEvent.type !== ComputationEvent.Complete, true),
        map(computationProgressEvent => computationProgressEvent.payload),
        last()
      )
      .toPromise();
  }
}
