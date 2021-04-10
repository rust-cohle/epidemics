import { NumberVector2D, Point2D } from "../../mathematics";

export const METER_TO_PIXELS_RATIO = 50; // one meter is 50 pixels

export function vectorToPixels(vector: NumberVector2D, ratio: number = METER_TO_PIXELS_RATIO): NumberVector2D {
    return vector.scale(ratio);
}

export function vectorToMeters(vector: NumberVector2D, ratio: number = 1 / METER_TO_PIXELS_RATIO): NumberVector2D {
    return vector.scale(ratio);
}

export function numberArrayToPixels(vectorArray: [number, number], ratio: number = METER_TO_PIXELS_RATIO): [number, number] {
    return [vectorArray[0] * ratio, vectorArray[1] * ratio];
}

export function numberArrayToMeters(vectorArray: [number, number], ratio: number = 1 / METER_TO_PIXELS_RATIO): [number, number] {
    return [vectorArray[0] * ratio, vectorArray[1] * ratio];
}

export function pointToPixels(point: Point2D, ratio: number = METER_TO_PIXELS_RATIO): Point2D {
    return new Point2D([point.x * ratio, point.y * ratio]);
}

export function pointToMeters(point: Point2D, ratio: number = 1 / METER_TO_PIXELS_RATIO): Point2D {
    return new Point2D([point.x * ratio, point.y * ratio]);
}

export function numberToPixels(num: number, ratio: number = METER_TO_PIXELS_RATIO): number {
    return num * ratio;
}

export function numberToMeters(num: number, ratio: number = 1 / METER_TO_PIXELS_RATIO): number {
    return num * ratio;
}