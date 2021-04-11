import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { EARTH_GRAVITY, EpidemicsWorldConfig, generateEpidemicsWorld, ISpaceTimeRecord } from '@epidemics/engine';
import { Subscription } from 'rxjs';
import { ComputationEvent, IComputationProgressEvent, IComputationProgress, SocketService } from '../../services/io/socket/socket.service';
import { RemoteReplayRunnerService } from 'src/app/services/runner/remote-replay-runner.service';
import { CanvasDrawingService } from '../../services/drawing/canvas-drawing.service';
import { ICanvasRunner } from '../../services/runner/runner.interface';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss'],
  providers: [CanvasDrawingService]
})
export class SimulationComponent implements OnInit, AfterViewInit {
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

  isComputing: boolean = false;

  progress: IComputationProgress = null;

  private subscriptions: Subscription[] = [];

  constructor(private drawing: CanvasDrawingService,
    private socketService: SocketService,
    private remoteRunner: RemoteReplayRunnerService) { }

  get canvas2D(): HTMLCanvasElement {
    return this.canvas2DRef?.nativeElement;
  }

  ngOnInit() {
    const latestComputationSub = this.socketService.computationProgress$()
      .subscribe(this.updateComputationState.bind(this));

    this.subscriptions.push(latestComputationSub);
  }

  ngAfterViewInit(): void {
    if (!this.canvasParentRef || !this.canvas2DRef) {
      return;
    }

    this.initialize();
  }

  ngOnDestroy(): void {
    this.remoteRunner.release();

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  simulate() {
    this.remoteRunner.release();

    this.remoteRunner.initialize({
      width: this.canvas2D.width,
      height: this.canvas2D.height,
      numberOfPersons: 10
    });

    this.remoteRunner.startAnimation({
      fps: 20,
      duration: 100, // duration in unit time
      unitInMs: 1000, // unit is one hour
    });
  }

  updateComputationState(event: IComputationProgressEvent<ISpaceTimeRecord>): void {
    this.progress = null;
    
    if(!event) {
      return;
    }

    this.isComputing = event.type === ComputationEvent.Progressing;
    if(this.isComputing) {
      this.progress = event.progress;
    }
  }

  toggleAnimation() {
    this.remoteRunner.toggleAnimation();
  }

  initialize(): void {
    this.drawing.context = this.canvas2D.getContext("2d");
    this.remoteRunner.drawing = this.drawing;
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
