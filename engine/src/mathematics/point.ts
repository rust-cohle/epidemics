import { NumberVector2D } from "./vector";

export class Point2D {
    constructor(private coordinates: [number, number]) { }

    clone(): Point2D {
        return new Point2D([...this.coordinates]);
    }

    get x(): number {
        return this.coordinates[0];
    }
    
    get y(): number {
        return this.coordinates[1];
    }

    get value(): number[] {
        return [this.x, this.y];
    }

    translate(vector: NumberVector2D): Point2D {
        return new Point2D([this.x + vector.x, this.y + vector.y]);
    }

    center(otherPoint: Point2D): Point2D {
        return new Point2D([
            (this.x + otherPoint.x) / 2,
            (this.y + otherPoint.y) / 2
        ]);
    }

    distanceFrom(otherPoint: Point2D): number {
        return NumberVector2D.fromPoints(this, otherPoint).norm();
    }

    toString(): string {
        return `point (${this.x}, ${this.y})`;
    }
}