import { INVERSE_SQUARE } from "./functions";
import { Point2D } from "./point";
import { NumberVector2D } from "./vector";

export class VectorField2D {
    constructor(private compute: (x: number, y: number) => NumberVector2D) {}

    getAt(point: Point2D): NumberVector2D {
        return this.compute(point.value[0], point.value[1]);
    }
}

export class RadialField extends VectorField2D {
    constructor(private center: Point2D, intensity: (distance: number) => number = INVERSE_SQUARE) {
        super(
            (x, y) => {
                const point = new Point2D([x, y]);
                return NumberVector2D.fromPoints(this.center, point)
                    .scale(intensity(this.center.distanceFrom(point)))
            }
        );
    }
}

export class ConstantField extends VectorField2D {
    constructor(private direction: NumberVector2D) {
        super(() => direction);
    }
}