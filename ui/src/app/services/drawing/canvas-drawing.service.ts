import { Injectable } from '@angular/core';
import { Line2D, Point2D, ImmovableBall, ImmovableLine, ImmovableSegment, numberToPixels, pointToPixels, vectorToPixels, NumberVector2D, PhysicalObjectType, Ball, ISpaceTimeSnapshot, numberArrayToPixels } from '@epidemics/engine';
import { ISnapshotObject } from '../../../../../engine/dist/physics/objects/snapshot-object';
import { mirrorX } from '../../utils/graphics';

interface StyleConstants {
  bgColor: string;
  lightColor: string;
  bgColorShade: string;
  lightColorShade: string;
}

interface EpidemicsColors {
  normal: string;
  infected: string;
  contagious: string;
  dead: string;
  immunized: string;
}

interface DrawingOptions {
  fill: boolean;
  options: FillElementOptions | StrokeElementOptions
}

interface StrokeElementOptions {
  strokeStyle: string;
  strokeWidth: number;
}

interface FillElementOptions {
  fillStyle: string;
}

@Injectable()
export class CanvasDrawingService {
  private readonly STYLE_CONSTANTS: StyleConstants = {
    bgColor: "rgba(16, 25, 43, 1)",
    lightColor: "rgba(255, 249, 232, 1)",
    bgColorShade: "rgba(16, 25, 43, 0.2)",
    lightColorShade: "rgba(255, 249, 232, 0.2)"
  }

  private readonly DEFAULT_STROKE_ELEMENT_OPTIONS: StrokeElementOptions = {
    strokeStyle: "#aaaaaa",
    strokeWidth: 1
  };

  private readonly DEFAULT_FILL_ELEMENT_OPTIONS: FillElementOptions = {
    fillStyle: "#525252"
  };

  private readonly DEFAULT_DRAWING_OPTIONS: DrawingOptions = {
    fill: true,
    options: this.DEFAULT_FILL_ELEMENT_OPTIONS
  };

  private readonly DEFAULT_EPIDEMICS_COLORS: EpidemicsColors = {
    normal: "#525252",
    infected: "rgba(255, 251, 199, 1)",
    contagious: "rgba(247, 207, 104, 1)",
    dead: "rgba(247, 121, 104, 1)",
    immunized: "rgba(215, 255, 168, 1)",
  };

  private _context: CanvasRenderingContext2D;

  constructor() { }

  get canvas(): HTMLCanvasElement {
    return this._context.canvas;
  }

  get context(): CanvasRenderingContext2D {
    return this._context;
  }

  set context(context: CanvasRenderingContext2D) {
    this._context = context;
  }

  draw(snapshot: ISpaceTimeSnapshot, done: () => void) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.beginPath();
    this.context.fillStyle = this.STYLE_CONSTANTS.bgColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawObjects(snapshot);

