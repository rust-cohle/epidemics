import { Injectable } from '@angular/core';
import { Clock, ISpaceTimeRecord, SpaceTimeTwoDimensions, WorldConfig } from '@epidemics/engine';
import { CanvasDrawingService } from '../drawing/canvas-drawing.service';
import { IReplayRunner, ReplayRunnerStartConfig } from './runner.interface';

@Injectable({
    providedIn: 'root'
})
export abstract class AbstractReplayRunnerService implements IReplayRunner {
    public animationFrames: number[] = [];

    public world: SpaceTimeTwoDimensions;

    public spacetimeRecord: ISpaceTimeRecord;

    public animationPlaying: boolean = true;

    private _worldConfig: WorldConfig = null;

    private _drawing: CanvasDrawingService;

    private _clock: Clock = new Clock(performance.now(), 1);

    private readonly DEFAULT_START_CONFIG: ReplayRunnerStartConfig = {
        fps: 60,
        duration: 10,
        unitInMs: 1000
    };

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

    abstract precompute(config: ReplayRunnerStartConfig, worldConfig?: WorldConfig): Promise<ISpaceTimeRecord>;

    async startAnimation(replayConfig?: ReplayRunnerStartConfig): Promise<void> {
        this.animationFrames.forEach(frame => cancelAnimationFrame(frame));
        this.animationFrames = [];
        this.animationPlaying = true;

        this.spacetimeRecord = await this.precompute(replayConfig || this.DEFAULT_START_CONFIG, this.worldConfig);

        this._clock.restart(performance.now());
        const animationFrame = window.requestAnimationFrame(() => this.nextFrame());
        this.animationFrames.push(animationFrame);
    }

    initialize(config: WorldConfig): void {
        this.worldConfig = config;
    }
    
    nextFrame(): void {
        if (!this.animationPlaying) {
            return;
        }
        
        this._clock.update(performance.now());
        
        const recordTimeMs = this._clock.time;
        const frame = Math.round(recordTimeMs * this.spacetimeRecord.metadata.fpms);

        const snapshot = this.spacetimeRecord.snapshots[frame];
        if (snapshot) {
            this._drawing.draw(snapshot, this.requestNextFrame.bind(this));
        }
    }

    toggleAnimation(): void {
        if (!this.animationPlaying) {
            this.animationPlaying = true;
            this._clock.resume(performance.now());
            this.nextFrame();
            return;
        }

        this.animationFrames.forEach(frame => cancelAnimationFrame(frame));
        this.animationPlaying = false;
    }

    release(): void {
        this.animationFrames.forEach((requestId) => cancelAnimationFrame(requestId));
        this.animationFrames = [];
    }

    private requestNextFrame(): void {
        const animationFrame = window.requestAnimationFrame(() => this.nextFrame());
        this.animationFrames.push(animationFrame);
    }
}
