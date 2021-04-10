import { Point2D } from "../../mathematics/point";
import { Segment2D } from "../../mathematics/segment";
import { PhysicalLawType } from "../laws/abstract-physical-law";
import { AbstractPhysicalObject, PhysicalObjectConstants, PhysicalObjectState, PhysicalObjectType } from "./abstract-physical-object";

export interface ImmovableSegmentConstants extends PhysicalObjectConstants {
    segment: Segment2D;
}

export interface ImmovableSegmentConfig {
    id: string;
    constants: ImmovableSegmentConstants;
    initialState?: PhysicalObjectState;
}

export class ImmovableSegment extends AbstractPhysicalObject {
    readonly type: PhysicalObjectType = PhysicalObjectType.ImmovableSegment;

    constructor(private _segment: Segment2D, config: ImmovableSegmentConfig) {
        super({
            id: config.id,
            initialState: config.initialState,
            constants: config.constants,
            isMoving: false,
            exemptedLaws: [
                PhysicalLawType.Gravity,
                PhysicalLawType.Rebound2D
            ]
        });
    }

    get bounds(): [Point2D, Point2D] {
        return this._segment.points;
    }

    clone(): ImmovableSegment {
        return new ImmovableSegment(this._segment.clone(), {
            id: this.id,
            constants: this.constants as ImmovableSegmentConstants,
            initialState: this.initialState
        });
    }
}