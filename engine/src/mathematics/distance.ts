import { Line2D } from "./line";
import { Point2D } from "./point";
import { NumberVector2D } from "./vector";

export function distanceFromLine(point: Point2D, line: Line2D) {
    return Math.abs(orientedDistanceFromLine(point, line));
}

export function orientedDistanceFromLine(point: Point2D, line: Line2D) {
    return NumberVector2D.fromPoints(point, line.point).dot(line.normal);
}