import { TestBed } from '@angular/core/testing';

import { SyncReplayRunnerService } from './sync-replay-runner.service';

describe('ReplayRunnerService', () => {
  let service: SyncReplayRunnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SyncReplayRunnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
