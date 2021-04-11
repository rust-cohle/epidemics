import { HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WorldConfig } from '@epidemics/engine';
import { Observable, Subject } from 'rxjs';
import { last, map, switchMap, takeWhile, tap } from 'rxjs/operators';
import { ResourceCreated, RestService } from '../io/rest/rest.service';
import { ComputationEvent, SocketService } from '../io/socket/socket.service';
import { AbstractReplayRunnerService } from './abstract-replay-runner.service';
import { ReplayRunnerStartConfig } from './runner.interface';

@Injectable({
  providedIn: 'root'
})
export class RemoteReplayRunnerService extends AbstractReplayRunnerService {
  private downloadProgressSub = new Subject<HttpEvent<any>>();

  constructor(protected socketService: SocketService, protected restService: RestService) {
    super();
  }
  
  precompute(config: ReplayRunnerStartConfig, worldConfig: WorldConfig): Promise<any> {
    this.socketService.requestComputation(config, worldConfig);
    return this.socketService.computationProgress$()
      .pipe(
        takeWhile(computationProgressEvent => computationProgressEvent.type !== ComputationEvent.Complete, true),
        map(computationProgressEvent => computationProgressEvent.payload),
        last(),
        switchMap(({resource}: ResourceCreated) =>
          this.restService.getResource(resource.uuid).pipe(
            tap((event: HttpEvent<any>) => this.downloadProgressSub.next(event)),
            last(),
            map((response: HttpResponse<any>) => response.body)
          )
        )
      )
      .toPromise();
  }

  downloadProgress$(): Observable<HttpEvent<any>> {
    return this.downloadProgressSub.asObservable();
  }
}
