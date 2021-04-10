import { Line2D } from "../../mathematics/line";
import { Point2D } from "../../mathematics/point";
import { NumberVector2D } from "../../mathematics/vector";
import { PhysicalLawType } from "../laws/abstract-physical-law";
import { AbstractPhysicalObject, PhysicalObjectType } from "./abstract-physical-object";

export interface ImmovableBallConfig {
    id: string;
    position: Point2D,
    radius: number,
    isLightSource?: boolean
}

export class ImmovableBall extends AbstractPhysicalObject {
    readonly type: PhysicalObjectType = PhysicalObjectType.ImmovableBall;

    private _isLightSource: boolean = false;

    constructor(config: ImmovableBallConfig) {
        super({
            id: config.id,
            isMoving: false,
            initialState: {
                clock: null,
                position: new NumberVector2D(config.position.value),
                velocity: new NumberVector2D([0, 0]),
                acceleration: new NumberVector2D([0, 0])
            },
            constants: {
                radius: config.radius
            },
            exemptedLaws: [
                PhysicalLawType.Gravity,
                PhysicalLawType.Rebound2D
            ]
        });

        this._isLightSource = !!config.isLightSource;
    }

    get isLightSource(): boolean {
        return this._isLightSource;
    }

    clone(): ImmovableBall {
        return new ImmovableBall({
            id: this.id,
            position: new Point2D(this.position.value),
            radius: this.radius,
            isLightSource: this.isLightSource
        });
    }
}