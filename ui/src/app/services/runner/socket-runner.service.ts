import { Injectable } from '@angular/core';
import { ISpaceTime, CannonBallWorldConfig, WorldConfig, SpaceTimeTwoDimensions } from '@epidemics/engine';
import { SocketService } from '../io/socket/socket.service';
import { ICanvasRunner, ReplayRunnerStartConfig } from './runner.interface';

@Injectable({
  providedIn: 'root'
})
export class SocketRunnerService implements ICanvasRunner {

  constructor(private socketIo: SocketService) { }
  animationFrames: number[];
  animationPlaying: boolean;
  world: ISpaceTime;
  worldConfig: CannonBallWorldConfig;

  startAnimation(generator: (config: WorldConfig) => SpaceTimeTwoDimensions, config?: ReplayRunnerStartConfig): void {
    throw new Error('Method not implemented.');
  }

  initialize(config: WorldConfig, generator: (config: WorldConfig) => SpaceTimeTwoDimensions): void {
    throw new Error('Method not implemented.');
  }

  nextFrame(): void {
    throw new Error('Method not implemented.');
  }

  toggleAnimation(): void {
    throw new Error('Method not implemented.');
  }

  release(): void {
    throw new Error('Method not implemented.');
  }
}
