import { AbstractPhysicalObject, PersonEpidemicsState, PhysicalObjectConstants, PhysicalObjectEpidemics, PhysicalObjectState, PhysicalObjectType } from "./abstract-physical-object";

export interface PersonConfig {
    id: string,
    constants: PhysicalObjectConstants,
    initialState: PhysicalObjectState
}

export class Person extends AbstractPhysicalObject {
    readonly type: PhysicalObjectType = PhysicalObjectType.Person;

    constructor(protected config: PersonConfig) {
        super({
            id: config.id,
            initialState: config.initialState,
            constants: config.constants,
            isMoving: true,
        });
    }

    get epidemics(): PhysicalObjectEpidemics {
        return this.state?.epidemics;
    }

    get previousEpidemicsState(): PersonEpidemicsState {
        return this.state?.epidemics.previousEpidemicsState;
    }

    get epidemicsState(): PersonEpidemicsState {
        return this.state?.epidemics.epidemicsState;
    }

    get isNormal(): boolean {
        return this.state?.epidemics.epidemicsState === PersonEpidemicsState.Normal;
    }

    get isInfected(): boolean {
        return this.state?.epidemics.epidemicsState === PersonEpidemicsState.Infected;
    }

    get isContagious(): boolean {
        return this.state?.epidemics.epidemicsState === PersonEpidemicsState.Contagious;
    }

    get isImmunized(): boolean {
        return this.state?.epidemics.epidemicsState === PersonEpidemicsState.Immunized;
    }

    get isDead(): boolean {
        return this.state?.epidemics.epidemicsState === PersonEpidemicsState.Dead;
    }

    set epidemics(updatedEpidemics: PhysicalObjectEpidemics) {
        if (!this.state) {
            return;
        }

        this.state.epidemics = {
            ...updatedEpidemics
        }
    }

    set epidemicsState(state: PersonEpidemicsState) {
        this.state.epidemics.epidemicsState = state;
    }
    
    set previousEpidemicsState(state: PersonEpidemicsState) {
        this.state.epidemics.previousEpidemicsState = state;
    }

    clone(): AbstractPhysicalObject {
        return new Person({
            id: this.id,
            constants: this.constants,
            initialState: this.initialState
        });
    }
}