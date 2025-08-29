import { TestBed } from '@angular/core/testing';
import { AsignacionService } from './asignacion.service';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { of } from 'rxjs';

describe('AsignacionService', () => {
  let service: AsignacionService;
  let apiBaseSpy: jasmine.SpyObj<ApiBaseService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiBaseService', ['post']);

    TestBed.configureTestingModule({
      providers: [
        AsignacionService,
        { provide: ApiBaseService, useValue: spy }
      ]
    });

    service = TestBed.inject(AsignacionService);
    apiBaseSpy = TestBed.inject(ApiBaseService) as jasmine.SpyObj<ApiBaseService>;
  });

  it('debería crear el servicio correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería llamar a apiBase.post con la URL y datos correctos en obtenerPorAsignar', () => {
    const mockData = { test: 'data' };
    apiBaseSpy.post.and.returnValue(of({}));

    service.obtenerPorAsignar(mockData).subscribe();

    expect(apiBaseSpy.post).toHaveBeenCalledWith(`${service['url']}/v1/e/asignacion/porAsignar`, mockData);
  });

  it('debería llamar a apiBase.post con la URL y datos correctos en obtenerAsignados', () => {
    const mockData = { test: 'data' };
    apiBaseSpy.post.and.returnValue(of({}));

    service.obtenerAsignados(mockData).subscribe();

    expect(apiBaseSpy.post).toHaveBeenCalledWith(`${service['url']}/v1/e/asignacion/asignados`, mockData);
  });

  it('debería llamar a apiBase.post con la URL y datos correctos en asignarCasos', () => {
    const mockData = { test: 'data' };
    apiBaseSpy.post.and.returnValue(of({}));

    service.asignarCasos(mockData).subscribe();

    expect(apiBaseSpy.post).toHaveBeenCalledWith(`${service['url']}/v1/e/caso/bandejas/fiscaliasuperior/asignarCaso`, mockData);
  });

  it('debería llamar a apiBase.post con la URL y datos correctos en revertirCasos', () => {
    const idCaso = '123';
    const mockData = { test: 'data' };
    apiBaseSpy.post.and.returnValue(of({}));

    service.revertirCasos(idCaso, mockData).subscribe();

    expect(apiBaseSpy.post).toHaveBeenCalledWith(`${service['url']}/v1/e/caso/bandejas/fiscaliasuperior/${idCaso}/revertirCaso`, mockData);
  });

  it('debería llamar a apiBase.post con la URL y datos correctos en desasignarCasos', () => {
    const mockData = { test: 'data' };
    apiBaseSpy.post.and.returnValue(of({}));

    service.desasignarCasos(mockData).subscribe();

    expect(apiBaseSpy.post).toHaveBeenCalledWith(`${service['url']}/v1/e/caso/bandejas/fiscaliasuperior/desasignarCaso`, mockData);
  });

  it('debería llamar a apiBase.post con la URL y datos correctos en atenderCaso', () => {
    const idCaso = '456';
    const mockData = { test: 'data' };
    apiBaseSpy.post.and.returnValue(of({}));

    service.atenderCaso(idCaso, mockData).subscribe();

    expect(apiBaseSpy.post).toHaveBeenCalledWith(`${service['url']}/v1/e/caso/bandejas/fiscaliasuperior/${idCaso}/atenderCaso`, mockData);
  });

  it('debería llamar a apiBase.post con la URL y datos correctos en reasignarCasos', () => {
    const mockData = { test: 'data' };
    apiBaseSpy.post.and.returnValue(of({}));

    service.reasignarCasos(mockData).subscribe();

    expect(apiBaseSpy.post).toHaveBeenCalledWith(`${service['url']}/v1/e/caso/bandejas/fiscaliasuperior/reasignarCaso`, mockData);
  });

  it('debería llamar a apiBase.post con la URL y datos correctos en obtenerRecepcionar', () => {
    const mockData = { test: 'data' };
    apiBaseSpy.post.and.returnValue(of({}));

    service.obtenerRecepcionar(mockData).subscribe();

    expect(apiBaseSpy.post).toHaveBeenCalledWith(`${service['url']}/v1/e/recepcion/recibidos`, mockData);
  });

  it('debería devolver null en recibirCasos', () => {
    service.recibirCasos({}).subscribe((result) => {
      expect(result).toBeNull();
    });
  });
});
