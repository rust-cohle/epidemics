import { Line2D } from "../../mathematics/line";
import { PhysicalLawType } from "../laws/abstract-physical-law";
import { AbstractPhysicalObject, PhysicalObjectConstants, PhysicalObjectState, PhysicalObjectType } from "./abstract-physical-object";

export interface ImmovableLineConstants extends PhysicalObjectConstants {
    line: Line2D;
}

export interface ImmovableLineConfig {
    id: string;
    constants: ImmovableLineConstants;
    initialState?: PhysicalObjectState;
}

export class ImmovableLine extends AbstractPhysicalObject {
    readonly type: PhysicalObjectType = PhysicalObjectType.ImmovableLine;

    constructor(private _line: Line2D, config: ImmovableLineConfig) {
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

    get line(): Line2D {
        return this._line;
    }

    clone(): ImmovableLine {
        return new ImmovableLine(this._line.clone(), {
            id: this.id,
            constants: this.constants as ImmovableLineConstants,
            initialState: this.initialState
        });
    }
}