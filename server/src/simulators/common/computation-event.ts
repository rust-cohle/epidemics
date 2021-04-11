import { ISpaceTimeEpidemicsSnapshot } from "@epidemics/engine";

export enum ComputationEvent {
    Start = "Start",
    Progressing = "Progressing",
    Complete = "Complete",
    NotStarted = "NotStarted",
    Failed = "Failed"
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
    },
    epidemics: ISpaceTimeEpidemicsSnapshot
}

export interface IComputationProgressEvent<T> {
    type: ComputationEvent;
    payload?: T,
    progress?: IComputationProgress
}