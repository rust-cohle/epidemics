import { VectorField2D } from "../../mathematics/vector-field";
import { AbstractPhysicalObject, PhysicalObjectConstants, PhysicalObjectState, PhysicalObjectType } from "./abstract-physical-object";
import { ILightSource } from "./light-source";

export class Ball extends AbstractPhysicalObject implements ILightSource {
    readonly type: PhysicalObjectType = PhysicalObjectType.Ball;

    private _lightField: VectorField2D = null;
    
    constructor(_id: string,
        _constants: PhysicalObjectConstants,
        _initialState: PhysicalObjectState) {
        super({
            id: _id,
            initialState: _initialState,
            constants: _constants,
            isMoving: true,
        });

        if(this.initialState.lightField) {
            this._lightField = this.initialState.lightField;
        }
    }

    get lightField(): VectorField2D {
        return this._lightField;
    }
    

    clone(): Ball {
        return new Ball(this.id, this.constants, this.initialState);
    }
}