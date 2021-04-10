import { getRandomNumber } from "../../../mathematics/random";
import { NumberVector2D } from "../../../mathematics/vector";
import { EARTH_GRAVITY } from "../../laws/constants";
import { Ball } from "../ball";

export function generateRandomCannonBall(id: string, radius = 0.05): Ball {
    return new Ball(id, {
        mass: 1,
        radius: radius
    }, {
        clock: null,
        position: new NumberVector2D([2, 2]),
        // velocity: new NumberVector2D([4, 8]),
        velocity: new NumberVector2D([getRandomNumber(3, 8), getRandomNumber(10, 15)]),
        acceleration: new NumberVector2D([0, -EARTH_GRAVITY]),
    });
}