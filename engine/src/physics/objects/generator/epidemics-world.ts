import { Line2D } from '../../../mathematics/line';
import { Point2D } from '../../../mathematics/point';
import { NumberVector2D } from '../../../mathematics/vector';
import { EpidemicsLaw } from '../../laws/epidemics-law';
import { GravityLaw2D } from '../../laws/gravity-law';
import { LineRebound2D } from '../../laws/line-rebound-law';
import { ISpaceTimeEpidemicsSnapshot, SpaceTimeTwoDimensions } from "../../space-time/space-time";
import { TwoDimensionsSpace } from '../../space/two-dimensions-space';
import { numberToMeters } from '../../units/conversion';
import { PersonEpidemicsState } from '../abstract-physical-object';
import { generateRandomPerson } from './random-person';
import { WorldConfig } from './world-config';

export interface EpidemicsWorldConfig extends WorldConfig {
    width: number;
    height: number;
    numberOfPersons: number;
}

export function generateEpidemicsWorld(config: EpidemicsWorldConfig): SpaceTimeTwoDimensions {    
    // for(let i = 0; i < 1000; i++) {
    //     const randomAngle = 2 * Math.random() * Math.PI;
    //     const randomVelocity = new NumberVector2D([1, 1]).rotate(randomAngle);
    //     console.log(`theta=${randomAngle}; rotated=${randomVelocity.x.toFixed(2)}, ${randomVelocity.y.toFixed(2)}; norm=${randomVelocity.norm().toFixed(2)}`);
    // }
    
    const initialEpidemicsSnapshot: ISpaceTimeEpidemicsSnapshot = {
        counts: {
            current: {
                "N": 0,
                "D": 0,
                "Im": 0,
                "C": 0,
                "In": 0,
            },
            accumulated: {
                "N": 0,
                "D": 0,
                "Im": 0,
                "C": 0,
                "In": 0,
            }
        }
    };

    const persons = new Array(config.numberOfPersons)
        .fill(null)
        .map((obj, i) => {
            const person = generateRandomPerson({
                id: String(i),
                worldSize: {
                    width: config.width,
                    height: config.height,
                }
            });

            if(person.epidemicsState === PersonEpidemicsState.Normal) {
                initialEpidemicsSnapshot.counts.current.N += 1;
                initialEpidemicsSnapshot.counts.accumulated.N += 1;
            } else if (person.epidemicsState === PersonEpidemicsState.Contagious) {
                initialEpidemicsSnapshot.counts.current.C += 1;
                initialEpidemicsSnapshot.counts.accumulated.C += 1;
            }

            return person; 
        });

    const world = new SpaceTimeTwoDimensions({
        space: new TwoDimensionsSpace([
            config.width,
            config.height
        ]),
        laws: [
            new GravityLaw2D(0),
            // Bottom
            new LineRebound2D(
                new Line2D(
                    new Point2D([0, 0]),
                    new NumberVector2D([1, 0])
                )
            ),
            // Right
            new LineRebound2D(
                new Line2D(
                    new Point2D([numberToMeters(config.width), 0]),
                    new NumberVector2D([0, 1])
                )
            ),
            // Left
            new LineRebound2D(
                new Line2D(
                    new Point2D([0, 0]),
                    new NumberVector2D([0, -1])
                )
            ),
            // Top
            new LineRebound2D(
                new Line2D(
                    new Point2D([0, numberToMeters(config.height)]),
                    new NumberVector2D([-1, 0])
                )
            ),
            new EpidemicsLaw()
        ],
        objects: [
            ...persons
        ],
    });

    world.initialEpidemicsSnapshot = initialEpidemicsSnapshot;

    return world;
}