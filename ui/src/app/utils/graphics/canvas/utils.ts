import { Point2D, NumberVector2D } from "@epidemics/engine";

export function mirrorX(obj: NumberVector2D | Point2D | [number, number], canvas: HTMLCanvasElement): NumberVector2D | Point2D | [number, number] {
    const heightVector = new NumberVector2D([0, canvas.height]);

    if (obj instanceof NumberVector2D) {
        return obj.scaleY(-1).add(heightVector)
    } else if (obj instanceof Point2D) {
        return new Point2D((new NumberVector2D(obj.value)).scaleY(-1).add(heightVector).value);
    } else if(obj instanceof Array) {
        const heightNumberArray = heightVector.value;
        return [obj[0], heightNumberArray[1] - obj[1]];
    }

    return null;
}