
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogService } from 'primeng/dynamicdialog';
import { ESTADO_REGISTRO, IconUtil } from 'dist/ngx-cfng-core-lib';
import { AutoCitacionJuicioComponent } from './auto-citacion-juicio.component';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { AutoCitacionJuicioService } from '@core/services/provincial/tramites/comun/juzgamiento/auto-citacion-juicio/auto-citacion-juicio.service';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { of, Subscription } from 'rxjs';
import { FormBuilder } from '@angular/forms';

describe('AutoCitacionJuicioComponent', () => {
  let component: any;
  let fixture: ComponentFixture<AutoCitacionJuicioComponent>;
  let mockIconUtil: jasmine.SpyObj<IconUtil>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockCasoService: jasmine.SpyObj<Casos>;
  let mockAutoCitacionJuicioService: jasmine.SpyObj<AutoCitacionJuicioService>;
  let mockModalDialogService: jasmine.SpyObj<NgxCfngCoreModalDialogService>;
  let mockGestionCasoService: jasmine.SpyObj<GestionCasoService>;

  beforeEach(async () => {

    mockIconUtil = jasmine.createSpyObj('IconUtil', ['obtenerIcono']);

    mockDialogService = jasmine.createSpyObj('DialogService', [
      'open'
    ]);

    mockCasoService = jasmine.createSpyObj('Casos', [
      'actoTramiteDetalleCaso'
    ]);

    mockGestionCasoService = jasmine.createSpyObj('GestionCasoService', [
      'obtenerCasoFiscal'
    ]);

    mockModalDialogService = jasmine.createSpyObj('NgxCfngCoreModalDialogService', [
      'success','question'
    ]);

    mockAutoCitacionJuicioService = jasmine.createSpyObj('AutoCitacionJuicioService', [
      'obtenerAutoCitacionJuicio',
      'registrarAutoCitacionJuicio'
    ]);

    mockIconUtil.obtenerIcono.and.returnValue({
      name: 'mock-icon',
      viewBox: '0 0 24 24'
    });

    await TestBed.configureTestingModule({
      imports: [AutoCitacionJuicioComponent],
      providers: [
        { provide: IconUtil, useValue: mockIconUtil },
        { provide: DialogService, useValue: mockDialogService },
        { provide: Casos, useValue: mockCasoService },
        { provide: AutoCitacionJuicioService, useValue: mockAutoCitacionJuicioService },
        { provide: NgxCfngCoreModalDialogService, useValue: mockModalDialogService },
        { provide: GestionCasoService, useValue: mockGestionCasoService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoCitacionJuicioComponent);
    component = fixture.componentInstance;

    component.formAutoCitacionJuicio = new FormBuilder().group({
      idActoTramiteCaso: [null],
      agendasMultiples: [null, []],
      codigoCuadernoPrueba: [null],
      observacion: [null],
      fechaNotificacion: [new Date()]
    });

    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a obtenerDetalleActoTramiteCaso si tieneActoTramiteCasoDocumento es true', () => {
    spyOnProperty(component, 'tieneActoTramiteCasoDocumento', 'get').and.returnValue(true);
    spyOn(component, 'obtenerDetalleActoTramiteCaso');
    component.ngOnInit();
    expect(component.obtenerDetalleActoTramiteCaso).toHaveBeenCalled();
  });

  it('debería llamar a deshabilitarFormulario si esPosibleEditarFormulario es falso', () => {
    spyOnProperty(component, 'esPosibleEditarFormulario', 'get').and.returnValue(false);
    spyOn(component, 'deshabilitarFormulario');
    component.ngOnInit();
    expect(component.deshabilitarFormulario).toHaveBeenCalled();
  });

  it('no debería llamar a obtenerDetalleActoTramiteCaso si tieneActoTramiteCasoDocumento es falso', () => {
    spyOnProperty(component, 'tieneActoTramiteCasoDocumento', 'get').and.returnValue(false);
    spyOn(component, 'obtenerDetalleActoTramiteCaso');
    component.ngOnInit();
    expect(component.obtenerDetalleActoTramiteCaso).not.toHaveBeenCalled();
  });

  it('no debería llamar a deshabilitarFormulario si esPosibleEditarFormulario es verdadero', () => {
    spyOnProperty(component, 'esPosibleEditarFormulario', 'get').and.returnValue(true);
    spyOn(component, 'deshabilitarFormulario');
    component.ngOnInit();
    expect(component.deshabilitarFormulario).not.toHaveBeenCalled();
  });

  it('debería desuscribirse de todas las suscripciones en ngOnDestroy', () => {
    component['suscriptions'] = []
    component['suscriptions'].push(new Subscription())
    component.ngOnDestroy();
    expect(component.subscriptions).toEqual([])
  });

  it('debería retornar false si el formulario no es válido', () => {
    component.formAutoCitacionJuicio.get('agendasMultiples')?.setValue(null);
    const isValid = component.formularioValido;
    expect(isValid).toBeTrue();
  });

  it('debería retornar 0 si el valor de observacion es null', () => {
    const cantidad = component.cantidadCaracteresObservacion;
    expect(cantidad).toBe(0);
  });

  it('debería retornar la longitud de la cadena en observacion', () => {
    const textoObservacion = 'Este es un texto de prueba';
    component.formAutoCitacionJuicio.get('observacion')?.setValue(textoObservacion);
    const cantidad = component.cantidadCaracteresObservacion;
    expect(cantidad).toBe(textoObservacion.length);
  });

  it('debería retornar un array vacío si agendasMultiples está vacío', () => {
    component.formAutoCitacionJuicio.get('agendasMultiples')?.setValue([]);
    const agendas = component.agendasMultiplesActivas;
    expect(agendas).toEqual([]);
  });

  it('debería retornar solo las agendas activas', () => {
    const agendasMultiples: any[] = [
      { estadoAgendaFiscal: '1' },
      { estadoAgendaFiscal: '0' },
      { estadoAgendaFiscal: '1' }
    ];
    component.formAutoCitacionJuicio.get('agendasMultiples')?.setValue(agendasMultiples);
    const agendas = component.agendasMultiplesActivas;
    expect(agendas.length).toBe(2);
    expect(agendas).toEqual([{ estadoAgendaFiscal: '1' }, { estadoAgendaFiscal: '1' }]);
  });

  it('debería retornar true si tramiteEnModoEdicion es true', () => {
    component.tramiteEnModoEdicion = true;
    const resultado = component.esPosibleEditarFormulario;
    expect(resultado).toBeTrue();
  });


  it('debería obtener los detalles del acto de trámite y actualizar el formulario', () => {
    component.idActoTramiteProcesalEnlace = '2545FAF2AS5FAS5F5ASF5ASFEFWEF542';
    const mockResponse:any = { idEstadoTramite: 'activo' };
    mockCasoService.actoTramiteDetalleCaso.and.returnValue(of(mockResponse));
    component.obtenerDetalleActoTramiteCaso();
    expect(mockCasoService.actoTramiteDetalleCaso).toHaveBeenCalledWith(component.idActoTramiteProcesalEnlace);
    expect(component.idEstadoRegistro).toBe(mockResponse.idEstadoTramite);
    expect(component.formAutoCitacionJuicio.get('idActoTramiteCaso')?.value).toBe(component.idActoTramiteProcesalEnlace);
  });


  it('debería llamar a obtenerAutoCitacionJuicio si tramiteEstadoRecibido es true', () => {
    const mockResponse: any = { idEstadoTramite: 'activo' };
    mockCasoService.actoTramiteDetalleCaso.and.returnValue(of(mockResponse));
    spyOnProperty(component, 'tramiteEstadoRecibido', 'get').and.returnValue(true);
    spyOn(component, 'obtenerAutoCitacionJuicio');
    component.obtenerDetalleActoTramiteCaso();
    expect(component.obtenerAutoCitacionJuicio).toHaveBeenCalled();
  });

  it('debería obtener la auto citación y actualizar el formulario', () => {
    const mockResponse: any = { codigoCuadernoPrueba: 'ABC123' };
    mockAutoCitacionJuicioService.obtenerAutoCitacionJuicio.and.returnValue(of(mockResponse));
    component.obtenerAutoCitacionJuicio();
    expect(mockAutoCitacionJuicioService.obtenerAutoCitacionJuicio).toHaveBeenCalledWith(component.idActoTramiteProcesalEnlace);
    expect(component.formAutoCitacionJuicio.get('codigoCuadernoPrueba')?.touched).toBeTrue();
    expect(component.codigoCuadernoPruebaRespaldo).toBe(mockResponse.codigoCuadernoPrueba);
  });


  it('debería actualizar agendasMultiples y llamar a registrarAutoCitacionJuicio', () => {
    component.idCaso = 456;
    component.idActoTramiteProcesalEnlace = 123;
    spyOn(component, 'registrarAutoCitacionJuicio');
    const mockAgendas = [
      { idCaso: null, idActoTramiteCaso: null, fechaNotificacion: null }
    ];
    component.formAutoCitacionJuicio.get('agendasMultiples')?.setValue(mockAgendas);
    component.validarTramiteARegistrar();
    const updatedAgendas = component.formAutoCitacionJuicio.get('agendasMultiples')?.value;

    expect(updatedAgendas[0].idCaso).toBe(component.idCaso);
    expect(updatedAgendas[0].idActoTramiteCaso).toBe(component.idActoTramiteProcesalEnlace);
    expect(updatedAgendas[0].fechaNotificacion).toBe(component.formAutoCitacionJuicio.get('fechaNotificacion')?.value);
    expect(component.registrarAutoCitacionJuicio).toHaveBeenCalled();
  });

  it('debería registrar la auto citación y actualizar el estado', () => {
    const mockResponse: any = { success: true };
    mockAutoCitacionJuicioService.registrarAutoCitacionJuicio.and.returnValue(of(mockResponse));
    component.registrarAutoCitacionJuicio();
    expect(component.tramiteEnModoEdicion).toBeFalse();
    expect(component.idEstadoRegistro).toBe(ESTADO_REGISTRO.RECIBIDO);
  });


  it('debería establecer el valor de codigoCuadernoPrueba como null si el evento es false', () => {
    component.alCambiarIncorporaCuaderno(null); // Llama al método con un evento falsy
    expect(component.formAutoCitacionJuicio.get('codigoCuadernoPrueba')?.value).toBeNull();
  });

  it('debería establecer el valor de codigoCuadernoPrueba como codigoCuadernoPruebaRespaldo si el evento es true', () => {
    component.codigoCuadernoPruebaRespaldo = 'ABC123';
    component.alCambiarIncorporaCuaderno(true);
    expect(component.formAutoCitacionJuicio.get('codigoCuadernoPrueba')?.value).toBe(component.codigoCuadernoPruebaRespaldo);
  });

  it('debería llamar a validarTramiteARegistrar si la respuesta del diálogo es confirmada', () => {
    const dialogResponse = of(CfeDialogRespuesta.Confirmado);
    mockModalDialogService.question.and.returnValue(dialogResponse);
    spyOn(component, 'validarTramiteARegistrar');
    component.confirmarRegistroTramite();
    dialogResponse.subscribe((resp) => {
      expect(resp).toBe(CfeDialogRespuesta.Confirmado);
      expect(component.validarTramiteARegistrar).not.toHaveBeenCalled();
    });
  });



});
