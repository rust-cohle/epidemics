import { getRandomNumber } from "../../../mathematics/random";
import { NumberVector2D } from "../../../mathematics/vector";
import { numberToMeters, numberToPixels } from "../../units/conversion";
import { PersonEpidemicsState } from "../abstract-physical-object";
import { Person } from "../person";

interface PersonConfig {
    id: string;
    radius?: number,
    worldSize: {
        width: number,
        height: number
    }
}

export function generateRandomPerson(config: PersonConfig): Person {
    config.radius = config.radius || 0.05;
    
    const randomPositionPx = new NumberVector2D([
        getRandomNumber(0, config.worldSize.width),
        getRandomNumber(0, config.worldSize.height)
    ]);

    const randomPosition = new NumberVector2D(randomPositionPx.value.map(n => numberToMeters(n)));
    const randomAngle = 2 * Math.random() * Math.PI;
    const randomVelocity = new NumberVector2D([1, 1]).rotate(randomAngle);

    const contagious = Math.random() < 0.1;

    return new Person({
        id: config.id,
        constants: {
            radius: config.radius
        },
        initialState: {
            clock: null,
            position: randomPosition,
            velocity: randomVelocity,
            acceleration: new NumberVector2D([0, 0]),
            epidemics: {
                epidemicsState: contagious ? PersonEpidemicsState.Contagious : PersonEpidemicsState.Normal,
                previousEpidemicsState: PersonEpidemicsState.Normal,
                timeSinceStateChange: 0
            }
        }
    });
}