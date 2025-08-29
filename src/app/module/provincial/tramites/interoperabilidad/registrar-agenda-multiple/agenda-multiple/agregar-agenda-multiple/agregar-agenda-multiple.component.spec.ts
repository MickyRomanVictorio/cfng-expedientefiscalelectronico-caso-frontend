import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarAgendaMultipleComponent } from './agregar-agenda-multiple.component';
import { MaestroService } from '@core/services/shared/maestro.service';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { of, throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

describe('AgregarAgendaMultipleComponent', () => {
  let component: any;
  let fixture: ComponentFixture<AgregarAgendaMultipleComponent>;

  let mockMaestroService: jasmine.SpyObj<MaestroService>;
  let mockApiBaseService: jasmine.SpyObj<ApiBaseService>;
  let uuidSpy = jasmine.createSpy('uuidv4').and.returnValue('mock-uuid');
  let mockModalDialogService: jasmine.SpyObj<NgxCfngCoreModalDialogService>;

  beforeEach(async () => {
    mockModalDialogService = jasmine.createSpyObj(
      'NgxCfngCoreModalDialogService',
      ['question']
    );

    mockMaestroService = jasmine.createSpyObj('MaestroService', [
      'getDistritoJudicial',
      'getCatalogo',
      'getJuzgadosPorDistritoJudicial',
    ]);

    mockMaestroService.getDistritoJudicial.and.returnValue(
      of({
        data: [
          {
            id: 6,
            nombre: 'CALLAO',
          },
          {
            id: 7,
            nombre: 'HUAURA',
          },
        ],
      })
    );

    mockMaestroService.getCatalogo.and.returnValue(
      of({
        data: [
          {
            id: 1223,
            coDescripcion: 'VIRTUAL',
            noDescripcion: 'VIRTUAL',
          },
          {
            id: 1222,
            coDescripcion: 'PRESENCIAL',
            noDescripcion: 'PRESENCIAL',
          },
        ],
      })
    );

    mockMaestroService.getJuzgadosPorDistritoJudicial.and.returnValue(
      of({
        data: [
          {
            codEntidad: '5000001',
            descEntidad: 'SALA PENAL NACIONAL A',
            idTipoEntidad: 5,
          },
          {
            codEntidad: '5000002',
            descEntidad: 'SALA PENAL NACIONAL B',
            idTipoEntidad: 5,
          },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [AgregarAgendaMultipleComponent],
      providers: [
        { provide: MaestroService, useValue: mockMaestroService },
        { provide: ApiBaseService, useValue: mockApiBaseService },
        { provide: uuidv4, useValue: uuidSpy },
        {
          provide: NgxCfngCoreModalDialogService,
          useValue: mockModalDialogService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarAgendaMultipleComponent);
    component = fixture.componentInstance;
    component.modoLectura = false;
    component.formAgendaMultiple.patchValue({
      idRegistroTabla: 'id',
      idAgendaFiscal: '',
      fechaNotificacion: new Date(),
      fechaHoraAudicencia: new Date(),
      idTipoActividadAgenda: 1,
      tipoActividadAgenda: 'VIRTUAL',
      urlReunion: 'url',
      idDistritoPJ: 5,
      idJuzgadoPJ: '0',
      observacion: '',
      estadoAgendaFiscal: '1',
    });

    component.agendaNotificacion = {
      idJuzgadoPJ: '5000001',
    };

    fixture.detectChanges();
  });

  it('debería crearse componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería agregar una nueva agenda notification', () => {
    component.agregarAgendaNotificacion();
    expect(component.formAgendaMultiple.get('estadoAgendaFiscal')?.value).toBe(
      '1'
    );
    expect(component.agendasMultiples.length).toBe(1);
  });

  it('debería resetear el formulario despues de agregar una agenda notificacion', () => {
    component.resetearFormularioDespuesDeAgregar();

    expect(component.formAgendaMultiple.get('idRegistroTabla')?.value).toBe(
      null
    );
    expect(component.formAgendaMultiple.get('estadoAgendaFiscal')?.value).toBe(
      '1'
    );
  });

  it('debería llamar correctamente a listarDistritoPoderJudicial and listarTipoActividadAgenda al iniciar componente', () => {
    spyOn(component, 'listarDistritoPoderJudicial');
    spyOn(component, 'listarTipoActividadAgenda');

    component.ngOnInit();

    expect(component.listarDistritoPoderJudicial).toHaveBeenCalled();
    expect(component.listarTipoActividadAgenda).toHaveBeenCalled();
  });

  it('debería llamar a cargarDatosAgendaNotificacion si modoLectura es verdadero', () => {
    component.modoLectura = true;
    spyOn(component, 'cargarDatosAgendaNotificacion');
    component.listarDistritoPoderJudicial();
    expect(component.cargarDatosAgendaNotificacion).toHaveBeenCalled();
  });

  it('debería manejar correctamente el error y asignar un arreglo vacío a distritoPoderJudicial', () => {
    mockMaestroService.getDistritoJudicial.and.returnValue(
      throwError(() => new Error('Error en el servicio'))
    );
    component.listarDistritoPoderJudicial();
    expect(component.distritoPoderJudicial).toEqual([]);
  });

  it('debería asignar los valores de agendaNotificacion cuando modoLectura es verdadero', () => {
    // Configurar modoLectura a true
    component.formAgendaMultiple = new FormGroup({
      idTipoActividadAgenda: new FormControl(null),
      tipoActividadAgenda: new FormControl(null),
    });

    component.agendaNotificacion = {
      idTipoActividadAgenda: 1,
      tipoActividadAgenda: 'Actividad Normal',
    };

    component.ID_TIPO_ACTIVIDAD_AGENDA_VIRTUAL = 2;
    component.tipoActividadAgenda = [
      { id: 2, coDescripcion: 'Actividad Virtual' },
      { id: 3, coDescripcion: 'Actividad Presencial' },
    ];

    component.modoLectura = true;
    component.cargarDatosInicialesTipoActividad();
    expect(component.formAgendaMultiple.value).toEqual({
      idTipoActividadAgenda: component.agendaNotificacion.idTipoActividadAgenda,
      tipoActividadAgenda: component.agendaNotificacion.tipoActividadAgenda,
    });
  });

  it('debería manejar correctamente el error y asignar un arreglo vacío a getJuzgadosPorDistritoJudicial', () => {
    mockMaestroService.getJuzgadosPorDistritoJudicial.and.returnValue(
      throwError(() => new Error('Error en el servicio'))
    );
    component.listarJuzgadoPoderJudicial();
    expect(component.juzgadoPoderJudicial).toEqual([]);
  });

  it('debería llamar a patchValue si modoLectura es verdadero', () => {
    component.modoLectura = true;
    const patchValueSpy = spyOn(component.formAgendaMultiple, 'patchValue');
    const idDistritoPJ = 1;
    component.listarJuzgadoPoderJudicial(idDistritoPJ);
    expect(patchValueSpy).toHaveBeenCalledWith({
      idJuzgadoPJ: component.agendaNotificacion.idJuzgadoPJ,
    });
  });

  it('debería manejar correctamente el error y asignar un arreglo vacío a getCatalogo', () => {
    mockMaestroService.getCatalogo.and.returnValue(
      throwError(() => new Error('Error en el servicio'))
    );
    component.listarTipoActividadAgenda();
    expect(component.tipoActividadAgenda).toEqual([]);
  });

  it('debería deshabilitarse formulario cuando modoLectura cambie a true', () => {
    component.ngOnChanges({ modoLectura: { currentValue: true } });
    expect(
      component.formAgendaMultiple.get('fechaHoraAudicencia')?.disabled
    ).toBeTrue();
  });

  it('debería retornar "Aceptar" cuando modoLectura es true', () => {
    component.modoLectura = true;
    expect(component.textoAccionARealizar).toBe('Aceptar');
  });

  it('debería retornar "Agregar" cuando modoLectura es false', () => {
    component.modoLectura = false;
    expect(component.textoAccionARealizar).toBe('Agregar');
  });

  it('debería retornar true cuando formulario es correcto', () => {
    component.formAgendaMultiple
      .get('fechaHoraAudicencia')
      ?.setValue('2024-10-10T10:00:00');
    component.formAgendaMultiple.get('idTipoActividadAgenda')?.setValue(1);
    component.formAgendaMultiple
      .get('urlReunion')
      ?.setValue('http://texto.prueba.com');
    component.formAgendaMultiple.get('idDistritoPJ')?.setValue(5);
    component.formAgendaMultiple.get('idJuzgadoPJ')?.setValue('5000001');
    expect(component.formularioValido).toBeTrue();
  });

  it('debería retornar false cuando formulario es incorrecto', () => {
    component.formAgendaMultiple.get('fechaHoraAudicencia')?.setValue(null); // Campo requerido
    expect(component.formularioValido).toBeFalse();
  });

  it('debería actualizar los valores del formulario cuando agendaNotificacion es indicado', () => {
    component.agendaNotificacion = {
      fechaHoraAudicencia: new Date(),
      urlReunion: 'http://example.com',
      observacion: 'Observación',
      idDistritoPJ: 5,
      idJuzgadoPJ: '5000001',
    };

    component.cargarDatosAgendaNotificacion();
    expect(
      component.formAgendaMultiple.get('fechaHoraAudicencia')?.value
    ).toEqual(component.agendaNotificacion.fechaHoraAudicencia);
    expect(component.formAgendaMultiple.get('urlReunion')?.value).toEqual(
      component.agendaNotificacion.urlReunion
    );
  });

  it('debería llamar a abrirModalFechaHoraDuplicado si fechaHoraAudienciaDuplicado es true', () => {
    spyOn(component, 'abrirModalFechaHoraDuplicado');
    component.agendasMultiples = [{ fechaHoraAudicencia: new Date() }];
    component.formAgendaMultiple
      .get('fechaHoraAudicencia')
      ?.setValue(new Date());

    component.validarAgregarAgendaNotificacion();
    expect(component.abrirModalFechaHoraDuplicado).toHaveBeenCalled();
  });

  it('debería llamar a agregarAgendaNotificacion si fechaHoraAudienciaDuplicado es false', () => {
    spyOn(component, 'agregarAgendaNotificacion');
    component.agendasMultiples = [
      { fechaHoraAudicencia: new Date().getDate() + 1 },
    ];
    component.formAgendaMultiple
      .get('fechaHoraAudicencia')
      ?.setValue(new Date());

    component.validarAgregarAgendaNotificacion();
    expect(component.agregarAgendaNotificacion).toHaveBeenCalled();
  });

  it('debería llamar a agregarAgendaNotificacion cuando se confirma modal', () => {
    spyOn(component, 'agregarAgendaNotificacion');
    const dialogResponse = of(CfeDialogRespuesta.Confirmado);
    mockModalDialogService.question.and.returnValue(dialogResponse);

    component.abrirModalFechaHoraDuplicado();
    dialogResponse.subscribe((data) => {
      expect(component.agregarAgendaNotificacion).not.toHaveBeenCalled();
    });
  });

  it('debería actualizar el campo tipoActividadAgenda y limpiar urlReunion si no es una actividad virtual', () => {
    const setValueSpy = spyOn(
      component.formAgendaMultiple.get('tipoActividadAgenda'),
      'setValue'
    ).and.callThrough();
    const urlReunionSpy = spyOn(
      component.formAgendaMultiple.get('urlReunion'),
      'setValue'
    ).and.callThrough();

    component.tipoActividadAgenda = [
      { id: 1, coDescripcion: 'Actividad Física' },
      { id: 2, coDescripcion: 'Actividad Virtual' },
    ];
    const event = { value: 1 };
    component.ID_TIPO_ACTIVIDAD_AGENDA_VIRTUAL = 2;
    component.alCambiarTipoActividadAgenda(event);
    expect(setValueSpy).toHaveBeenCalledWith('Actividad Física');
    expect(urlReunionSpy).toHaveBeenCalledWith(null);
  });

  it('debería retornar 0 si observacion es null', () => {
    component.formAgendaMultiple = new FormGroup({
      observacion: new FormControl(null),
    });
    expect(component.cantidadCaracteresObservacion).toBe(0);
  });

  it('debería retornar la cantidad de caracteres cuando observacion tiene un valor', () => {
    component.formAgendaMultiple = new FormGroup({
      observacion: new FormControl('Prueba de observación'),
    });
    expect(component.cantidadCaracteresObservacion).toBe(21);
  });

  it('debería agregar el validador requerido si mostrarFechaNotificacion es true', () => {
    component.mostrarFechaNotificacion = true;
    const setValidatorsSpy = spyOn(
      component.formAgendaMultiple.get('fechaNotificacion'),
      'setValidators'
    ).and.callThrough();
    const updateValiditySpy = spyOn(
      component.formAgendaMultiple.get('fechaNotificacion'),
      'updateValueAndValidity'
    ).and.callThrough();
    component.opcionesDelFormulario();
    expect(setValidatorsSpy).toHaveBeenCalledWith([Validators.required]);
    expect(updateValiditySpy).toHaveBeenCalled();
  });

  it('debería llamar a listarJuzgadoPoderJudicial con el valor correcto', () => {
    spyOn(component, 'listarJuzgadoPoderJudicial');
    const event = { value: 1 };
    component.alCambiarDistritoJudicial(event);
    expect(component.listarJuzgadoPoderJudicial).toHaveBeenCalledWith(1);
  });
});
