import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ResolucionAutoResuelveRequerimientoProrrogaComponent } from './resolucion-auto-resuelve-requerimiento-prorroga.component';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { AmpliarPlazoRequest } from '@core/interfaces/provincial/administracion-casos/preliminar/ampliar-plazo.request';

describe('ResolucionAutoResuelveRequerimientoProrrogaComponent', () => {
  let component: ResolucionAutoResuelveRequerimientoProrrogaComponent;
  let fixture: ComponentFixture<ResolucionAutoResuelveRequerimientoProrrogaComponent>;

  // Mocks
  const tramiteServiceMock = {
    actoTramiteDetalleCaso: jasmine.createSpy().and.returnValue(of({}))
  };

  const gestionCasoServiceMock = {
    registrarAutoResuelveRequerimientoProrroga: jasmine.createSpy().and.returnValue(of({}))
  };

  const notificationServiceMock = {
    success: jasmine.createSpy(),
    error: jasmine.createSpy()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResolucionAutoResuelveRequerimientoProrrogaComponent],
      providers: [
        { provide: TramiteService, useValue: tramiteServiceMock },
        { provide: GestionCasoService, useValue: gestionCasoServiceMock },
        { provide: notificationServiceMock, useValue: notificationServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResolucionAutoResuelveRequerimientoProrrogaComponent);
    component = fixture.componentInstance;
    component['idActoTramiteCaso'] = '12312adasdasdas';
    component['idCaso'] = 'ADASDSAD12321312';
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con valores por defecto', () => {
    expect(component['formulario']).toBeDefined();
    expect(component['formulario'].get('idResultado')?.value).toBeNull();
    expect(component['formulario'].get('fechaNotificacion')?.valid).toBeFalse();
  });

  it('debería deshabilitar el formulario si el trámite está en modo visor', () => {
    expect(component['formulario'].disabled).toBeTrue();
  });

  it('debería invocar el servicio y mostrar notificación al guardar', () => {
    // Arrange
    component['tramiteGuardado'] = false;
    component['codFundadoParte'] = 1234;
    component['formulario'].setValue({
      idResultado: 'FUNDADO',
      plazo: '10 días',
      fechaNotificacion: new Date(),
      conAudio: true,
      conVideo: false,
      observacion: 'Observaciones'
    });

    // Act
    component['registrarAutoResuelveRequerimientoProrroga']();

    // Assert
    expect(gestionCasoServiceMock.registrarAutoResuelveRequerimientoProrroga).toHaveBeenCalled();
    expect(notificationServiceMock.success).toHaveBeenCalled();
    expect(component['tramiteGuardado']).toBeTrue();
  });

  it('debería marcar el formulario como tocado si es inválido', () => {
    spyOn(component['formulario'], 'markAllAsTouched');
    component['registrarAutoResuelveRequerimientoProrroga']();
    expect(component['formulario'].markAllAsTouched).toHaveBeenCalled();
  });
});