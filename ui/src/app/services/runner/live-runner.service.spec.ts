import { TestBed } from '@angular/core/testing';

import { LiveRunnerService } from './live-runner.service';

describe('LiveRunnerService', () => {
  let service: LiveRunnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveRunnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
