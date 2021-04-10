import { NumberVector2D } from "../../mathematics/vector";
import { AbstractPhysicalObject } from "../objects/abstract-physical-object";
import { Clock } from "../time/clock";

export enum PhysicalLawType {
    Gravity,
    Light,
    Collision1D,
    Rebound2D,
    Epidemics
}

export interface AbstractPhysicalLawConfig {
    type: PhysicalLawType;
}

export interface PhysicalObjectFormulas {
    clock: () => Clock,
    position: () => NumberVector2D,
    velocity: () => NumberVector2D,
    acceleration: () => NumberVector2D
}

export interface EpidemicsPhysicalContext {
    clock: Clock;
    iterations: number;
    stats?: {
        dead?: number;
        infected?: number;
        contagious?: number;
        immunized?: number;
        normal?: number;
    }
}

export interface AbstractPhysicalContext {
    clock?: Clock,
    interactingObjects?: AbstractPhysicalObject[],
    epidemics?: EpidemicsPhysicalContext
}

export abstract class AbstractPhysicalLaw {
    private _type: PhysicalLawType;

    constructor(private config: AbstractPhysicalLawConfig) {
        this._type = config.type;
    }

    get type(): PhysicalLawType {
        return this._type;
    }

    /**
     * Apply a physical law on an object, by modifying it's position, velocity and acceleration.
     *
     * @param clock The time at which the object state should be updated.
     * @param object The object on which the physical law should be applied.
     */
    apply(object: AbstractPhysicalObject, context?: AbstractPhysicalContext): void {
        const formulas = this.formulas(object, context);
        object.clock = formulas.clock();
        object.position = formulas.position();
        object.velocity = formulas.velocity();
        object.acceleration = formulas.acceleration();
    };
    
    // To override.
    abstract formulas(object: AbstractPhysicalObject, context: AbstractPhysicalContext): PhysicalObjectFormulas;
}
