import { TestBed } from '@angular/core/testing';

import { SocketRunnerService } from './socket-runner.service';

describe('SocketRunnerService', () => {
  let service: SocketRunnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketRunnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
