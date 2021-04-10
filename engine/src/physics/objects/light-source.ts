import { Point2D } from "../../mathematics/point";
import { RadialField, VectorField2D } from "../../mathematics/vector-field";

export interface ILightSource {
    lightField: VectorField2D;
}

export class StaticLightSource implements ILightSource {
    constructor(public lightField: VectorField2D) { }
}

export class RadialLightSource extends StaticLightSource implements ILightSource {
    constructor(private center: Point2D) {
        super(new RadialField(center));
    }
}