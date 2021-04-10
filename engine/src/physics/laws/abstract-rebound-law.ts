import { orientedDistanceFromLine } from "../../mathematics/distance";
import { Line2D } from "../../mathematics/line";
import { Point2D } from "../../mathematics/point";
import { Segment2D } from "../../mathematics/segment";
import { orientedAngleBetweenVectors } from "../../mathematics/trigonometrics";
import { NumberVector2D } from "../../mathematics/vector";
import { AbstractPhysicalObject, PhysicalObjectState } from "../objects/abstract-physical-object";
import { Clock } from "../time/clock";
import { AbstractPhysicalContext, AbstractPhysicalLaw, PhysicalLawType, PhysicalObjectFormulas } from "./abstract-physical-law";
import { identity } from "./utils";

export abstract class AbstractRebound2D extends AbstractPhysicalLaw {
    private _line: Line2D | Segment2D;

    constructor(protected _support: Line2D | Segment2D, private _elasticity?: [number, number]) {
        super({ 
            type: PhysicalLawType.Rebound2D
        });

        if (!_elasticity) {
            this._elasticity = [1, 1];
        }

        const unknownSupport = _support as unknown;
        if (unknownSupport instanceof Line2D) {
            this._line = unknownSupport as Line2D;
        } else if (unknownSupport instanceof Segment2D) {
            const segment = unknownSupport as Segment2D;
            this._line = new Line2D(segment.points[0], segment.direction);
        }
    }

    abstract isInside(point: Point2D): boolean;

    abstract get support(): Line2D | Segment2D;

    get elasticity(): [number, number] {
        return this._elasticity;
    }

    formulas(object: AbstractPhysicalObject, context?: AbstractPhysicalContext): PhysicalObjectFormulas {
        object.stateBeforeRebound = object.state;

        const objectPoint = new Point2D(object.position.value);
        const previousObjectPoint = new Point2D(object.previousState.position.value);

        let orientedDistanceToLine: number = orientedDistanceFromLine(objectPoint, this._line);
        const previousOrientedDistanceToLine: number = orientedDistanceFromLine(previousObjectPoint, this._line);

        const isColliding: boolean = Math.abs(orientedDistanceToLine) <= object.radius;
        const isThrough = orientedDistanceToLine * previousOrientedDistanceToLine < 0;

        // Compute point's projection on the line, minding the object radius
        let currentPosition = new Point2D(object.position.value);
        let projection = this._line.project(currentPosition);
        
        // Check if point is inside the segment, which determines whether there is a collision.
        const isInside = this.isInside(projection);
        if (((isColliding || isThrough) && !isInside) || (!isColliding && !isThrough)) {
            return identity(object);
        }
        
        // Compute point's projection on the line, minding the object radius
        if (isThrough) {
            object.state = object.previousState;
            const previousObjectBeforeReboundPoint = new Point2D(object.previousStateBeforeRebound.position.value);
            orientedDistanceToLine = orientedDistanceFromLine(previousObjectBeforeReboundPoint, this._line);
            currentPosition = new Point2D(object.position.value);
            projection = this._line.project(currentPosition);
        }

        let translationSign = orientedDistanceToLine <= 0 ? 1 : -1;
        const newPosition =
            new NumberVector2D(
                projection
                    .translate(this._line.normal.scale(translationSign * (object.radius)))
                    .value
            );

        let newVelocity = new NumberVector2D([0, 0]);
        if (!object.velocity.isNull()) {
            const incidenceAngle = orientedAngleBetweenVectors(object.velocity, this._line.direction);
            newVelocity = object.velocity
            .rotate(2 * incidenceAngle)
            .scaleX(this._elasticity[0])
            .scaleY(this._elasticity[1]);
        }

        object.initialState = {
            ...object.state,
            position: newPosition,
            velocity: newVelocity
        }

        return {
            clock: () => context?.clock.cloneFresh(),
            position: () => newPosition,
            velocity: () => newVelocity,
            acceleration: () => object.acceleration
        }
    }

    printState(state: PhysicalObjectState, projection: Point2D): void {
        const dist = orientedDistanceFromLine(state.position.asPoint(), this._line);
        const translationSign = dist <= 0 ? 1 : -1;
        const nextPos = new NumberVector2D(
            projection
                .translate(this._line.normal.scale(translationSign * (0.2)))
                .value
        );
        const incidenceAngle = orientedAngleBetweenVectors(state.velocity, this._line.direction);
        const rotation = state.velocity
            .rotate(2 * incidenceAngle)
            .scaleX(this._elasticity[0])
            .scaleY(this._elasticity[1]);
        console.log("----");
        console.log(`pos: ${state.position.value } `);
        console.log(`vel: ${state.velocity.value } `);
        console.log(`pos dist to line: ${dist}`);
        console.log(`pos projection: ${projection.value } `);
        console.log(`new vel: ${rotation.value } `);
        console.log(`projection translation: ${nextPos} `);
        console.log(`incidence angle: ${incidenceAngle} `);
    }
}