    done();
  }

  drawObjects(snapshot: ISpaceTimeSnapshot) {
    // TODO: optimize
    snapshot.objects.sort((a, b) => {
      if (b.type === "ImmovableBall") {
        return 1;
      }

      return -1;
    })
      .filter(obj => obj.type === PhysicalObjectType.Ball ||
        obj.type === PhysicalObjectType.ImmovableBall ||
        obj.type === PhysicalObjectType.Person)
      .forEach(obj => {
        if(obj.type === PhysicalObjectType.Person) {
          this.drawPerson(obj);
          return;
        }

        this.drawBall(obj);
      });

    snapshot.objects
      .filter(obj => obj.type === PhysicalObjectType.ImmovableLine)
      .forEach(line => this.drawLine(line));

    snapshot.objects
      .filter(obj => obj.type === PhysicalObjectType.ImmovableSegment)
      .forEach(segment => this.drawSegment(segment));
  }

  drawBall(ball: ISnapshotObject) {
    const origin = mirrorX(numberArrayToPixels(ball.position), this.canvas) as [number, number];
    const radius = numberToPixels(ball.radius);

    // If ball is a light source
    if (ball.isLightSource) {
      // Draw light source glow
      this.drawEnlightingBall(ball);
      return;
    }

    // If ball is enlighted
    // TODO: handle drawing of multiple enlighted points on an object
    if (ball.enlightedPoints?.length) {
      this.drawEnlightedBall(ball);
      return;
    }

    // Normal ball
    this.drawCircle(origin, radius);
  }

  drawPerson(person: ISnapshotObject) {
    const origin = mirrorX(numberArrayToPixels(person.position), this.canvas) as [number, number];
    const radius = numberToPixels(person.radius);

    let personColor = this.DEFAULT_EPIDEMICS_COLORS.normal;
    switch(person.epidemics.state) {
      case "D":
        personColor = this.DEFAULT_EPIDEMICS_COLORS.dead
        break;
      case "In":
        personColor = this.DEFAULT_EPIDEMICS_COLORS.infected
        break;
      case "Im":
        personColor = this.DEFAULT_EPIDEMICS_COLORS.immunized
        break;
      case "C":
        personColor = this.DEFAULT_EPIDEMICS_COLORS.contagious
        break;
      default:
        personColor = this.DEFAULT_EPIDEMICS_COLORS.normal;
        break;
    }

    // Draw a circle whose color corresponds to person state
    this.drawCircle(origin, radius, {
      fill: true,
      options: {
        fillStyle: personColor
      }
    });
  }

  drawEnlightingBall(ball: ISnapshotObject): void {
    const origin = mirrorX(numberArrayToPixels(ball.position), this.canvas);
    const radius = numberToPixels(ball.radius);

    this.context.beginPath();

    const lightSource = mirrorX(vectorToPixels(new NumberVector2D(ball.position)), this.canvas) as NumberVector2D;
    const gradient = this.context.createRadialGradient(lightSource.x, lightSource.y, 0, lightSource.x, lightSource.y, 50);
    gradient.addColorStop(0, this.STYLE_CONSTANTS.lightColorShade);
    gradient.addColorStop(1, this.STYLE_CONSTANTS.bgColorShade);
    this.context.fillStyle = gradient;
    this.context.arc(lightSource.x, lightSource.y, 50, 0, 2 * Math.PI);
    this.context.fill();

    // Draw light source object
    this.context.beginPath();
    this.drawCircle(origin as [number, number], radius, {
      fill: true,
      options: {
        fillStyle: this.STYLE_CONSTANTS.lightColor
      }
    });
    this.context.fill();
  }

  drawEnlightedBall(ball: ISnapshotObject): void {
    const origin = mirrorX(numberArrayToPixels(ball.position), this.canvas) as NumberVector2D;
    const radius = numberToPixels(ball.radius);

    this.context.beginPath();
    const enlightedPoint = ball.enlightedPoints[0];
    const computedPoint = vectorToPixels(new NumberVector2D(enlightedPoint.point));
    const actualEnlightedPoint = mirrorX(computedPoint, this.canvas) as NumberVector2D;

    const [disparity, intensity] = [15, 1.5];

    const shiftFactor = new NumberVector2D([this.canvas.width, this.canvas.height]).scale(1 / disparity).norm();
    const lightDirection = new NumberVector2D(enlightedPoint.lightDirection);
    const shiftNorm = lightDirection.norm();
    const shift = lightDirection.resize(shiftNorm * intensity);

    const gradient = this.context.createRadialGradient(
      actualEnlightedPoint.x - shift.x, actualEnlightedPoint.y - shift.y, shift.norm(),
      actualEnlightedPoint.x - shift.x, actualEnlightedPoint.y - shift.y, shiftFactor * shift.norm()
    );
    gradient.addColorStop(0, this.STYLE_CONSTANTS.lightColor);
    gradient.addColorStop(1, this.DEFAULT_FILL_ELEMENT_OPTIONS.fillStyle);
    this.context.fillStyle = gradient;
    this.context?.arc(origin[0], origin[1], radius, 0, 2 * Math.PI);
    this.context.fill();
  }

  drawLine(imvLine: ISnapshotObject) {
    this.drawStroke(() => {
      const line: Line2D = imvLine.line;

      let startPoint = line.point;
      let intersect1 = line.intersect(
        new Line2D(
          new Point2D([0, 0]),
          new NumberVector2D([0, 1])
        )
      );
      let intersect2 = line.intersect(
        new Line2D(
          new Point2D([this.canvas.width, 0]),
          new NumberVector2D([0, 1])
        )
      );

      startPoint = mirrorX(startPoint, this.canvas) as Point2D;
      intersect1 = mirrorX(intersect1, this.canvas) as Point2D;
      intersect2 = mirrorX(intersect2, this.canvas) as Point2D;

      this.context.beginPath();
      this.context.moveTo(startPoint.x, startPoint.y);
      this.context.lineTo(intersect1.x, intersect1.y);
      this.context.stroke();

      this.context.beginPath();
      this.context.moveTo(startPoint.x, startPoint.y);
      this.context.lineTo(intersect2.x, intersect2.y);
      this.context.stroke();
    });
  }

  drawSegment(imvSegment: ISnapshotObject) {
    this.drawStroke(() => {
      let [point1, point2] = imvSegment.bounds;
      let boundPoint1 = mirrorX(pointToPixels(point1), this.canvas) as Point2D;
      let boundPoint2 = mirrorX(pointToPixels(point2), this.canvas) as Point2D;

      this.context.beginPath();
      this.context.moveTo(boundPoint1.x, boundPoint1.y);
      this.context.lineTo(boundPoint2.x, boundPoint2.y);
      this.context.stroke();
    });
  }

  private drawStroke(drawStrokeElementCb: () => any, options?: StrokeElementOptions): void {
    if (!this.context) {
      return;
    }

    if (!options) {
      options = this.DEFAULT_STROKE_ELEMENT_OPTIONS;
    }

    this.context.beginPath();
    this.context.lineWidth = options.strokeWidth;
    this.context.strokeStyle = options.strokeStyle;
    drawStrokeElementCb();
    this.context.stroke();
  }

  private drawFill(drawStrokeElementCb: () => any, options?: FillElementOptions): void {
    if (!this.context) {
      return;
    }

    if (!options) {
      options = this.DEFAULT_FILL_ELEMENT_OPTIONS;
    }

    this.context.beginPath();
    this.context.fillStyle = options.fillStyle;
    drawStrokeElementCb();
    this.context.fill();
  }

  private drawVector(origin: NumberVector2D, vector: NumberVector2D, options: DrawingOptions = this.DEFAULT_DRAWING_OPTIONS): void {
    const drawFunction = options.fill ? this.drawFill.bind(this) : this.drawStroke.bind(this);
    drawFunction(() => {
      this.context?.moveTo(origin.value[0], origin.value[1]);
      const destination = origin.add(vector).value;
      this.context?.lineTo(destination[0], destination[1]);
    }, options.options);
  }

  private drawCircle(origin: [number, number], radius: number, options: DrawingOptions = this.DEFAULT_DRAWING_OPTIONS): void {
    const drawFunction = options.fill ? this.drawFill.bind(this) : this.drawStroke.bind(this);
    drawFunction(() => {
      this.context?.arc(origin[0], origin[1], radius, 0, 2 * Math.PI);
    }, options.options);
  }
}
