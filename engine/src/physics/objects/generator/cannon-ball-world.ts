import { SpaceTimeTwoDimensions } from "../../space-time/space-time";
import { Line2D } from '../../../mathematics/line';
import { Point2D } from '../../../mathematics/point';
import { NumberVector2D } from '../../../mathematics/vector';
import { GravityLaw2D } from '../../../physics/laws/gravity-law';
import { LineRebound2D } from '../../laws/line-rebound-law';
import { generateRandomCannonBall } from '../../../physics/objects/generator/random-ball';
import { TwoDimensionsSpace } from '../../../physics/space/two-dimensions-space';
import { ImmovableLine } from "../immovable-line";
import { LightLaw2D } from "../../laws/light-law";
import { RadialLightSource } from "../light-source";
import { ImmovableBall } from "../immovable-ball";
import { ImmovableSegment } from "../immovable-segment";
import { Segment2D } from "../../../mathematics/segment";
import { SegmentRebound2D } from "../../laws/segment-rebound-law";
import { WorldConfig } from "./world-config";
import { numberToMeters } from "../../units/conversion";

export interface CannonBallWorldConfig extends WorldConfig {
    gravity?: number;
    elasticity?: [number, number];
    moon?: {position: Point2D}
}

export function generateCannonBallWorld(config: CannonBallWorldConfig): SpaceTimeTwoDimensions {
    const elasticity: [number, number] = config.elasticity;
    const gravity: number = -config.gravity;
    
    const balls = new Array(config.numberOfPersons)
        .fill(null)
        .map((obj, i) => generateRandomCannonBall(String(i), numberToMeters(10)));

    const slope = new Line2D(
        new Point2D([config.width / (1.1 + 2.5*Math.random()), 0]),
        new NumberVector2D([1, Math.random()])
    );
    const slopeMeters = new Line2D(
        new Point2D([numberToMeters(slope.point.x), numberToMeters(slope.point.y)]),
        slope.direction
    );
    let moonLaw, moonObject = [];
    if(config.moon) {
        moonLaw = [new LightLaw2D([
            new RadialLightSource(config.moon.position)
        ])];
        moonObject = [new ImmovableBall({
            id: "moon",
            position: config.moon.position,
            radius: numberToMeters(5),
            isLightSource: true
        })];
    }

    const segment1 = new Segment2D(
        new Point2D([10, 6]),
        new Point2D([12, 6])
    );
    const segment2 = new Segment2D(
        new Point2D([7, 7]),
        new Point2D([7, 8])
    );
    const segment3 = new Segment2D(
        new Point2D([7, 9]),
        new Point2D([7, 10])
    );
    
    return new SpaceTimeTwoDimensions({
        space: new TwoDimensionsSpace([
            config.width,
            config.height
        ]),
        laws: [
            new GravityLaw2D(gravity),
            // Bottom
            new LineRebound2D(
                new Line2D(
                    new Point2D([0, 0]),
                    new NumberVector2D([1, 0])
                ),
                elasticity
            ),
            // Right
            new LineRebound2D(
                new Line2D(
                    new Point2D([numberToMeters(config.width), 0]),
                    new NumberVector2D([0, 1])
                ),
                elasticity
            ),
            // Left
            new LineRebound2D(
                new Line2D(
                    new Point2D([0, 0]),
                    new NumberVector2D([0, -1])
                ),
                elasticity
            ),
            // Top
            new LineRebound2D(
                new Line2D(
                    new Point2D([0, numberToMeters(config.height)]),
                    new NumberVector2D([-1, 0])
                ),
                elasticity
            ),
            // Slope
            new LineRebound2D(
                slopeMeters,
                elasticity
            ),
            new SegmentRebound2D(
                segment1,
                elasticity
            ),
            new SegmentRebound2D(
                segment2,
                elasticity
            ),
            new SegmentRebound2D(
                segment3,
                elasticity
            ),
            ...moonLaw
        ],
        objects: [
            ...balls,
            new ImmovableLine(slope, {
                id: "slope",
                constants: {
                    line: slope
                }
            }),
            new ImmovableSegment(segment1, {
                id: "slope",
                constants: {
                    segment: segment1
                }
            }),
            new ImmovableSegment(segment2, {
                id: "slope",
                constants: {
                    segment: segment2
                }
            }),
            new ImmovableSegment(segment3, {
                id: "slope",
                constants: {
                    segment: segment3
                }
            }),
            ...moonObject
        ],
    }); 
}