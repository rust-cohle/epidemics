import { AbstractPhysicalLaw as AbstractPhysicalLaw } from "../laws/abstract-physical-law";
import { AbstractPhysicalObject, PersonEpidemicsState, PhysicalObjectState, PhysicalObjectType } from "../objects/abstract-physical-object";
import { TwoDimensionsSpace } from "../space/two-dimensions-space";
import { Clock } from "../time/clock";
import { Space } from "../space/space";
import { ImmovableBall } from "../objects/immovable-ball";
import { ImmovableLine } from "../objects/immovable-line";
import { ImmovableSegment } from "../objects/immovable-segment";
import { ISnapshotObject } from "../objects/snapshot-object";
import { Person } from "../objects";

export interface ISpaceTime {
    clock: Clock,
    space: Space,
    objects: AbstractPhysicalObject[],
    laws: AbstractPhysicalLaw[],
}

export interface ISpaceTimeSnapshot {
    objects: ISnapshotObject[];
}

export type IPersonStateCount = { [IPersonState in PersonEpidemicsState]: number };

export interface IEpidemicsSnapshot  {
    counts: IPersonStateCount
}

export interface ISpaceTimeRecord {
    metadata: {
        fps: number,
        fpms: number,
        duration: number,
        unitInMs: number
    },
    snapshots: ISpaceTimeSnapshot[],
    clock?: Clock
}

export interface ISpaceTimeEpidemicsRecord extends ISpaceTimeRecord {
    epidemics: IEpidemicsSnapshot[]
}

export interface SpaceTimeTwoDimensionsConfig {
    space: TwoDimensionsSpace,
    objects: AbstractPhysicalObject[],
    laws: AbstractPhysicalLaw[],
    timeUnit?: number;
}

export class SpaceTimeTwoDimensions implements ISpaceTime {
    private _clock: Clock;
    private _space: TwoDimensionsSpace;
    private _objects: AbstractPhysicalObject[];
    private _laws: AbstractPhysicalLaw[];
    private _isRunning: boolean = false;
    private _epidemicsSnapshot: IEpidemicsSnapshot;

    constructor(private _config: SpaceTimeTwoDimensionsConfig) {
        this._space = this._config.space;
        this._objects = this._config.objects.map(obj => obj.clone());
        this._laws = this._config.laws;
        this._epidemicsSnapshot = {
            counts: {
                "N": 0,
                "D": 0,
                "Im": 0,
                "C": 0,
                "In": 0,
            }
        };
    }

    get clock(): Clock {
        return this._clock;
    }
    
    get time(): number {
        return this.clock.time;
    }

    get space(): TwoDimensionsSpace {
        return this._space;
    }

    get objects(): AbstractPhysicalObject[] {
        return this._objects;
    }
    
    get objectStates(): PhysicalObjectState[] {
        return this._objects.map(obj => obj.state);
    }

    get laws(): AbstractPhysicalLaw[] {
        return this._laws;
    }

    get snapshot(): ISpaceTimeSnapshot {
        return {
            objects: this.objects.map(object => ({
                id: object.id,
                type: object.type,
                radius: object.radius,
                position: object.position?.value,
                enlightedPoints: object.enlightedPoints && object.enlightedPoints.length ? object.enlightedPoints.map(enlightedPoint => ({
                    point: enlightedPoint.point.value as [number, number],
                    intensity: enlightedPoint.intensity,
                    lightDirection: enlightedPoint.lightDirection.value
                })) : undefined,
                epidemics: (object as Person).epidemicsState ? {
                    state: (object as Person).epidemicsState
                } : undefined,
                line: (object as ImmovableLine).line, // TODO: find better way to classify objects with/without radius
                bounds: (object as ImmovableSegment).bounds, // TODO: find better way to classify objects with/without radius
                isLightSource: (object as ImmovableBall).isLightSource,
            }))
        };
    }

    updateEpidemicsSnapshot(): void {
        const counts: IPersonStateCount = this.objects.reduce((acc, object) => {
            if (object.type !== PhysicalObjectType.Person) {
                return acc;
            }

            const person = object as Person;
            const personState = person.epidemicsState;
            const personPreviousState = person.previousEpidemicsState;

            switch (personPreviousState + personState) {
                case PersonEpidemicsState.Normal + PersonEpidemicsState.Normal:
                    // No change in state
                    break;
                case PersonEpidemicsState.Normal + PersonEpidemicsState.Contagious:  
                    acc.N -= 1;
                    acc.C += 1;
                    break;
                // case PersonEpidemicsState.Infected:
                //     break;
                // case PersonEpidemicsState.Contagious:
                //     break;
                // case PersonEpidemicsState.Dead:
                //     break;
                // case PersonEpidemicsState.Immunized:
                //     break;
                default:
                    // Not supported yet
                    break;
            }

            return acc;
        }, {...this._epidemicsSnapshot.counts});

        this._epidemicsSnapshot = { counts };
    }

    get epidemicsSnapshot(): IEpidemicsSnapshot {
        return this._epidemicsSnapshot;
    }

    set epidemicsSnapshot(epidemicsSnapshot: IEpidemicsSnapshot) {
        this._epidemicsSnapshot = epidemicsSnapshot;
    }

    start(timestamp: number): void {
        this._clock = new Clock(timestamp, this._config.timeUnit);
        this._objects = this._config.objects.map(obj => obj.clone());
    }

    resume(now: number): void {
        this.clock.resume(now);
        this._objects
            .filter(obj => !!obj.clock)
            .forEach(obj => obj.clock.resume(now));
    }

    /**
     * Increment the space time by one unit of time, applying the physical laws on inner objects.
     *
     * @param timestamp Current timestamp that can be processed by the world clock
     * @returns Whether at least one object is still moving (so the rendering must go on)
     */
    tick(timestamp: number): boolean {
        // Update time on the world's clock and each object that has its own clock
        this._clock.update(timestamp);
        this.objects
            .filter(obj => !!obj.clock)
            .forEach(obj => obj.clock.update(timestamp));

        // Apply physical laws to move the objects to this new time
        this._objects.forEach(obj => {
            const objectLaws = this._laws.filter(law => obj.exemptedLaws.indexOf(law.type) === -1);
            obj.applyLaws(objectLaws, {
                clock: this._clock,
                epidemics: {
                    clock: new Clock(0, 1),
                    iterations: 0,
                    stats: {}
                },
                interactingObjects: this._objects.filter((obj) => obj),
            })
        });

        return this._objects.some(object => object.isMoving);
    }
}