import { Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ISpaceTimeRecord, WorldConfig } from '@epidemics/engine';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';
import { ReplayRunnerStartConfig } from '../../runner/runner.interface';
import { ResourceCreated } from '../rest/rest.service';
import { SocketConfig, SOCKET_CONFIG } from './socket.token';

export enum ComputationEvent {
  Start = "Start",
  Progressing = "Progressing",
  Complete = "Complete",
  NotStarted = "NotStarted"
}

export interface IComputationProgress {
  frames?: {
    computed: number;
    remaining: number;
    total: number;
  };
  progression?: {
    percent: number;
    etaInMs: number;
  }
}

export interface IComputationRequestEvent {
  computing: boolean;
  reason: string;
}

export interface IComputationProgressEvent<T> {
  type: ComputationEvent;
  payload?: T,
  progress?: IComputationProgress
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;

  constructor(@Inject(SOCKET_CONFIG) private socketCfg: SocketConfig, private matSnackBar: MatSnackBar) {
    const ioFunc = (io as any).default ? (io as any).default : io;
    this.socket = ioFunc(socketCfg.url, socketCfg.options);
  }

  init(): void {
    this.socket.connect();
    this.socket.on("connect", () => console.log("connected"));

    this.socket.on("computationRequestEvent", (event: IComputationRequestEvent) => {
      const computationEventName = event.computing ? "Computation started" : "Computation not started";
      this.matSnackBar.open(`${computationEventName}: ${event.reason}`, "Close", {
        duration: 10000
      });
    });
  }
  
  computationProgress$(): Observable<IComputationProgressEvent<ISpaceTimeRecord | ResourceCreated>> {
    return new Observable((observer) => {
      this.socket.on("computationProgressEvent", (event: any) => {
        if (typeof event === "string") {
          try {
            event = JSON.parse(event);
          } catch (err) {
            console.error("Failed to parse a 'computationProgressEvent' message:", err);
            return;
          }
        }

        const parsedEvent = event as IComputationProgressEvent<ISpaceTimeRecord>;
        observer.next(parsedEvent);
      });
    });
  }

  requestComputation(config: ReplayRunnerStartConfig, worldConfig: WorldConfig): void {
    this.socket.emit("computationRequest", {...config, ...worldConfig});
  }
}
