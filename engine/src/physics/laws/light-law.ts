import { NumberVector2D } from "../../mathematics/vector";
import { AbstractPhysicalObject } from "../objects/abstract-physical-object";
import { ILightSource, StaticLightSource } from "../objects/light-source";
import { isImmovable } from "../objects/utils";

import { AbstractPhysicalContext, AbstractPhysicalLaw, PhysicalLawType, PhysicalObjectFormulas } from "./abstract-physical-law";
import { identity } from "./utils";

export class LightLaw2D extends AbstractPhysicalLaw {
    constructor(private staticLightSources: ILightSource[] = []) {
        super({
            type: PhysicalLawType.Light
        });
    }

    formulas(object: AbstractPhysicalObject, context: AbstractPhysicalContext): PhysicalObjectFormulas {
        const dynamicLightSources: ILightSource[] = (context.interactingObjects as any[])
            .filter((obj) => !!(obj as ILightSource).lightField);

        const lightSources: ILightSource[] = [...this.staticLightSources, ...dynamicLightSources];

        // console.log(lightSources.length);

        object.enlightedPoints = [];
        for(const lightSource of lightSources) {
            if(isImmovable(object.type)) {
                continue;
            }

            const position = object.position.asPoint();
            const lightVector = lightSource.lightField.getAt(position);
            const incidencePoint = position.translate(lightVector.scale(-1).resize(object.radius));

            object.addEnlightedPoint({
                point: incidencePoint,
                intensity: lightVector.norm(),
                lightDirection: lightVector
            });
        }
        
        return identity(object);
    }

}