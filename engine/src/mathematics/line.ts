import { Point2D } from "./point";
import { NumberVector2D } from "./vector";

export class Line2D {
    private _normal: NumberVector2D;

    constructor(private _point: Point2D, private _direction: NumberVector2D) {
        this._direction = this._direction.normalize();
        this._normal = this._direction.normal();
    }

    clone(): Line2D {
        return new Line2D(this._point.clone(), this._direction.clone());
    }

    get point(): Point2D {
        return this._point;
    }
    
    get direction(): NumberVector2D {
        return this._direction;
    }
    
    get normal(): NumberVector2D {
        return this._normal;
    }

    project(point: Point2D): Point2D {
        const perpandicularLine = new Line2D(point, this._normal);
        return this.intersect(perpandicularLine);
    }

    intersect(line: Line2D): Point2D {
        const a1 = this._direction.x;
        const b1 = this._direction.y;
        const a2 = line.direction.x;
        const b2 = line.direction.y;

        const cross = a1*b2 - a2*b1;
        if(cross === 0) {
            return null;
        }
        
        const x1 = this.point.x;
        const y1 = this.point.y;
        const x2 = line.point.x;
        const y2 = line.point.y;

        const xi = (a1 * b2 * x2 - a2 * b1 * x1 - a1 * a2 * (y2 - y1))/cross;
        const yi = (a1 * b2 * y1 - a2 * b1 * y2 + b1 * b2 * (x2 - x1))/cross;
        return new Point2D([xi, yi]);
    }
}