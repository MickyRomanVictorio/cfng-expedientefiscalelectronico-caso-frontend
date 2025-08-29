import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormBuilder, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import { of } from 'rxjs';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { RegistrarAutoAcuerdoReparatorioComponent } from './registrar-auto-acuerdo-reparatorio.component';
import { ResolucionAutoAcuerdoReparatorioService } from '@core/services/provincial/tramites/comun/preparatoria/resolucion-auto-acuerdo-reparatorio.service';
import { AutoAcuerdoReparatorio } from '@core/interfaces/provincial/tramites/comun/preparatoria/auto-acuerdo-reparatorio/auto-acuerdo-reparatorio.interface';
import { RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib';
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';

describe('RegistrarAutoAcuerdoReparatorioComponent', () => {
  let component: any;
  let fixture: ComponentFixture<RegistrarAutoAcuerdoReparatorioComponent>;
  
  const autoReparatorioServiceMock = {
    obtenerAutoAcuerdoReparatorio: jasmine
      .createSpy('obtenerAutoAcuerdoReparatorio')
      .and.returnValue(of({})),
    registrarAutoAcuerdoReparatorio: jasmine
      .createSpy('registrarAutoAcuerdoReparatorio')
      .and.returnValue(of({})),
  };

  let modalDialogServiceMock: jasmine.SpyObj<NgxCfngCoreModalDialogService>;

  const dialogServiceMock = {
    open: jasmine.createSpy('open').and.returnValue({ onClose: of('') }),
  };

  const casoServiceMock = {
    actoTramiteDetalleCaso: jasmine
      .createSpy('actoTramiteDetalleCaso')
      .and.returnValue(of({})),
  };

  const gestionCasoServiceMock = {
    obtenerCasoFiscal: jasmine
      .createSpy('obtenerCasoFiscal')
      .and.returnValue(of({})),
  };

  const dataAcuerdoReparatorio = { 
    idActoTramiteCaso: '1',
    fechaNotificacion: 'fecha',
    observaciones: '1',
  }

  beforeEach(async () => {
    modalDialogServiceMock = jasmine.createSpyObj(
      'NgxCfngCoreModalDialogService',
      ['success', 'question', 'info', 'error', 'warning']
    );

    await TestBed.configureTestingModule({
      imports: [RegistrarAutoAcuerdoReparatorioComponent],
      providers: [
        FormBuilder,
        provideHttpClient(withInterceptorsFromDi()),
        {
          provide: ResolucionAutoAcuerdoReparatorioService,
          useValue: autoReparatorioServiceMock,
        },
        { provide: DialogService, useValue: dialogServiceMock },
        {
          provide: NgxCfngCoreModalDialogService,
          useValue: modalDialogServiceMock,
        },
        { provide: Casos, useValue: casoServiceMock },
        { provide: GestionCasoService, useValue: gestionCasoServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarAutoAcuerdoReparatorioComponent);
    component = fixture.componentInstance;

    component.modalDialogService = modalDialogServiceMock;
    component.dialogService = dialogServiceMock;

    fixture.detectChanges();

    spyOn(
      component,
      'establecerValoresFormularioRecibido'
    ).and.callThrough();

    component.formularioAutoReparatorio = new FormBuilder().group({
      idActoTramiteCaso: ['', [Validators.required]],
      fechaNotificacion: ['', [Validators.required]],
      observaciones: ['', [Validators.required, Validators.minLength(3)]],
    });

  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería construir el formulario correctamente', () => {
    expect(component['formularioAutoReparatorio']).toBeDefined();
    expect(
      component['formularioAutoReparatorio'].controls['idActoTramiteCaso']
    ).toBeDefined();
    expect(
      component['formularioAutoReparatorio'].controls['fechaNotificacion']
    ).toBeDefined();
    expect(
      component['formularioAutoReparatorio'].controls['observaciones']
    ).toBeDefined();
  });

  it('debería llamar a obtenerDetalleActoTramiteCaso si tieneActoTramiteCasoDocumento es true', () => {
    spyOn(component, 'obtenerDetalleActoTramiteCaso');
    Object.defineProperty(component, 'tieneActoTramiteCasoDocumento', { get: () => true })

    component.ngOnInit();

    expect(component.obtenerDetalleActoTramiteCaso).toHaveBeenCalled();
  });

  it('debería llamar a deshabilitarFormulario si esPosibleEditarFormulario es false', () => {
    spyOn(component, 'deshabilitarFormulario');
    Object.defineProperty(component, 'esPosibleEditarFormulario', { get: () => false })

    component.ngOnInit();

    expect(component.deshabilitarFormulario).toHaveBeenCalled();
  });

  it('debería desuscribir todas las suscripciones en ngOnDestroy', () => {
    const suscripcion = {
      unsubscribe: jasmine.createSpy('unsubscribe'),
    } as any;
    component['suscripciones'].push(suscripcion);

    component.ngOnDestroy();

    expect(suscripcion.unsubscribe).toHaveBeenCalled();
  });

  describe('deshabilitarFormulario', () => {
    it('debería deshabilitar todo el formulario', () => {
      // Llamamos al método privado usando un acceso indirecto
      component['deshabilitarFormulario']();

      // Verificamos si el formulario está deshabilitado
      expect(component.formularioAutoReparatorio.disabled).toBeTrue(); // Verificamos si el formulario está deshabilitado

      // También podemos comprobar si los controles individuales están deshabilitados
      expect(component.formularioAutoReparatorio.get('observaciones')?.disabled).toBeTrue();
    });
  });

  describe('establecerValoresFormularioRecibido', () => {

    it('debería establecer los valores del formulario correctamente', () => {
      Object.defineProperty(component, 'esPosibleEditarFormulario ', { get: () => true })
      const data: AutoAcuerdoReparatorio = {
        idActoTramiteCaso: '123',
        fechaNotificacion: '2025-01-01',
        observaciones: 'Observación de prueba'
      };

      // Llamamos al método privado usando un acceso indirecto
      component['establecerValoresFormularioRecibido'](data);

      // Verificamos que los valores fueron correctamente asignados
      expect(component.formularioAutoReparatorio.get('idActoTramiteCaso')?.value).toBe(data.idActoTramiteCaso);
      expect(component.formularioAutoReparatorio.get('fechaNotificacion')?.value).toBe(data.fechaNotificacion);
      expect(component.formularioAutoReparatorio.get('observaciones')?.value).toBe(data.observaciones);
    });

    it('no debería deshabilitar el formulario si esPosibleEditarFormulario es true', () => {
      Object.defineProperty(component, 'esPosibleEditarFormulario ', { get: () => true })
      const data: AutoAcuerdoReparatorio = {
        idActoTramiteCaso: '123',
        fechaNotificacion: '2025-01-01',
        observaciones: 'Observación de prueba'
      };

      // Llamamos al método privado
      component['establecerValoresFormularioRecibido'](data);

      // Verificamos que el formulario no esté deshabilitado
      expect(component.formularioAutoReparatorio.disabled).toBeFalse();
    });

    it('debería deshabilitar el formulario si esPosibleEditarFormulario es false', () => {
      Object.defineProperty(component, 'esPosibleEditarFormulario ', { get: () => false })

      const data: AutoAcuerdoReparatorio = {
        idActoTramiteCaso: '123',
        fechaNotificacion: '2025-01-01',
        observaciones: 'Observación de prueba'
      };

      // Llamamos al método privado
      component['establecerValoresFormularioRecibido'](data);

      // Verificamos que el formulario esté deshabilitado
      expect(component.formularioAutoReparatorio.disabled).toBeFalse();
    });
  });

  it('debería devolver 0 si el formulario observaciones es null', () => {
    component.formularioAutoReparatorio.setValue({
      idActoTramiteCaso: 'valor válido',
      fechaNotificacion: '123',
      observaciones: null
    });
    expect(component.cantidadCaracteresObservacion).toBe(0);
  });

  it('debería devolver true si el formulario es válido', () => {
    component.formularioAutoReparatorio.setValue({
      idActoTramiteCaso: 'valor válido',
      fechaNotificacion: '123',
      observaciones: '123'
    });
    expect(component.formularioValido).toBeTrue();
  });

  it('debería obtener detalle del acto tramite caso y llamar obtenerAutoAcuerdoReparatorio si el estado es recibido', () => {
    const detalleCasoResp = { idEstadoTramite: 963 }
    component.idActoTramiteCasoMesa = 'test-id'
    casoServiceMock.actoTramiteDetalleCaso.and.returnValue(of(detalleCasoResp))

    spyOn(component, 'obtenerAutoAcuerdoReparatorio')
    
    component['obtenerDetalleActoTramiteCaso']()

    expect(casoServiceMock.actoTramiteDetalleCaso).toHaveBeenCalledWith('test-id')
    expect(component['idEstadoRegistro']).toBe(detalleCasoResp.idEstadoTramite)
    expect(component['obtenerAutoAcuerdoReparatorio']).toHaveBeenCalled()
})

describe('confirmarRegistroTramite', () => {
  it('debería llamar a registrarAutoAcuerdoReparatorio si se confirma el diálogo', () => {
      const guardadoSpy = spyOn(component, 'registrarAutoAcuerdoReparatorio')
      modalDialogServiceMock.question.and.returnValue(of(CfeDialogRespuesta.Confirmado))

      component['confirmarRegistroTramite']()

      expect(modalDialogServiceMock.question).toHaveBeenCalled()
      expect(guardadoSpy).toHaveBeenCalled()
  })

  it('no debería llamar a registrarAutoAcuerdoReparatorio si el diálogo no es confirmado', () => {
      const guardadoSpy = spyOn(component, 'registrarAutoAcuerdoReparatorio')
      modalDialogServiceMock.question.and.returnValue(of(CfeDialogRespuesta.Cancelado))

      component['confirmarRegistroTramite']()

      expect(modalDialogServiceMock.question).toHaveBeenCalled()
      expect(guardadoSpy).not.toHaveBeenCalled()
  })
})

it('debería llamar a obtenerAutoAcuerdoReparatorio y establecer valores en el formulario', () => {
  const mockResponse = dataAcuerdoReparatorio

  autoReparatorioServiceMock.obtenerAutoAcuerdoReparatorio.and.returnValue(of(mockResponse))
  
  component['obtenerAutoAcuerdoReparatorio']()
  
  expect(autoReparatorioServiceMock.obtenerAutoAcuerdoReparatorio).toHaveBeenCalledWith(component.idActoTramiteCasoMesa)
  
  expect(component['establecerValoresFormularioRecibido']).toHaveBeenCalledWith(mockResponse)
})

   it('debería abrir el modal y llamar a recargarPagina cuando se confirma', () => {
    spyOn(component, 'recargarPagina');
        const mockRef = {
          onClose: of(RESPUESTA_MODAL.OK) // Simula la emisión de OK en onClose
        }
        dialogServiceMock.open.and.returnValue(mockRef as any)
    
        component.idCaso = 'casoTest'
        component.idEtapa = 'etapaTest'
        component.idActoTramiteCasoMesa = 'actoTramiteTest'
    
        component['modalActualizarActoYTramite']()
    
        expect(dialogServiceMock.open).toHaveBeenCalledWith(GuardarTramiteProcesalComponent, {
          showHeader: false,
          data: {
            tipo: 2,
            idCaso: 'casoTest',
            idEtapa: 'etapaTest',
            idActoTramiteCaso: 'actoTramiteTest',
          }
        })
        
        expect(component['recargarPagina']).toHaveBeenCalled()
      })
      describe('registrarAutoAcuerdoReparatorio', () => {

        it('debería guardar registrarAutoAcuerdoReparatorio y actualizar el estado del formulario', fakeAsync(() => {
            const datosFormulario = { idActoTramiteCaso: '1', fechaNotificacion: 'fechaNotificacion', observaciones: 'observaciones'};
            component['formularioAutoReparatorio'] = { getRawValue: () => datosFormulario } as any;
            autoReparatorioServiceMock.registrarAutoAcuerdoReparatorio.and.returnValue(of({}))
            
            // Configura el mock para el método que se llama en el método real
            gestionCasoServiceMock.obtenerCasoFiscal.and.returnValue(of({}))
        
            spyOn(component, 'deshabilitarFormulario');
        
            component['registrarAutoAcuerdoReparatorio']()
            tick()
        
            expect(autoReparatorioServiceMock.registrarAutoAcuerdoReparatorio).toHaveBeenCalledWith(
              component.formularioAutoReparatorio.value
            )
            expect(component['deshabilitarFormulario']).toHaveBeenCalled()
            expect(component.tramiteEnModoEdicion).toBeFalse()
        }))

    })
});
