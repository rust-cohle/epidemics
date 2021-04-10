import { Injectable } from '@angular/core';
import { generateCannonBallWorld, SpaceTimeTwoDimensions, WorldConfig } from '@epidemics/engine';
import { CanvasDrawingService } from '../drawing/canvas-drawing.service';
import { ILiveRunner } from './runner.interface';

@Injectable({
  providedIn: 'root'
})
export class LiveRunnerService implements ILiveRunner {
  public animationFrames: number[] = [];

  public world: SpaceTimeTwoDimensions;

  public animationPlaying: boolean = true;
  
  private _worldConfig: WorldConfig = null;

  private _drawing: CanvasDrawingService;

  constructor() { }

  set drawing(drawing: CanvasDrawingService) {
    this._drawing = drawing;
  }

  get worldConfig(): WorldConfig {
    return this._worldConfig;
  }

  set worldConfig(config: WorldConfig) {
    const existingConfig = this.worldConfig || {};
    this._worldConfig = {
      ...existingConfig,
      ...config
    }
  }

  initialize(config: WorldConfig): void {
    this.worldConfig = config;
    this.world = generateCannonBallWorld(this.worldConfig);

    this.animationPlaying = true;
  }

  startAnimation(): void {
    this.release();
    this.initialize(this.worldConfig);

    this.world.start(performance.now());

    this.requestNextFrame();
  }

  nextFrame(): void {
    if (!this.animationPlaying) {
      return;
    }

    const keepGoing: boolean = this.world.tick(performance.now());
    this._drawing.draw(this.world.snapshot, () => {
      if(keepGoing) {
        this.requestNextFrame();
        return;
      }

      this.release();
    });
  }

  toggleAnimation(): void {
    if (!this.animationPlaying) {
      this.animationPlaying = true;
      this.world.resume(performance.now());
      this.nextFrame();
      return;
    }

    this.release();
  }
  
  release(): void {
    this.animationFrames.forEach((requestId) => cancelAnimationFrame(requestId));
    this.animationFrames = [];
    this.animationPlaying = false;
  }

  private requestNextFrame(): void {
    const animationFrame = window.requestAnimationFrame(() => this.nextFrame());
    this.animationFrames.push(animationFrame);
  }
}
