import { Line2D } from "../../mathematics/line";
import { AbstractRebound2D } from "./abstract-rebound-law";

export class LineRebound2D extends AbstractRebound2D {
    constructor(line: Line2D, elasticity?: [number, number]) {
        super(line, elasticity);
    }

    get support(): Line2D {
        return this._support;
    }

    isInside(): boolean {
        return true;
    }
}