import { sum } from "./sums";
import { matrixLike } from "../format/tex";

export abstract class Matrix<T> {
    protected _coefficients: T[][];

    constructor(_coefficients: T[][]) {
        if (!this._validateCoefficients(_coefficients)) {
            throw new Error("Invalid matrix.");
        }

        this._coefficients = [..._coefficients.map((line) => [...line])];
    }

    get coefficients(): T[][] {
        return this._coefficients;
    }

    get n(): number {
        return this.getSize()[0];
    }
    
    get m(): number {
        return this.getSize()[1];
    }

    abstract create(coeffs: T[][]): Matrix<T>;

    abstract multiply(other: Matrix<T>): Matrix<T> | null;

    getSize(): [number, number] {
        if(!this._coefficients.length) {
            return [0, 0];
        }

        return [this._coefficients.length, this._coefficients[0].length];
    }

    getLine(i: number): T[] | null {
        try {
            return this._coefficients[i];
        } catch (err) {
            console.error("Could not retrieve matrix line.", err);
        }

        return null;
    }

    getColumn(j: number): T[] | null {
        try {
            return this._coefficients.map((line) => line[j]);
        } catch (err) {
            console.error("Could not retrieve matrix column.", err);
        }

        return null;
    }

    setColumn(j: number, column: T[]): void {
        if(column.length !== this.m) {
            console.error(`Column length (${column.length}) does not match matrix size (${this.m})`);
            return;
        }
        
        this._coefficients.forEach((line) => line[j] = column[j]);
    }

    getCoefficient(i: number, j: number): T | null {
        try {
            return this._coefficients[i][j];
        } catch (err) {
            console.error("Could not retrieve matrix coefficient.", err);
        }

        return null;
    }

    getClonedCoefficients(): T[][] {
        return [...this._coefficients.map(line => [...line])];
    }

    removeLine(i: number): Matrix<T> {
        if(i < 0 || i >= this.n) {
            return this;
        }

        const coeffs = this.getClonedCoefficients();
        coeffs.splice(i, 1);

        return this.create(coeffs);
    }
    
    removeColumn(j: number): Matrix<T> {
        if(j < 0 || j >= this.m) {
            return this;
        }

        const coeffs = this.getClonedCoefficients();
        coeffs.forEach(line => line.splice(j, 1));

        return this.create(coeffs);
    }

    getMinorSubmatrix(i: number, j: number): Matrix<T> {
        return this.removeLine(i).removeColumn(j);
    }

    transpose(): Matrix<T> {
        let newCoeffs: T[][] = [];
        for(let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.m; j++) {
                if(!newCoeffs[j]) {
                    newCoeffs[j] = [] as T[];
                }

                newCoeffs[j][i] = this.getCoefficient(i, j) as T;
            }
        }

        return this.create(newCoeffs);
    }

    toTex(): string {
        return `\\begin{pmatrix}
        ${matrixLike<T>(this._coefficients)}
        \\end{pmatrix}`;
    }

    _validateCoefficients(_coefficients: T[][]): boolean {
        return _coefficients && _coefficients.every(line => line.length === _coefficients[0].length)
    }
}

export class NumberMatrix extends Matrix<number> {
    constructor(_coefficients: number[][]) {
        super(_coefficients);
    }

    create(coeffs: number[][]): Matrix<number> {
        return new NumberMatrix(coeffs) as Matrix<number>;
    }
    
    clone(): Matrix<number> {
        return this.create(this._coefficients);
    }

    transpose(): NumberMatrix {
        return super.transpose() as NumberMatrix;
    }

    multiply(other: Matrix<number>): Matrix<number> | null {
        if (this.m !== other.n) {
            console.error(`Incompatible dimensions: ${this.getSize}x${other.getSize}`);
            return null;
        }

        const resultCoefficients = new Array(this.n)
            .fill(0)
            .map(() => new Array(other.m).fill(0));

        for (let i = 0; i < this.n; i++) {
            for (let k = 0; k < other.m; k++) {
                const toSum = this._coefficients[i].map((value, j) => {
                    return value * (other.getColumn(k) as number[])[j];
                });
                resultCoefficients[i][k] = sum(toSum);
            }
        }

        return new NumberMatrix(resultCoefficients) as Matrix<number>;
    }

    scale(factor: number): Matrix<number> | null {
        if(!this._coefficients) {
            return null;
        }

        const resultCoefficients = new Array(this.n)
            .fill(0)
            .map(() => new Array(this.m).fill(0));
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.m; j++) {
                resultCoefficients[i][j] = this._coefficients[i][j] * factor;
            }
        }

        return new NumberMatrix(resultCoefficients) as Matrix<number>;
    }
    

    add(other: Matrix<number>): Matrix<number> | null {
        if (this.n !== other.n || this.m !== other.m) {
            console.warn(`Adding matrix of different sizes is not yet supported!`);
            console.error(`Incompatible dimensions: ${this.getSize}x${other.getSize}`);
            return null;
        }

        const resultCoefficients = new Array(this.n)
            .fill(0)
            .map(() => new Array(other.m).fill(0));

        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < other.m; j++) {
                resultCoefficients[i][j] = (this.getCoefficient(i, j) as number) + (other.getCoefficient(i, j) as number);
            }
        }

        return this.create(resultCoefficients);
    }
}

export class TexMatrix extends Matrix<string | number> {
    constructor(_coefficients: (string | number)[][]) {
        super(_coefficients);
    }

    create(coeffs: number[][]): Matrix<string | number> {
        return new NumberMatrix(coeffs) as Matrix<number>;
    }

    multiply(other: Matrix<number>): Matrix<number> | null {
        if (this.m !== other.n) {
            console.error(`Incompatible dimensions: ${this.getSize}x${other.getSize}`);
            return null;
        }

        const resultCoefficients = new Array(this.n)
            .fill(0)
            .map(() => new Array(other.m).fill(0));

        for (let i = 0; i < this.n; i++) {
            for (let k = 0; k < other.m; k++) {
                const toSum = this._coefficients[i].map((value, j) => {
                    return `${value}\\times ${(other.getColumn(k) as number[])[j]}`;
                });
                resultCoefficients[i][k] = this.sum(toSum);
            }
        }

        return new NumberMatrix(resultCoefficients) as Matrix<number>;
    }

    private sum(toSum: (string | number)[]): string {
        return toSum.join(" + ");
    }
}