import { Point2D } from "../../mathematics/point";
import { NumberVector2D } from "../../mathematics/vector";
import { VectorField2D } from "../../mathematics/vector-field";
import { AbstractPhysicalContext, AbstractPhysicalLaw, PhysicalLawType } from "../laws/abstract-physical-law";
import { Clock } from "../time/clock";

export enum PhysicalObjectType {
    Ball = "Ball",
    Person = "Person",
    ImmovableLine = "ImmovableLine",
    ImmovableSegment = "ImmovableSegment",
    ImmovableBall = "ImmovableBall",
}

export enum StateProperties {
    position = "position",
    velocity = "velocity",
    acceleration = "acceleration",
}

export type PhysicalObjectDynamics = {
    [property in StateProperties]: NumberVector2D;
}

export type PhysicalObjectTime = {
    clock: Clock;
}

export type PhysicalObjectInternal = {
    lightField?: VectorField2D,
    enlightedPoints?: IEnlightedPoint[]
}

export enum PersonEpidemicsState {
    Normal = "N",
    Dead = "D",
    Immunized =  "Im",
    Contagious = "C",
    Infected = "In"
}

export type PhysicalObjectEpidemics = {
    epidemicsState: PersonEpidemicsState;
    previousEpidemicsState: PersonEpidemicsState;
    timeSinceStateChange: number;
}

export type PhysicalObjectState = PhysicalObjectDynamics &
    PhysicalObjectTime &
    PhysicalObjectInternal &
    { epidemics?: PhysicalObjectEpidemics };

export interface IPhysicalObject {
    mass: number;
    position: NumberVector2D; // of center of gravity
    velocity: NumberVector2D; // of center of gravity
    acceleration: NumberVector2D; // of center of gravity
    radius: number; // TODO: find something else, this only works for balls
}

export interface PhysicalObjectConstants {
    readonly mass?: number;
    readonly radius?: number;
}

export interface AbstractPhysicalObjectConfig {
    id: string,
    initialState: PhysicalObjectState;
    constants: PhysicalObjectConstants;
    isMoving: boolean;
    exemptedLaws?: PhysicalLawType[];
}

export interface IEnlightedPoint {
    point: Point2D,
    intensity: number,
    lightDirection: NumberVector2D
}

// Does it need to be abstract?
export abstract class AbstractPhysicalObject implements IPhysicalObject {
    private _id: string;
    private _constants: PhysicalObjectConstants;
    private _initialState: PhysicalObjectState;
    private _stateBeforeRebound: PhysicalObjectState;
    private _previousState: PhysicalObjectState;
    private _previousStateBeforeRebound: PhysicalObjectState;
    private _state: PhysicalObjectState;
    private _exemptedLaws: PhysicalLawType[];
    private _isMoving: boolean;
    private _latestMovingFlags: boolean[] = [];
    
    readonly MOVING_NORM_THRESHOLD: number = 0.05;
    readonly MOVING_CONSECUTIVE_NUMBERS: number = 500;
    abstract readonly type: PhysicalObjectType;
    
    abstract clone(): AbstractPhysicalObject;

    constructor(config: AbstractPhysicalObjectConfig) {
        this.initializeFromConfig(config);
    }

    private initializeFromConfig(config: AbstractPhysicalObjectConfig) {
        this._id = config.id;

        const init = config.initialState;
        
        this._initialState = this.clonePhysicalState(init);
        this._previousState = null;
        this._previousStateBeforeRebound = null;
        this._state = this.clonePhysicalState(init);

        this._constants = {
            mass: typeof config.constants.mass === "number" ? config.constants.mass : null,
            radius: typeof config.constants.radius === "number" ? config.constants.radius : null
        };

        this._isMoving = config.isMoving;
        this._exemptedLaws = config.exemptedLaws || [];
    }

    get id(): string {
        return this._id;
    }

    
    get initialState(): PhysicalObjectState {
        return this._initialState;
    }

    get stateBeforeRebound(): PhysicalObjectState {
        return this._stateBeforeRebound;
    }

    set stateBeforeRebound(state: PhysicalObjectState) {
        this._stateBeforeRebound = this.clonePhysicalState(state);
    }
    
