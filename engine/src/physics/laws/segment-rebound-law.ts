import { Line2D } from "../../mathematics/line";
import { Point2D } from "../../mathematics/point";
import { Segment2D } from "../../mathematics/segment";
import { AbstractRebound2D } from "./abstract-rebound-law";

export class SegmentRebound2D extends AbstractRebound2D {
    
    protected line: Line2D;

    constructor(private segment: Segment2D, elasticity?: [number, number]) {
        super(segment, elasticity);

        this.line = new Line2D(this.segment.points[0], this.segment.direction);
    }

    isInside(point: Point2D): boolean {
        return this.segment.isInside(point);
    }

    get support(): Segment2D {
        return this.segment;
    }
}