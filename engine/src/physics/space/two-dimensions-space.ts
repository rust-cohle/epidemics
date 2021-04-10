import { Point2D } from "../../mathematics/point";
import { NumberVector2D } from "../../mathematics/vector";
import { Space } from "./space";

export class TwoDimensionsSpace implements Space {
    private topLeft: Point2D;
    private topRight: Point2D;
    private bottomLeft: Point2D;
    private bottomRight: Point2D;
    private normalX: NumberVector2D;
    private normalY: NumberVector2D;
    private topMiddle: Point2D;
    private leftMiddle: Point2D;
    private bottomMiddle: Point2D;
    private rightMiddle: Point2D;

    constructor(
        private size: [number, number],
        private origin: Point2D = new Point2D([0, 0])
    ) {
        const x = new NumberVector2D([size[0], 0]);
        const y = new NumberVector2D([0, size[1]]);
        this.topLeft = this.origin;
        this.topRight = this.origin.translate(x);
        this.bottomLeft = this.origin.translate(y);
        this.bottomRight = this.origin.translate(x).translate(y);
        this.normalX = x.normal().normalize();
        this.normalY = y.normal().opposite().normalize();
        this.topMiddle = this.topLeft.center(this.topRight);
        this.leftMiddle = this.topLeft.center(this.bottomLeft);
        this.bottomMiddle = this.bottomLeft.center(this.bottomRight);
        this.rightMiddle = this.topRight.center(this.bottomRight);
    }

    toString(): string {
        return `topLeft: ${this.topMiddle}
topRight: ${this.topRight}
bottomLeft: ${this.bottomLeft}
bottomRight: ${this.bottomRight}
normalX: ${this.normalX}
normalY: ${this.normalY}
topMiddle: ${this.topMiddle}
leftMiddle: ${this.leftMiddle}
bottomMiddle: ${this.bottomMiddle}
rightMiddle: ${this.rightMiddle}`;
    }

    isInside(point: Point2D): boolean {
        const pointToTop = NumberVector2D.fromPoints(point, this.topMiddle);
        const pointToLeft = NumberVector2D.fromPoints(point, this.leftMiddle);
        const pointToBottom = NumberVector2D.fromPoints(point, this.bottomMiddle);
        const pointToRight = NumberVector2D.fromPoints(point, this.rightMiddle);
        // console.log(`pointToTop: ${pointToTop}`);
        // console.log(`pointToLeft: ${pointToLeft}`);
        // console.log(`pointToBottom: ${pointToBottom}`);
        // console.log(`pointToRight: ${pointToRight}`);

        // console.log(`dot1: ${pointToTop.dot(this.normalX)}`);
        // console.log(`dot2: ${pointToLeft.dot(this.normalY)}`);
        // console.log(`dot3: ${pointToBottom.dot(this.normalX.opposite())}`);
        // console.log(`dot4: ${pointToRight.dot(this.normalY.opposite())}`);
        // console.log("------------");

        return pointToTop.dot(this.normalX) > 0 &&
            pointToLeft.dot(this.normalY) > 0 &&
            pointToBottom.dot(this.normalX.opposite()) > 0 &&
            pointToRight.dot(this.normalY.opposite()) > 0;
    }
}