    get previousState(): PhysicalObjectState {
        return this._previousState;
    }

    get previousStateBeforeRebound(): PhysicalObjectState {
        return this._previousStateBeforeRebound;
    }

    get state(): PhysicalObjectState {
        return this._state;
    }

    get constants(): PhysicalObjectConstants {
        return this._constants;
    }

    get exemptedLaws(): PhysicalLawType[] {
        return this._exemptedLaws;
    }

    get isMoving(): boolean {
        return this._isMoving;
    }

    get mass(): number {
        return this._constants.mass;
    }

    get radius(): number {
        return this._constants.radius;
    }

    get clock(): Clock {
        return this._state?.clock;
    }

    get position(): NumberVector2D {
        return this._state?.position;
    }

    get velocity(): NumberVector2D {
        return this._state?.velocity;
    }

    get acceleration(): NumberVector2D {
        return this._state?.acceleration;
    }

    get enlightedPoints(): IEnlightedPoint[] {
        return this._state?.enlightedPoints ?? [];
    }

    set enlightedPoints(enlightedPoints: IEnlightedPoint[]) {
        if(!this._state) {
            return;
        }

        this._state.enlightedPoints = [...enlightedPoints.map(enlightedPoint => ({
            point: enlightedPoint.point,
            intensity: enlightedPoint.intensity,
            lightDirection: enlightedPoint.lightDirection
        }))] || [];
    }
    
    set clock(clock: Clock) {
        if(!this._state) {
            return;
        }
        this._state.clock = clock;
    }

    set position(position: NumberVector2D) {
        if (!this._state) {
            return;
        }
        this._state.position = position;
    }

    set velocity(velocity: NumberVector2D) {
        if (!this._state) {
            return;
        }
        this._state.velocity = velocity;
    }

    set acceleration(acceleration: NumberVector2D) {
        if (!this._state) {
            return;
        }
        this._state.acceleration = acceleration;
    }

    set state(updatedState: PhysicalObjectState) {
        if (!this._state) {
            return;
        }
        this._state = { ...updatedState };
    }

    set initialState(updatedInitialState: PhysicalObjectState) {
        if (!this._initialState) {
            return;
        }
        this._initialState = { ...updatedInitialState };
    }

    addEnlightedPoint(enlightedPoint: IEnlightedPoint): void {
        this._state?.enlightedPoints?.push(enlightedPoint);
    }
    
    applyLaws(physicalLaws: AbstractPhysicalLaw[], context?: AbstractPhysicalContext): void {
        this._previousStateBeforeRebound = this.clonePhysicalState(this.stateBeforeRebound);
        this._previousState = this.clonePhysicalState(this._state);

        physicalLaws
            .filter(() => this.isMoving)
            .forEach((law: AbstractPhysicalLaw) => law.apply(this, context));

        this.updateIsMovingStatus();
    }

    printableState(): string {
        return `pos: ${this._state.position.toString()}
vel: ${this._state.velocity.toString()}
acc: ${this._state.acceleration.toString()}`;
    }

    private clonePhysicalState(init: PhysicalObjectState): PhysicalObjectState {
        return init ? {
            clock: init.clock ? init.clock.clone() : null,
            position: init.position?.clone(),
            velocity: init.velocity?.clone(),
            acceleration: init.acceleration?.clone(),
            enlightedPoints: init.enlightedPoints ? [...init.enlightedPoints] : [],
            epidemics: init.epidemics ? {...init.epidemics} : null
        } : null;
    }

    private updateIsMovingStatus(): void {
        const pos = this._state?.position;
        const previousPos = this._previousState?.position;
        if (previousPos && pos) {
            const appearsToBeStopped = pos.subtract(previousPos).norm() < this.MOVING_NORM_THRESHOLD;
            if (this._latestMovingFlags.length >= this.MOVING_CONSECUTIVE_NUMBERS) {
                this._latestMovingFlags.shift();
            }

            this._latestMovingFlags.push(appearsToBeStopped);
        }

        if (this._isMoving && this._latestMovingFlags.length === this.MOVING_CONSECUTIVE_NUMBERS && this._latestMovingFlags.every(flag => flag)) {
            this._isMoving = false;
        }
    }
}