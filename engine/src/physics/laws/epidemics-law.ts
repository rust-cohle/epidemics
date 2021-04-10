import { AbstractPhysicalObject, PersonEpidemicsState, PhysicalObjectType } from "../objects/abstract-physical-object";
import { Person } from "../objects/person";
import { AbstractPhysicalContext, AbstractPhysicalLaw, PhysicalLawType, PhysicalObjectFormulas } from "./abstract-physical-law";
import { identity } from "./utils";

function epidemicsIdentifity(object: Person): PhysicalObjectFormulas {
    // State did not change since last time, so previous equals current
    object.previousEpidemicsState = object.epidemicsState;

    return identity(object);
}

export interface EpidemicsLawConfig {
    interactionRadius: number;
    transmissionProbability: number;
    dayInNumberOfIterations: number;
}

const DEFAULT_EPIDEMICS_CONFIG: EpidemicsLawConfig = {
    interactionRadius: 0.1,
    transmissionProbability: 0.2,
    dayInNumberOfIterations: 100
}

export class EpidemicsLaw extends AbstractPhysicalLaw {
    private epidemicsConfig: EpidemicsLawConfig;

    constructor(_config: EpidemicsLawConfig = DEFAULT_EPIDEMICS_CONFIG) {
        super({
            type: PhysicalLawType.Epidemics
        });

        this.epidemicsConfig = _config;
    }

    apply(object: AbstractPhysicalObject, context?: AbstractPhysicalContext): void {
        super.apply(object, context);

        // context.epidemics.iterations =+ 1;
        // if (context.epidemics.iterations % this.epidemicsConfig.dayInNumberOfIterations === 0) {
        //     context.epidemics.clock.update(context.epidemics.clock.time + 1);
        // }
    };

    formulas(object: AbstractPhysicalObject, context: AbstractPhysicalContext): PhysicalObjectFormulas {
        if (object.type !== PhysicalObjectType.Person) {
            return identity(object);
        }

        const person = object as Person;
        person.epidemics = {
            ...person.epidemics,
            timeSinceStateChange: person.epidemics.timeSinceStateChange + 1
        }

        switch(person.epidemicsState) {
            case PersonEpidemicsState.Dead:
                // Already dead, do nothing
                return identity(person);
            case PersonEpidemicsState.Normal:
                // Check if person becomes infected
                this.handleNormalPerson(person, context);
                return identity(person);
            case PersonEpidemicsState.Infected:
                // Check if person becomes contagious
                return identity(person);
            case PersonEpidemicsState.Contagious:
                person.previousEpidemicsState = PersonEpidemicsState.Contagious;
                person.epidemicsState = PersonEpidemicsState.Contagious;
                // Check if person dies
                return identity(person);
            case PersonEpidemicsState.Immunized:
                // Check if person becomes normal
                return identity(person);
            default:
                return identity(person);
        }
    }

    handleNormalPerson(person: Person, context: AbstractPhysicalContext): void {
        const interactingPersons = context.interactingObjects
            .filter(obj => {
                const isPerson = obj.type === PhysicalObjectType.Person &&
                    !(obj as Person).isDead;

                if (!isPerson) {
                    return false;
                }

                const interactingPerson = obj as Person;
                const distance = person.position.asPoint().distanceFrom(interactingPerson.position.asPoint());
                // Filter the persons that are too far away
                if (distance > this.epidemicsConfig.interactionRadius) {
                    return false;
                }

                // No risk of infection if the other is not contagious
                if (!interactingPerson.isContagious) {
                    return false;
                }

                // If all above conditions where false, this is an actual interacting person
                return true;
            });

        // If no one is risking to contaminate the person, do nothing
        const numberOfContagiousInteracting = interactingPersons.length;
        if (numberOfContagiousInteracting === 0) {
            return;
        }

        const transmission = this.epidemicsConfig.transmissionProbability;
        const contaminatedProb = 1 - Math.pow(1-transmission, numberOfContagiousInteracting);
        const actual = Math.random();
        
        // Not infected
        if(actual > contaminatedProb) {
            return;
        }

        // Contagious
        person.epidemics = {
            previousEpidemicsState: PersonEpidemicsState.Normal,
            epidemicsState: PersonEpidemicsState.Contagious,
            timeSinceStateChange: 0
        }

        return;
    }

    handleInfectedPerson(person: Person, context: AbstractPhysicalContext): void {
        
    }

}