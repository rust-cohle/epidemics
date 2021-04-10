import { PhysicalObjectType } from "./abstract-physical-object";

export const IMMOVABLE_OBJECTS = [
    PhysicalObjectType.ImmovableLine,
    PhysicalObjectType.ImmovableSegment,
    PhysicalObjectType.ImmovableBall
]

export function isImmovable(objectType: PhysicalObjectType): boolean {
    return IMMOVABLE_OBJECTS.includes(objectType);
}