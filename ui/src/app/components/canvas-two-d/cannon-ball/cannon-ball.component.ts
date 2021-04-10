/// <reference types="resize-observer-browser" />

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { CannonBallWorldConfig, EARTH_GRAVITY, generateCannonBallWorld, Point2D } from '@epidemics/engine';
import { CanvasDrawingService } from '../../../services/drawing/canvas-drawing.service';
import { LiveRunnerService } from '../../../services/runner/live-runner.service';
import { SyncReplayRunnerService } from '../../../services/runner/sync-replay-runner.service';
import { ICanvasRunner } from '../../../services/runner/runner.interface';

@Component({
  selector: 'app-cannon-ball',
  templateUrl: './cannon-ball.component.html',
  styleUrls: ['./cannon-ball.component.scss'],
  providers: [CanvasDrawingService]
})
export class CannonBallComponent implements OnInit, AfterViewInit {
  @ViewChild("canvasParent", { read: ElementRef }) canvasParentRef: ElementRef | null = null;

  @ViewChild("canvas2D", { read: ElementRef }) canvas2DRef: ElementRef | null = null;

  context: CanvasRenderingContext2D | null = null;

  runner: ICanvasRunner;

  // Runner config
  runnerType = new FormControl('live');

  // World config
  gravity = EARTH_GRAVITY;
  elasticityX = 0.75;
  elasticityY = 0.75;

  constructor(private drawing: CanvasDrawingService,
    private replayRunner: SyncReplayRunnerService,
    private liveRunner: LiveRunnerService) { }

  get canvas2D(): HTMLCanvasElement {
    return this.canvas2DRef?.nativeElement;
  }

  ngOnInit() {
    this.runner = this.liveRunner;
  }

  ngAfterViewInit(): void {
    if (!this.canvasParentRef || !this.canvas2DRef) {
      return;
    }

    this.initialize();
    this.startAnimation();
  }

  ngOnDestroy(): void {
    this.runner.release();
  }

  startAnimation() {
    this.runner.release();
    this.runner = this.runnerType.value === "live" ? this.liveRunner : this.replayRunner;
    this.runner.worldConfig = this.getWorldConfig();

    if(this.runner instanceof SyncReplayRunnerService) {
      this.runner.world = generateCannonBallWorld(this.runner.worldConfig);
    }

    this.runner.startAnimation();
  }

  toggleAnimation() {
    this.runner.toggleAnimation();
  }

  initialize(): void {
    this.drawing.context = this.canvas2D.getContext("2d");

    const worldConfig = this.getWorldConfig();

    // init replay runner
    this.replayRunner.drawing = this.drawing;
    this.replayRunner.initialize(worldConfig);

    // init live runner
    this.liveRunner.drawing = this.drawing;
    this.liveRunner.initialize(worldConfig);
  }

  getWorldConfig(): CannonBallWorldConfig {
    return {
      width: this.drawing.canvas.width,
      height: this.drawing.canvas.height,
      numberOfPersons: 50,
      gravity: this.gravity,
      elasticity: [this.elasticityX, this.elasticityY] as [number, number],
      moon: {position: new Point2D([5, 7])}
    };
  }

  onGravityChange(change: MatSliderChange): void {
    this.gravity = change.value;
  }

  onElasticityXChange(change: MatSliderChange): void {
    this.elasticityX = change.value;
  }

  onElasticityYChange(change: MatSliderChange): void {
    this.elasticityY = change.value;
  }

}
