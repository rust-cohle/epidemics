import { NumberVector2D } from "./vector";

export function dotAngle(vector1: NumberVector2D, vector2: NumberVector2D) {
    const dotProduct = vector1.dot(vector2);
    const normProducts = vector1.norm() * vector2.norm();

    return Math.acos(dotProduct / normProducts);
}

export function crossAngle(vector1: NumberVector2D, vector2: NumberVector2D) {
    const crossProduct = vector1.cross(vector2);
    const normProducts = vector1.norm() * vector2.norm();

    return Math.asin(crossProduct / normProducts);
}

/**
 * Returns angle between vector1 and vector2, representing a counterclockwise rotation (trigonometric) from vector1 to vector2.
 *
 * @param vector1 
 * @param vector2 
 */
export function orientedAngleBetweenVectors(vector1: NumberVector2D, vector2: NumberVector2D): number {
    const cross = vector1.cross(vector2);

    // Angle in range [0, PI]
    const angleFromDot = dotAngle(vector1, vector2);

    // const sign = cross > 0 ? 1 : -1;
    let sign = Math.sign(cross);
    sign = sign || 1; 
    return sign * angleFromDot;
}