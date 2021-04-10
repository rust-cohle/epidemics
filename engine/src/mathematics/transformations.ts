import { NumberMatrix } from "./matrix";

export const get2DRotationMatrix = function(theta: number, precision?: number) {
    let cosTheta = Math.cos(theta); 
    let sinTheta = Math.sin(theta);

    if(typeof precision === "number") {
        cosTheta = parseFloat(cosTheta.toFixed(precision));
        sinTheta = parseFloat(sinTheta.toFixed(precision));
    }

    return new NumberMatrix([
        [cosTheta, -sinTheta],
        [sinTheta, cosTheta]
    ]);
};