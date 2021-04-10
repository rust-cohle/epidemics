import { Line2D } from "./line";
import { Point2D } from "./point";
import { NumberVector2D } from "./vector";

export class Segment2D extends Line2D {
    private _segmentVector: NumberVector2D;

    constructor(private bound1: Point2D, private bound2: Point2D) {
        super(bound1, new NumberVector2D(NumberVector2D.fromPoints(bound1, bound2).value));
    
        this._segmentVector = NumberVector2D.fromPoints(bound1, bound2);
    }

    clone(): Segment2D {
        return new Segment2D(this.bound1, this.bound2);
    }

    get length(): number {
        return this._segmentVector.norm();
    }

    get points(): [Point2D, Point2D] {
        return [this.bound1, this.bound2];
    }

    /***
     * Tests if a point is inside a segment.
     * 
     * A point is inside a segment if on only if:
     * - The point is aligned with the segment bounds
     * - The vector v1, v2, taken from the point to bound1 and bound2 are in opposite
     * direction (dot product negative or zero, since the bounds are included in the segment)
     * 
     * Point inside:
     * ---x---->p<------x---
     * 
     * Point outside:
     * ---x<----x<------p---
     * 
     * @param point The point to test
     * @return True iff the point provided is inside the segment
     * 
     */
    isInside(point: Point2D): boolean {
        const v1 = NumberVector2D.fromPoints(point, this.bound1);
        const v2 = NumberVector2D.fromPoints(point, this.bound2);

        // The 3 points are not aligned!
        if (v1.cross(v2) !== 0) {
            return false;
        }

        return v1.dot(v2) <= 0;
    }
}