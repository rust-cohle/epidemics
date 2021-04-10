import { NumberVector2D } from "../../mathematics/vector";
import { AbstractPhysicalObject } from "../objects/abstract-physical-object";
import { PhysicalObjectFormulas } from "./abstract-physical-law";

export function identity(object: AbstractPhysicalObject): PhysicalObjectFormulas {
    return {
        clock: () => object.clock,
        position: () => object.position,
        velocity: () => object.velocity,
        acceleration: () => object.acceleration
    };
}