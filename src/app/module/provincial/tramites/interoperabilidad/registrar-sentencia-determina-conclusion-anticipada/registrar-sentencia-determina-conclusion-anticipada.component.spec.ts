import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing'
import { RegistrarSentenciaDeterminaConclusionAnticipadaComponent } from './registrar-sentencia-determina-conclusion-anticipada.component'
import { FormBuilder } from '@angular/forms'
import { MaestroService } from '@core/services/shared/maestro.service'
import { ConclusionAnticipadaService } from '@core/services/provincial/tramites/interoperabilidad/conclusion-anticipada/auto-rechaza-conclusion-anticipada/conclusion-anticipada.service'
import { DialogService } from 'primeng/dynamicdialog'
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { of, throwError } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service'
import { TIPO_ACCION } from '@core/types/tipo-accion.type'
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component'
import { RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'

fdescribe('RegistrarSentenciaDeterminaConclusionAnticipadaComponent', () => {

    let component: RegistrarSentenciaDeterminaConclusionAnticipadaComponent
    let fixture: ComponentFixture<RegistrarSentenciaDeterminaConclusionAnticipadaComponent>

    const maestroServiceMock = {
        obtenerCatalogo: jasmine.createSpy('obtenerCatalogo').and.returnValue(of({ data: [] }))
    }

    const conclusionAnticipadaServiceMock = {
        obtenerSentenciaDeterminaConclusionAnticipada: jasmine.createSpy('obtenerSentenciaDeterminaConclusionAnticipada').and.returnValue(of({})),
        obtenerPenasRegistradas: jasmine.createSpy('obtenerPenasRegistradas').and.returnValue(of([])),
        eliminarPena: jasmine.createSpy('eliminarPena').and.returnValue(of({ code: '0' })),
        validarNoExisteReparacionCivil: jasmine.createSpy('validarNoExisteReparacionCivil').and.returnValue(of({})),
        guardarSentenciaDeterminaConclusionAnticipada: jasmine.createSpy('guardarSentenciaDeterminaConclusionAnticipada').and.returnValue(of({})),
        eliminarMasivamenteReparacionCivil: jasmine.createSpy('eliminarMasivamenteReparacionCivil').and.returnValue(of({})),
    }

    let modalDialogServiceMock: jasmine.SpyObj<NgxCfngCoreModalDialogService>

    const dialogServiceMock = {
        open: jasmine.createSpy('open').and.returnValue({ onClose: of('') })
    }
    
    const casoServiceMock = {
        actoTramiteDetalleCaso: jasmine.createSpy('actoTramiteDetalleCaso').and.returnValue(of({}))
    }

    const dataSentenciaConclusion = { 
        idResultado: 1,
        fechaNotificacion: 'fecha',
        conAudio: '1',
        conVideo: '1',
        observaciones: '',
        idTipoSentencia: 1,
        conReparacionCivil: '0'
    }

    const gestionCasoServiceMock = {
        obtenerCasoFiscal: jasmine.createSpy('obtenerCasoFiscal').and.returnValue(of({}))
    }

    beforeEach(async () => {

        modalDialogServiceMock = jasmine.createSpyObj('NgxCfngCoreModalDialogService', ['success', 'question', 'info', 'error', 'warning'])

        await TestBed.configureTestingModule({
        imports: [RegistrarSentenciaDeterminaConclusionAnticipadaComponent],
        providers: [
            FormBuilder,
            provideHttpClient(withInterceptorsFromDi()),
            { provide: MaestroService, useValue: maestroServiceMock },
            { provide: ConclusionAnticipadaService, useValue: conclusionAnticipadaServiceMock },
            { provide: DialogService, useValue: dialogServiceMock },
            { provide: NgxCfngCoreModalDialogService, useValue: modalDialogServiceMock },
            { provide: Casos, useValue: casoServiceMock },
            { provide: GestionCasoService, useValue: gestionCasoServiceMock },
        ]
        }).compileComponents()

        fixture = TestBed.createComponent(RegistrarSentenciaDeterminaConclusionAnticipadaComponent)
        component = fixture.componentInstance;

        (component as any).modalDialogService = modalDialogServiceMock;
        (component as any).dialogService = dialogServiceMock;

        fixture.detectChanges()

        spyOn(component as any, 'establecerValoresFormularioRecibido').and.callThrough()
        spyOn(component as any, 'recargarPagina')
    })

    it('debería crear el componente', () => {
        expect(component).toBeTruthy()
    })

    it('debería construir el formulario correctamente', () => {
        expect(component['formularioSetencia']).toBeDefined()
        expect(component['formularioSetencia'].controls['resultado']).toBeDefined()
        expect(component['formularioSetencia'].controls['fechaNotificacion']).toBeDefined()
        expect(component['formularioSetencia'].controls['cuentaConAudio']).toBeDefined()
        expect(component['formularioSetencia'].controls['cuentaConVideo']).toBeDefined()
        expect(component['formularioSetencia'].controls['idTipoSentencia']).toBeDefined()
        expect(component['formularioSetencia'].controls['reparacionCivil']).toBeDefined()
    })

    it('debería inicializar correctamente las propiedades al llamar a ngOnInit', () => {
        spyOn((component as any), 'listarPenas')
        spyOn((component as any), 'obtenerTipoSentencia')
        spyOn((component as any), 'obtenerTipoResultadosSentencia')

        component.ngOnInit()

        expect(component['listarPenas']).toHaveBeenCalled()
        expect(component['obtenerTipoResultadosSentencia']).toHaveBeenCalled()
        expect(component['obtenerTipoSentencia']).toHaveBeenCalled()
    })

    it('debería desuscribir todas las suscripciones en ngOnDestroy', () => {
        const suscripcion = { unsubscribe: jasmine.createSpy('unsubscribe') } as any
        component['suscripciones'].push(suscripcion)

        component.ngOnDestroy()

        expect(suscripcion.unsubscribe).toHaveBeenCalled()
    })

    it('debería retornar true en esFormularioValido si el formulario es válido', () => {
        component['formularioSetencia'].controls['resultado'].setValue(1)
        component['formularioSetencia'].controls['fechaNotificacion'].setValue(new Date())
        component['formularioSetencia'].controls['idTipoSentencia'].setValue(1334)
        component['listaPenas'] = [{ id: 1 }]

        expect(component.esFormularioValido).toBeTrue()
    })

    it('debería obtener y establecer los tipos de resultados de sentencia', () => {
        maestroServiceMock.obtenerCatalogo.and.returnValue(of({ data: [{ id: 1, noDescripcion: 'Resultado 1' }] }))

        component['obtenerTipoResultadosSentencia']()

        expect(maestroServiceMock.obtenerCatalogo).toHaveBeenCalled()
        expect(component['tiposResultado']).toEqual([{ codigo: 1, nombre: 'Resultado 1' }])
    })

    it('debería deshabilitar el formulario si no es posible editar', () => {
        spyOn(component['formularioSetencia'], 'disable')
        Object.defineProperty(component, 'esPosibleEditarFormulario', { get: () => false })

        component['deshabilitarFormulario']()

        expect(component['formularioSetencia'].disable).toHaveBeenCalled()
    })

    it('debería retornar true para esSentenciaCondenatoria cuando idTipoSentencia es SENTENCIA_CONDENATORIA', () => {
        component['formularioSetencia'].get('idTipoSentencia')?.setValue(1334)
        
        expect(component.esSentenciaCondenatoria).toBeTrue()
    })

    it('debería retornar false para esSentenciaCondenatoria cuando idTipoSentencia no es SENTENCIA_CONDENATORIA', () => {
        component['formularioSetencia'].get('idTipoSentencia')?.setValue(1335)
        
        expect(component.esSentenciaCondenatoria).toBeFalse()
    })

    it('debería retornar true para tieneReparacionCivil cuando reparacionCivil es verdadero', () => {
        component['formularioSetencia'].get('reparacionCivil')?.setValue(true)
        
        expect(component.tieneReparacionCivil).toBeTrue()
    })

    it('debería retornar false para tieneReparacionCivil cuando reparacionCivil es falso', () => {
        component['formularioSetencia'].get('reparacionCivil')?.setValue(false)
        
        expect(component.tieneReparacionCivil).toBeFalse()
    })

    it('debería obtener detalle del acto tramite caso y llamar obtenerSentenciaDeterminaConclusionAnticipada si el estado es recibido', () => {
        const detalleCasoResp = { idEstadoTramite: 963 }
        component.idActoTramiteProcesalEnlace = 'test-id'
        casoServiceMock.actoTramiteDetalleCaso.and.returnValue(of(detalleCasoResp))
    
        spyOn(component as any, 'obtenerSentenciaDeterminaConclusionAnticipada')
        
        component['obtenerDetalleActoTramiteCaso']()
    
        expect(casoServiceMock.actoTramiteDetalleCaso).toHaveBeenCalledWith('test-id')
        expect(component['idEstadoRegistro']).toBe(detalleCasoResp.idEstadoTramite)
        expect(component['obtenerSentenciaDeterminaConclusionAnticipada']).toHaveBeenCalled()
    })

    it('debería llamar a obtenerSentenciaDeterminaConclusionAnticipada y establecer valores en el formulario', () => {
        const mockResponse = dataSentenciaConclusion

        conclusionAnticipadaServiceMock.obtenerSentenciaDeterminaConclusionAnticipada.and.returnValue(of(mockResponse))
        
        component['obtenerSentenciaDeterminaConclusionAnticipada']()
        
        expect(conclusionAnticipadaServiceMock.obtenerSentenciaDeterminaConclusionAnticipada).toHaveBeenCalledWith(component.idActoTramiteProcesalEnlace)
        
        expect(component['establecerValoresFormularioRecibido']).toHaveBeenCalledWith(mockResponse)
    })

    describe('respuestaFormularioPena', () => {

        it('debería llamar a listarPenas si data.respuesta es verdadero', () => {
            spyOn((component as any), 'listarPenas')

            const testData = { respuesta: true }
            component['respuestaFormularioPena'](testData)

            expect((component as any).listarPenas).toHaveBeenCalled()
        })

        it('no debería llamar a listarPenas si data.respuesta es falso', () => {
            spyOn((component as any), 'listarPenas')

            const testData = { respuesta: false }
            component['respuestaFormularioPena'](testData)

            expect((component as any).listarPenas).not.toHaveBeenCalled()
        })

        it('debería establecer mostrarModalVerEditar en false si la acción es VISUALIZAR o EDITAR', () => {
            component['accionPena'] = TIPO_ACCION.VISUALIZAR
            component['mostrarModalVerEditar'] = true

            component['respuestaFormularioPena']({ respuesta: true })

            expect(component['mostrarModalVerEditar']).toBeFalse()

            component['accionPena'] = TIPO_ACCION.EDITAR
            component['mostrarModalVerEditar'] = true

            component['respuestaFormularioPena']({ respuesta: true })

            expect(component['mostrarModalVerEditar']).toBeFalse()
        })

        it('no debería cambiar mostrarModalVerEditar si la acción no es VISUALIZAR ni EDITAR', () => {
            component['accionPena'] = TIPO_ACCION.CREAR
            component['mostrarModalVerEditar'] = true

            component['respuestaFormularioPena']({ respuesta: true })

            expect(component['mostrarModalVerEditar']).toBeTrue()
        })
    })

    describe('abrirVerEditarModal', () => {

        it('debería establecer mostrarModalVerEditar en true y asignar los valores correctos', () => {
            const id = 'test-id'
            const idPena = 'SDSA12321321SADSA'
            const accion = TIPO_ACCION.EDITAR

            component['abrirVerEditarModal'](id, idPena, accion)

            expect(component['mostrarModalVerEditar']).toBeTrue()
            expect(component['accionPena']).toBe(accion)
            expect(component['idActoTramiteDelitoSujeto']).toBe(id)
        })

    })

    it('debería eliminar la reparación civil masivamente y mostrar un mensaje de éxito', () => {

        component.idActoTramiteProcesalEnlace = '12345'
        conclusionAnticipadaServiceMock.eliminarMasivamenteReparacionCivil.and.returnValue(of(null))

        const mostrarMensajeDeExitoSpy = spyOn((component as any), 'mostrarMensajeDeExito')

        component['eliminarReparacionCivilMasiva']()

        expect(conclusionAnticipadaServiceMock.eliminarMasivamenteReparacionCivil).toHaveBeenCalledWith('12345')
        expect(mostrarMensajeDeExitoSpy).toHaveBeenCalledWith('Reparación civil eliminada', 'Se eliminó correctamente la información de las reparaciones civiles registradas.')
    })

    it('debería llamar a modalDialogService.success con los parámetros correctos', () => {
        const titulo = 'Operación Exitosa';
        const descripcion = 'La operación se completó correctamente.';
        const textoBotonConfirmar = 'Aceptar';
    
        (component as any).mostrarMensajeDeExito(titulo, descripcion, textoBotonConfirmar)
    
        expect(modalDialogServiceMock.success).toHaveBeenCalledWith(titulo, descripcion, textoBotonConfirmar)
      })
    
      it('debería llamar a modalDialogService.success sin textoBotonConfirmar', () => {
        const titulo = 'Operación Exitosa';
        const descripcion = 'La operación se completó correctamente.';
    
        (component as any).mostrarMensajeDeExito(titulo, descripcion)
    
        expect(modalDialogServiceMock.success).toHaveBeenCalledWith(titulo, descripcion, undefined)
      })

      it('debería abrir el modal y llamar a recargarPagina cuando se confirma', () => {
        
        const mockRef = {
          onClose: of(RESPUESTA_MODAL.OK) // Simula la emisión de OK en onClose
        }
        dialogServiceMock.open.and.returnValue(mockRef as any)
    
        component.idCaso = 'casoTest'
        component.idEtapa = 'etapaTest'
        component.idActoTramiteProcesalEnlace = 'actoTramiteTest'
    
        component['abrirModalSeleccionarTramite']()
    
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
    
      it('no debería llamar a recargarPagina cuando no se confirma', () => {
        const mockRef = {
          onClose: of('OTHER_RESPONSE')
        }
        dialogServiceMock.open.and.returnValue(mockRef as any)
    
        component['abrirModalSeleccionarTramite']()
    
        expect(dialogServiceMock.open).toHaveBeenCalled()
        expect(component['recargarPagina']).not.toHaveBeenCalled()
      })


    describe('preguntarGuardadoSentenciaDeterminaConclusionAnticipada', () => {
        it('debería llamar a guardadoSentenciaDeterminaConclusionAnticipada si se confirma el diálogo', () => {
            const guardadoSpy = spyOn(component as any, 'guardadoSentenciaDeterminaConclusionAnticipada')
            modalDialogServiceMock.question.and.returnValue(of(CfeDialogRespuesta.Confirmado))

            component['preguntarGuardadoSentenciaDeterminaConclusionAnticipada']()

            expect(modalDialogServiceMock.question).toHaveBeenCalled()
            expect(guardadoSpy).toHaveBeenCalled()
        })

        it('no debería llamar a guardadoSentenciaDeterminaConclusionAnticipada si el diálogo no es confirmado', () => {
            const guardadoSpy = spyOn(component as any, 'guardadoSentenciaDeterminaConclusionAnticipada')
            modalDialogServiceMock.question.and.returnValue(of(CfeDialogRespuesta.Cancelado))

            component['preguntarGuardadoSentenciaDeterminaConclusionAnticipada']()

            expect(modalDialogServiceMock.question).toHaveBeenCalled()
            expect(guardadoSpy).not.toHaveBeenCalled()
        })
    })

    describe('guardadoSentenciaDeterminaConclusionAnticipada', () => {

        it('debería guardar la sentencia y actualizar el estado del formulario', fakeAsync(() => {
            const datosFormulario = { resultado: 1, fechaNotificacion: new Date(), cuentaConAudio: true, cuentaConVideo: false, idTipoSentencia: 1334 };
            component['formularioSetencia'] = { getRawValue: () => datosFormulario } as any;
            conclusionAnticipadaServiceMock.guardarSentenciaDeterminaConclusionAnticipada.and.returnValue(of({}))
            
            // Configura el mock para el método que se llama en el método real
            gestionCasoServiceMock.obtenerCasoFiscal.and.returnValue(of({}))
        
            spyOn(component as any, 'deshabilitarFormulario');
        
            component['guardadoSentenciaDeterminaConclusionAnticipada']()
            tick()
        
            expect(conclusionAnticipadaServiceMock.guardarSentenciaDeterminaConclusionAnticipada).toHaveBeenCalledWith(
              component.idActoTramiteProcesalEnlace,
              jasmine.objectContaining({
                idResultado: 1,
                conAudio: '1',
                conVideo: '0',
                idTipoSentencia: 1334,
              })
            )
            expect(component['deshabilitarFormulario']).toHaveBeenCalled()
            expect(component.tramiteEnModoEdicion).toBeFalse()
        }))

    })

    describe('alDarClicEnReparacionCivil', () => {

        it('debería retornar si actualizandoInternamente es true', fakeAsync(() => {
            component['actualizandoInternamente'] = true
            component['alDarClicEnReparacionCivil'](false)
            tick()
        }))

        it('debería llamar a eliminarReparacionCivilMasiva si existen registros y no hay valor de reparación civil', fakeAsync(() => {
          component['actualizandoInternamente'] = false
          conclusionAnticipadaServiceMock.validarNoExisteReparacionCivil.and.returnValue(of({ noExistenRegistros: false, reparaciones: ['Registro1'] }))
          const eliminarSpy = spyOn(component as any, 'eliminarReparacionCivilMasiva')
          modalDialogServiceMock.warning.and.returnValue(of(CfeDialogRespuesta.Confirmado))
    
          component['alDarClicEnReparacionCivil'](false)
          tick()
    
          expect(eliminarSpy).toHaveBeenCalled()
          expect(modalDialogServiceMock.warning).toHaveBeenCalled()
        }))
    
        it('debería actualizar el valor de reparación civil cuando no existen registros', fakeAsync(() => {
            component['actualizandoInternamente'] = false
            conclusionAnticipadaServiceMock.validarNoExisteReparacionCivil.and.returnValue(of({ noExistenRegistros: true }))
          
            component['alDarClicEnReparacionCivil'](true)
            
            tick(1)
            tick()
            
            expect(component['formularioSetencia'].get('reparacionCivil')?.value).toBe(false)
            expect(component['actualizandoInternamente']).toBe(false)
        }))
      })
    
      describe('eliminarPena', () => {
        it('debería llamar a eliminarPena y listarPenas si el diálogo es confirmado', fakeAsync(() => {
          const penaMock = { idActoTramiteDelitoSujeto: '123', sujeto: 'Test Sujeto' }
          modalDialogServiceMock.question.and.returnValue(of(CfeDialogRespuesta.Confirmado))
          conclusionAnticipadaServiceMock.eliminarPena.and.returnValue(of({ code: '0' }))
          const listarPenasSpy = spyOn(component as any, 'listarPenas')
    
          component['eliminarPena'](penaMock)
          tick()
    
          expect(modalDialogServiceMock.question).toHaveBeenCalledWith(
            'Eliminar Pena',
            'A continuación, se eliminará el registro de pena de Test Sujeto ¿Está seguro de realizar la siguiente acción?',
            'Aceptar',
            'Cancelar'
          )
          expect(conclusionAnticipadaServiceMock.eliminarPena).toHaveBeenCalledWith('123')
          expect(listarPenasSpy).toHaveBeenCalled()
        }))
    
        it('debería mostrar un mensaje de error si eliminarPena falla', fakeAsync(() => {
            const penaMock = { idActoTramiteDelitoSujeto: '123', sujeto: 'Test Sujeto' }
  
            modalDialogServiceMock.question.and.returnValue(of(CfeDialogRespuesta.Confirmado));
            
            conclusionAnticipadaServiceMock.eliminarPena.and.returnValue(throwError(() => new Error('Error de prueba')))

            component['eliminarPena'](penaMock);
            tick();

            expect(modalDialogServiceMock.error).toHaveBeenCalledWith(
                'ERROR',
                'Error al intentar eliminar la pena',
                'Ok'
            )
        }))
      })
      
})


  
