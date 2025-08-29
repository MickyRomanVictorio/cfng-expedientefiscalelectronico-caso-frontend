import { TestBed } from '@angular/core/testing';

import { ConclusionAnticipadaService } from './conclusion-anticipada.service';

describe('ConclusionAnticipadaService', () => {
  let service: ConclusionAnticipadaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConclusionAnticipadaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
