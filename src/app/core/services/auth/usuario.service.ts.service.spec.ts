import { TestBed } from '@angular/core/testing';

import { UsuarioAuthService } from './usuario.service.ts.service';

describe('UsuarioServiceTsService', () => {
  let service: UsuarioAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
