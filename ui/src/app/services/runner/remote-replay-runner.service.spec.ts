import { TestBed } from '@angular/core/testing';

import { RemoteReplayRunnerService } from './remote-replay-runner.service';

describe('RemoteReplayRunnerService', () => {
  let service: RemoteReplayRunnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoteReplayRunnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
