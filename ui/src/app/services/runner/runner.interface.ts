import { CannonBallWorldConfig, ISpaceTime, ISpaceTimeRecord, SpaceTimeTwoDimensions, WorldConfig } from "@epidemics/engine";

export interface ICanvasRunner {
    animationFrames: number[];
    animationPlaying: boolean;
    world: ISpaceTime;
    worldConfig: CannonBallWorldConfig;

    startAnimation(config?: ReplayRunnerStartConfig): void;
    initialize(config: WorldConfig, generator: (config: WorldConfig) => SpaceTimeTwoDimensions): void;
    nextFrame(): void;
    toggleAnimation(): void;
    release(): void;
}

export interface ILiveRunner extends ICanvasRunner {}

export interface IReplayRunner extends ICanvasRunner {
    spacetimeRecord: ISpaceTimeRecord;

    startAnimation(config?: ReplayRunnerStartConfig): Promise<void>;
    precompute(config: ReplayRunnerStartConfig): Promise<ISpaceTimeRecord>;
}

export interface ReplayRunnerStartConfig {
    fps: number;
    duration: number;
    unitInMs: number;
}