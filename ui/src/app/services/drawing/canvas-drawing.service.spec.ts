import { TestBed } from '@angular/core/testing';

import { CanvasDrawingService } from './canvas-drawing.service';

describe('CanvasDrawingService', () => {
  let service: CanvasDrawingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasDrawingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
