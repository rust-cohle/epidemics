import { Line2D, Point2D } from "../../mathematics";
import { PersonEpidemicsState } from "./abstract-physical-object";

export interface IEnlightedPointSnapshot {
    point: [number, number],
    intensity: number,
    lightDirection: [number, number]
}

export interface ISnapshotObject {
    id: string;
    type: string;
    radius: number;
    position: [number, number];
    enlightedPoints: IEnlightedPointSnapshot[];
    epidemics?: {
        state: PersonEpidemicsState
    },
    line?: Line2D;
    bounds?: [Point2D, Point2D];
    isLightSource?: boolean;
}