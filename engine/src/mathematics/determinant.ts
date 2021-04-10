import { Matrix } from "./matrix";
import { matrixLike } from "../format/tex";


export abstract class Determinant<T> {
    constructor(protected matrix: Matrix<T>) { }

    abstract getZero(): T;

    abstract iterationFormula(acc: T, firstLineCoeff: T, i: number): T;

    compute(): T {
        const [n, m] = this.matrix.getSize();
        if(n !== m) {
            throw new Error("Determinant can only be computed on a square matrix!");
        }

        if (n === 0) {
            return this.getZero() as T;
        }

        if (n === 1) {
            return this.matrix.getCoefficient(0, 0) as T;
        }

        const firstLine = [...(this.matrix.getLine(0) as T[])];
        return firstLine.reduce(this.iterationFormula.bind(this), this.getZero() as T);
    }

    toTex(): string {
        return `\\begin{vmatrix}
        ${matrixLike<T>(this.matrix.coefficients)}
        \\end{vmatrix}`;
    }
}

export class DeterminantNumber extends Determinant<number> {
    constructor(protected matrix: Matrix<number>) {
        super(matrix);
    }

    getZero(): number {
        return 0;
    }
    
    iterationFormula(acc: number, firstLineCoeff: number, i: number): number {
        const minorDeterminant = new DeterminantNumber(this.matrix.getMinorSubmatrix(0, i));
        return acc + Math.pow(-1, i) * firstLineCoeff * minorDeterminant.compute();
    }
}
