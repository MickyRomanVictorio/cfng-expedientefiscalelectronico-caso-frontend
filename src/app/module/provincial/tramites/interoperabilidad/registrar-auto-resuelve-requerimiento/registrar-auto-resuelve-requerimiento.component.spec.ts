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

import { ResolucionAutoAcuerdoReparatorioService } from '@core/services/provincial/tramites/comun/preparatoria/resolucion-auto-acuerdo-reparatorio.service';
import { AutoAcuerdoReparatorio } from '@core/interfaces/provincial/tramites/comun/preparatoria/auto-acuerdo-reparatorio/auto-acuerdo-reparatorio.interface';
import { ESTADO_REGISTRO, RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib';
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { RegistrarAutoResuelveRequerimientoComponent } from './registrar-auto-resuelve-requerimiento.component';

fdescribe('RegistrarAutoResuelveRequerimientoComponent', () => {
  let component: any;
  let fixture: ComponentFixture<RegistrarAutoResuelveRequerimientoComponent>;

  const autoResuelveRequerimiento = {
    obtenerTramite: jasmine
      .createSpy('obtenerTramite')
      .and.returnValue(of({})),
    registrarAutoResuelveRequerimiento: jasmine
      .createSpy('registrarAutoResuelveRequerimiento')
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
      imports: [RegistrarAutoResuelveRequerimientoComponent],
      providers: [
        FormBuilder,
        provideHttpClient(withInterceptorsFromDi()),
        {
          provide: ResolucionAutoAcuerdoReparatorioService,
          useValue: autoResuelveRequerimiento,
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

    fixture = TestBed.createComponent(RegistrarAutoResuelveRequerimientoComponent);
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

  it('debería obtener detalle del acto tramite caso y llamar obtenerAutoResuelveRequerimiento si el estado es recibido', () => {
    component.idActoTramiteCaso = 'test-id'
    const mockResponse = { cantidadSujetosTramite: 5 };
    component.selectedSujetos.length = 5

    spyOn(component, 'obtenerAutoResuelveRequerimiento')

    component['obtenerDetalleActoTramiteCaso']()
    expect(component['obtenerAutoResuelveRequerimiento']).toHaveBeenCalled()
    expect(component.selectedSujetos.length).toBe(mockResponse.cantidadSujetosTramite);
})

  it('debería desuscribir todas las suscripciones en ngOnDestroy', () => {
    const suscripcion = {
      unsubscribe: jasmine.createSpy('unsubscribe'),
    } as any;
    component['suscripciones'].push(suscripcion);

    component.ngOnDestroy();

    expect(suscripcion.unsubscribe).toHaveBeenCalled();
  });


  describe('establecerValoresFormularioRecibido', () => {

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

  it('debería devolver true si el trámite tiene estado recibido', () => {
    component.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO
    expect(component.tramiteEstadoRecibido).toBeTrue();
  });

  it('debería devolver true si el formulario es válido', () => {
    component.formularioAutoReparatorio.setValue({
      idActoTramiteCaso: 'valor válido',
      fechaNotificacion: '123',
      observaciones: '123'
    });

    component.selectedSujetos = ['sujeto1', 'sujeto2'];
    expect(component.formularioValido).toBeFalse();
  });

  it('debe actualizar el formulario y llamar a obtenerAutoResuelveRequerimiento cuando se invoca obtenerDetalleActoTramiteCaso', () => {
    // Espiar el método obtenerAutoResuelveRequerimiento
    spyOn(component, 'obtenerAutoResuelveRequerimiento');

    // Crear un formulario para el componente
    component.formularioAutoResuelve.setValue({
      idActoTramiteCaso: '123',
      fechaNotificacion: '123',
      observaciones: '123'
    });

    // Asignar un valor a idActoTramiteCaso
    component['obtenerDetalleActoTramiteCaso']();

    // Verificamos que el valor del formulario se haya actualizado
    expect(component.formularioAutoResuelve.get('idActoTramiteCaso')?.value).toBe('');

    // Verificamos que el método obtenerAutoResuelveRequerimiento haya sido llamado
    expect(component.obtenerAutoResuelveRequerimiento).toHaveBeenCalled();
  });


describe('confirmarRegistroTramite', () => {
  it('debería llamar a registrarAutoResuelveRequerimiento si se confirma el diálogo', () => {
      const guardadoSpy = spyOn(component, 'registrarAutoResuelveRequerimiento')
      modalDialogServiceMock.question.and.returnValue(of(CfeDialogRespuesta.Confirmado))

      component['confirmarRegistroTramite']()

      expect(modalDialogServiceMock.question).toHaveBeenCalled()
      expect(guardadoSpy).toHaveBeenCalled()
  })

  it('no debería llamar a registrarAutoResuelveRequerimiento si el diálogo no es confirmado', () => {
      const guardadoSpy = spyOn(component, 'registrarAutoResuelveRequerimiento')
      modalDialogServiceMock.question.and.returnValue(of(CfeDialogRespuesta.Cancelado))

      component['confirmarRegistroTramite']()

      expect(modalDialogServiceMock.question).toHaveBeenCalled()
      expect(guardadoSpy).not.toHaveBeenCalled()
  })
})

   it('debería abrir el modal y llamar a recargarPagina cuando se confirma', () => {
    spyOn(component, 'recargarPagina');
        const mockRef = {
          onClose: of(RESPUESTA_MODAL.OK) // Simula la emisión de OK en onClose
        }
        dialogServiceMock.open.and.returnValue(mockRef as any)

        component.idCaso = 'casoTest'
        component.idEtapa = 'etapaTest'
        component.idActoTramiteCaso = 'actoTramiteTest'

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

});
