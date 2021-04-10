import { NumberVector2D } from "../../mathematics/vector";
import { AbstractPhysicalObject } from "../objects/abstract-physical-object";

import { AbstractPhysicalContext, AbstractPhysicalLaw, PhysicalLawType, PhysicalObjectFormulas } from "./abstract-physical-law";
import { EARTH_GRAVITY } from "./constants";

export class GravityLaw2D extends AbstractPhysicalLaw {
    constructor(private readonly g = -EARTH_GRAVITY) {
        super({
            type: PhysicalLawType.Gravity
        });
    }

    formulas(object: AbstractPhysicalObject, context: AbstractPhysicalContext): PhysicalObjectFormulas {
        const clock = object.clock;
        const g = this.g;
        const t = clock ? clock.time : 0;
        const x0 = object.initialState.position.x;
        const y0 = object.initialState.position.y;
        const v0x = object.initialState.velocity.x;
        const v0y = object.initialState.velocity.y;

        const vx = v0x;
        const vy = g*t + v0y;
        const x = v0x*t + x0;
        const y = (1 / 2) * g * t * t + v0y * t + y0;

        return {
            clock: () => object.clock || context?.clock,
            position: () => new NumberVector2D([x, y]),
            velocity: () => new NumberVector2D([vx, vy]),
            acceleration: () => new NumberVector2D([0, g])
        }
    }

}