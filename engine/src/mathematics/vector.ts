import { NumberMatrix } from "./matrix";
import { Point2D } from "./point";
import { get2DRotationMatrix } from "./transformations";

export class NumberVector2D {
    private vector: NumberMatrix;

    constructor(coefficients: number[]) {
        const matrix = new NumberMatrix([coefficients]).transpose();
        this.vector = matrix;
    }

    static fromPoints(point1: Point2D, point2: Point2D): NumberVector2D {
        return new NumberVector2D([point2.x - point1.x, point2.y - point1.y]);
    }

    static fromPoint(point: Point2D): NumberVector2D {
        return new NumberVector2D([point.x, point.y]);
    }

    clone(): NumberVector2D {
        return new NumberVector2D(this.value);
    }

    get value(): [number, number] {
        return this.vector.getColumn(0) as [number, number];
    }

    get x(): number {
        return this.value[0];
    }

    get y(): number {
        return this.value[1];
    }

    set value(coefficients: [number, number]) {
        this.vector = new NumberMatrix([coefficients]).transpose();
    }

    scale(factor: number): NumberVector2D {
        return new NumberVector2D([this.x * factor, this.y * factor]);
    }

    scaleX(factor: number): NumberVector2D {
        return new NumberVector2D([this.x * factor, this.y]);
    }

    scaleY(factor: number): NumberVector2D {
        return new NumberVector2D([this.x, this.y * factor]);
    }

    resize(norm: number): NumberVector2D {
        return this.scale(norm / this.norm());
    }

    opposite(): NumberVector2D {
        return this.scale(-1);
    }

    add(otherVector: NumberVector2D): NumberVector2D {
        return new NumberVector2D(
            (this.asMatrix().add(otherVector.asMatrix()) as NumberMatrix).getColumn(0)
        );
    }

    subtract(otherVector: NumberVector2D): NumberVector2D {
        return this.add(otherVector.opposite());
    }

    norm(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    normal(): NumberVector2D {
        return new NumberVector2D([this.y, -this.x]);
    }

    normalize(): NumberVector2D {
        return this.scale(1/this.norm());
    }

    dot(otherVector: NumberVector2D): number {
        return this.x * otherVector.x + this.y * otherVector.y;
    }

    cross(otherVector: NumberVector2D): number {
        return this.x * otherVector.y - this.y * otherVector.x;
    }

    rotate(angle: number, precision?: number): NumberVector2D {
        const rotationMatrix = get2DRotationMatrix(angle);
        const rotatedVector = rotationMatrix.multiply(this.asMatrix());

        let coeffs = (rotatedVector as NumberMatrix).getColumn(0) as number[];
        if (typeof precision === "number") {
            coeffs = coeffs.map(value => parseFloat(value.toFixed(precision)));
        }

        return new NumberVector2D(coeffs);
    }

    isNull(): boolean {
        return this.x === 0 && this.y === 0;
    }

    asPoint(): Point2D {
        return new Point2D(this.value);
    }

    asMatrix(): NumberMatrix {
        return this.vector;
    }

    toTex(): string {
        return this.vector.toTex();
    }

    toString(): string {
        if(!this.value) return ""; 
        return `vect (${this.x}, ${this.y})`;
    }
}