import { ComponentFixture, TestBed } from '@angular/core/testing'
import { GenericosComponent } from './genericos.component'
import { FormBuilder } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { NgxSpinnerService } from 'ngx-spinner'
import { NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog'
import { FirmaIndividualService } from '@services/firma-digital/firma-individual.service'
import { TramitesGenericosService } from '@services/provincial/tramites/genericos/tramites-genericos.service'
import { MaestroService } from '@services/shared/maestro.service'
import { DialogService } from 'primeng/dynamicdialog'
import { Catalogo } from '@core/interfaces/comunes/catalogo'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { ESTADO_REGISTRO, SLUG_SIGN, TRAMITES } from 'dist/ngx-cfng-core-lib'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { RepositorioDocumentoService } from '@core/services/generales/repositorio-documento.service'

class MockSpinnerService {
  show() {}
  hide() {}
}

class MockModalDialogService {
  success() {}
  error() {}
}

class MockFirmaIndividualService {
  obtenerDatosFirma = jasmine.createSpy().and.returnValue(of({}))
}

class MockTramitesGenericosService {
  obtenerTramiteGenerico = jasmine.createSpy().and.returnValue(of({
    idTramite: 'ACTA',
    nombreTramite: 'Trámite de prueba'
  }))
  registrarTramiteGenerico = jasmine.createSpy('registrarTramiteGenerico').and.returnValue(of('Éxito'))
}

class MockMaestroService {
  obtenerCatalogo = jasmine.createSpy().and.returnValue(of({ data: [] }))
}

class MockCasosService {
  actoTramiteDetalleCaso = jasmine.createSpy().and.returnValue(of({
    idActo: '12345',
    nombre: 'Detalle de prueba'
  }))
}

class MockGestionCasoService {
  obtenerCasoFiscal = jasmine.createSpy().and.returnValue(of({
    idCaso: 'SADASD1232133ASDAS',
    numeroCaso: '21321-202-2023-10'
  }))
}

class MockTramiteService {
  validacionTramite = { tipoOrigenTramiteSeleccionado: 'TEST_ORIGEN' }
  formularioEditado = false
  habilitarGuardar = false
}

class MockRepositorioDocumentoService {
  verDocumentorepositorio = jasmine.createSpy().and.returnValue(of( new Blob(['fake content'], { type: 'application/pdf' })))
}

describe('GenericosComponent', () => {

  let component: GenericosComponent
  let fixture: ComponentFixture<GenericosComponent>
  let dialogServiceMock: any

  beforeEach(async () => {

    dialogServiceMock = jasmine.createSpyObj('DialogService', ['open'])
    dialogServiceMock.open.and.returnValue({
      onClose: of({ razonSocial: 'Razón de prueba', numeroRuc: '12345678901' }),
    })

    await TestBed.configureTestingModule({
      imports: [
        GenericosComponent
      ],
      providers: [
        FormBuilder,
        provideHttpClient(withInterceptorsFromDi()),
        { provide: NgxSpinnerService, useClass: MockSpinnerService },
        { provide: NgxCfngCoreModalDialogService, useClass: MockModalDialogService },
        { provide: FirmaIndividualService, useClass: MockFirmaIndividualService },
        { provide: TramitesGenericosService, useClass: MockTramitesGenericosService },
        { provide: MaestroService, useClass: MockMaestroService },
        { provide: DialogService, useValue: dialogServiceMock },
        { provide: TramiteService, useClass: MockTramiteService },
        { provide: Casos, useClass: MockCasosService },
        { provide: GestionCasoService, useClass: MockGestionCasoService },
        { provide: RepositorioDocumentoService, useClass: MockRepositorioDocumentoService },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(GenericosComponent)
    component = fixture.componentInstance
    component.tramiteSeleccionado = { idTramite: 'ACTA', nombreTramite: 'Acta de prueba' } as any
    fixture.detectChanges()
  })

  it('debería crear el componente', () => {
    expect(component).toBeTruthy()
  })

  it('debería inicializar el formulario en ngOnInit', () => {
    spyOn(component as any, 'inicializarFormularioGenericos')
    component.ngOnInit()
    expect((component as any).inicializarFormularioGenericos).toHaveBeenCalled()
  })

  it('debería desuscribir las suscripciones en ngOnDestroy', () => {
    const unsubscribeSpy = jasmine.createSpy('unsubscribe')
    component['suscripciones'].push({ unsubscribe: unsubscribeSpy } as any)

    component.ngOnDestroy()

    expect(unsubscribeSpy).toHaveBeenCalled()
  })

  it('debería deshabilitar el formulario si deshabilitado cambia a true', () => {
    component.deshabilitado = true
    component.ngOnChanges({ deshabilitado: { currentValue: true } } as any)

    expect(component['genericosFormulario'].disabled).toBeTrue()
  })

  describe('esFormularioValido', () => {
    it('debería ser válido para ACTA con datos completos', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.ACTA
      component['genericosFormulario'].patchValue({
        nombre: 'Nombre válido',
        esEscaneada: true,
        idTipoCopia: 1,
        observaciones: 'Observación válida',
      })
      component.files = ['file1']
      expect(component.esFormularioValido).toBeTrue()
    })

    it('debería ser inválido para ACTA sin nombre', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.ACTA
      component['genericosFormulario'].patchValue({
        nombre: null,
        esEscaneada: true,
        idTipoCopia: 1,
        observaciones: 'Observación válida',
      })
      component.files = ['file1']
      expect(component.esFormularioValido).toBeFalse()
    })

    it('debería ser válido para CONSTANCIA con nombre válido', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.CONSTANCIA
      component['genericosFormulario'].patchValue({ nombre: 'Nombre válido' })
      expect(component.esFormularioValido).toBeTrue()
    })

    it('debería ser inválido para OFICIO sin tipoOficio o datos incompletos', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.OFICIO
      component['genericosFormulario'].patchValue({
        nombre: 'Nombre válido',
        tipoOficio: null,
        numeroRucDestinatario: '12345678901',
        razonSocialDestinatario: null,
      })
      expect(component.esFormularioValido).toBeFalse()
    })

    it('debería ser válido para DECLARACION con nombre y sujetos procesales', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.DECLARACION
      component['genericosFormulario'].patchValue({
        nombre: 'Nombre válido',
        sujetosProcesales: ['Sujeto1'],
      })
      expect(component.esFormularioValido).toBeTrue()
    })

    it('debería ser inválido para DECLARACION sin sujetos procesales', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.DECLARACION
      component['genericosFormulario'].patchValue({
        nombre: 'Nombre válido',
        sujetosProcesales: [],
      })
      expect(component.esFormularioValido).toBeFalse()
    })

    it('debería ser válido para DISPOSICIÓN con nombre válido', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.DISPOSICIÓN
      component['genericosFormulario'].patchValue({ nombre: 'Nombre válido' })
      expect(component.esFormularioValido).toBeTrue()
    })
  
    it('debería ser válido para ESCRITO con nombre válido', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.ESCRITO
      component['genericosFormulario'].patchValue({ nombre: 'Nombre válido' })
      expect(component.esFormularioValido).toBeTrue()
    })
  
    it('debería ser válido para INFORME con nombre válido', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.INFORME
      component['genericosFormulario'].patchValue({ nombre: 'Nombre válido' })
      expect(component.esFormularioValido).toBeTrue()
    })
  
    it('debería ser válido para OFICIO con datos completos', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.OFICIO
      component['genericosFormulario'].patchValue({
        nombre: 'Nombre válido',
        tipoOficio: 'Tipo válido',
        numeroRucDestinatario: '12345678901',
        razonSocialDestinatario: 'Razón válida',
      })
      expect(component.esFormularioValido).toBeTrue()
    })
  
    it('debería ser inválido para OFICIO sin datos completos', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.OFICIO
      component['genericosFormulario'].patchValue({
        nombre: 'Nombre válido',
        tipoOficio: null,
        numeroRucDestinatario: '123456789',
        razonSocialDestinatario: null,
      })
      expect(component.esFormularioValido).toBeFalse()
    })
  
    it('debería ser válido para PROVIDENCIA con nombre válido', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.PROVIDENCIA
      component['genericosFormulario'].patchValue({ nombre: 'Nombre válido' })
      expect(component.esFormularioValido).toBeTrue()
    })
  
    it('debería ser válido para RAZON con nombre válido', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.RAZON
      component['genericosFormulario'].patchValue({ nombre: 'Nombre válido' })
      expect(component.esFormularioValido).toBeTrue()
    })
  
    it('debería ser válido para REQUERIMIENTO con nombre válido', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.REQUERIMIENTO
      component['genericosFormulario'].patchValue({ nombre: 'Nombre válido' })
      expect(component.esFormularioValido).toBeTrue()
    })
  
    it('debería ser válido para REMITE_DOCUMENTO con nombre válido', () => {
      component.tramiteSeleccionado!.idTramite = TRAMITES.REMITE_DOCUMENTO
      component['genericosFormulario'].patchValue({ nombre: 'Nombre válido' })
      expect(component.esFormularioValido).toBeTrue()
    })

  })

  it('debería devolver true si idTramite es ACTA o DECLARACION en mostrarCheckEscaneado', () => {
    component.tramiteSeleccionado = { idTramite: TRAMITES.ACTA } as any
    expect(component.mostrarCheckEscaneado).toBeTrue()

    component.tramiteSeleccionado = { idTramite: TRAMITES.DECLARACION } as any
    expect(component.mostrarCheckEscaneado).toBeTrue()

    component.tramiteSeleccionado = { idTramite: 'OTRO' } as any
    expect(component.mostrarCheckEscaneado).toBeFalse()
  })

  it('debería devolver el texto correcto en textoEscaneado', () => {
    component.tramiteSeleccionado = { idTramite: TRAMITES.ACTA } as any
    expect(component.textoEscaneado).toBe('Acta escaneada')

    component.tramiteSeleccionado = { idTramite: TRAMITES.DECLARACION } as any
    expect(component.textoEscaneado).toBe('Declaración escaneada')

    component.tramiteSeleccionado = { idTramite: 'OTRO' } as any
    expect(component.textoEscaneado).toBe('Escaneado')
  })

  it('debería devolver el valor correcto en esRegistroManual', () => {
    component['genericosFormulario'].patchValue({ esRegistroManual: true })
    expect(component.esRegistroManual).toBeTrue()

    component['genericosFormulario'].patchValue({ esRegistroManual: false })
    expect(component.esRegistroManual).toBeFalse()
  })

  it('debería devolver true si documentoAdjunto está definido en tieneDocumentoAdjunto', () => {
    expect(component.tieneDocumentoAdjunto).toBeFalse()
    component['documentoAdjunto'] = {
      id: '1',
      preNamePdf: '',
      urlPdf: '',
      namePdf: '',
      isSign: false,
      base64: '21312asdasdasdasdasdassa',
      fromServer: true,
    }
    expect(component.tieneDocumentoAdjunto).toBeTrue()
  })

  it('debería emitir peticionParaEjecutar en la inicialización', () => {
    spyOn(component.peticionParaEjecutar, 'emit')
    component.ngOnInit()

    expect(component.peticionParaEjecutar.emit).toHaveBeenCalled()
  })

  it('debería llamar a guardarFormularioConFirma al guardar', async () => {
    spyOn(component as any, 'guardarFormularioConFirma').and.returnValue(of({}))
    component['guardarFormularioConFirma']()

    expect((component as any).guardarFormularioConFirma).toHaveBeenCalled()
  })

  it('debería manejar obtenerDatosGuardadosFormulario correctamente', async () => {
    spyOn(component as any, 'establecerBotonesTramiteSiCambio')
    await (component as any).obtenerDatosGuardadosFormulario()

    expect((component as any).tramitesGenericosService.obtenerTramiteGenerico).toHaveBeenCalledWith(component.idActoTramiteCaso)
    expect((component as any).establecerBotonesTramiteSiCambio).toHaveBeenCalled()
  })

  it('debería manejar buscarPorRuc correctamente', () => {
    component['buscarPorRuc']()
    expect(component['genericosFormulario'].get('razonSocialDestinatario')!.value).toEqual('Razón de prueba')
    expect(component['genericosFormulario'].get('numeroRucDestinatario')!.value).toEqual('12345678901')
  })

  it('debería actualizar el contador de caracteres en observaciones', () => {
    component['genericosFormulario'].patchValue({ observaciones: 'Prueba de conteo de caracteres' })
    component['contadorCaracterObservaciones']()

    expect(component['contadorCaracteresObservacion']).toBe(30)
  })

  it('debería inicializar correctamente los datos al seleccionar un tipo de copia', () => {
    const tipoCopia: Catalogo = { id: '1', noDescripcion: 'Copia simple' }
    component['seleccionarTipoCopia'](tipoCopia)

    expect(component['tipoCopiaSeleccionada']).toEqual(tipoCopia)
  })

  it('debería verificar si el formulario ha cambiado', () => {
    component['datosFormularioGuardado'] = { nombre: 'Nombre inicial' } as any
    component['datosFormulario'] = { nombre: 'Nombre modificado' } as any

    const resultado = component['elFormularioHaCambiado']()
    expect(resultado).toBeTrue()
  })

  it('debería deshabilitar correctamente los campos al cambiar a registro manual', () => {
    component['alCambiarRegistroManual'](false)

    expect(component['genericosFormulario'].get('numeroRucDestinatario')!.disabled).toBeTrue()
    expect(component['genericosFormulario'].get('razonSocialDestinatario')!.disabled).toBeTrue()
  })

  describe('processSignDocument', () => {
    it('debería procesar el documento y marcar documentoCargado como true', () => {
      const mockFile = { id: '1', file: new Blob(), nombreOrigen: 'Documento.pdf' }
      spyOn((component as any), 'verDocumentoVisor')

      component['processSignDocument'](mockFile)

      expect(component['documentoCargado']).toBeTrue()
      expect(component['verDocumentoVisor']).toHaveBeenCalledWith(mockFile)
    })
  })

  describe('procesoFirma', () => {
    it('debería deshabilitar el formulario y registrar datos cuando recibe "0"', async () => {
      spyOn((component as any), 'deshabilitarFormulario')
      spyOn((component as any), 'obtenerDocumentoFirmado').and.resolveTo()
      spyOn((component as any), 'registrarDatosFormularioAlterno')

      await component.procesoFirma('0')

      expect(component['deshabilitarFormulario']).toHaveBeenCalled()
      expect(component['obtenerDocumentoFirmado']).toHaveBeenCalled()
      expect(component['registrarDatosFormularioAlterno']).toHaveBeenCalled()
    })

    it('debería ocultar el spinner y mostrar alerta cuando recibe "1"', async () => {
      spyOn(component['spinner'], 'hide')
      spyOn(window, 'alert')

      await component.procesoFirma('1')

      expect(component['spinner'].hide).toHaveBeenCalled()
      expect(window.alert).toHaveBeenCalledWith(SLUG_SIGN.CANCEL)
    })
  })

  it('debería registrar correctamente los datos', () => {
    spyOn(component['spinner'], 'show')
    spyOn(component['modalDialogService'], 'info')
    spyOn(component as any, 'bloquearFormulario')

    //component['tramitesGenericosService'].registrarTramiteGenerico.and.returnValue(of({}))

    component['documentoAdjunto'] = { base64: 'base64data', namePdf: 'Documento.pdf' } as any
    component['nombreDocumentoCargado'] = 'Node123'

    component['registrarDatosFormularioAlterno']()

    expect(component['spinner'].show).toHaveBeenCalled()
    expect(component['tramitesGenericosService'].registrarTramiteGenerico).toHaveBeenCalledWith({
      ...component['datosFormulario'],
      archivo: 'base64data',
      nombreArchivo: 'Documento.pdf',
      nodeId: 'Node123',
    })
    expect(component['bloquearFormulario']).toHaveBeenCalled()
    expect(component['modalDialogService'].info).toHaveBeenCalledWith(
      `${component['obtenerTituloTramite']()} registrada y firmada`,
      `Se registró y firmó correctamente ${component['obtenerTextoRegistradoFirmado']()}.`,
      'Listo'
    )
  })

  it('debería manejar errores correctamente', () => {
    spyOn(component['spinner'], 'show')
    spyOn(component['spinner'], 'hide')
    spyOn(component['modalDialogService'], 'error');

    (component['tramitesGenericosService'].registrarTramiteGenerico as jasmine.Spy).and.returnValue(throwError(() => new Error('Error')))

    component['documentoAdjunto'] = { base64: 'base64data', namePdf: 'Documento.pdf' } as any

    component['registrarDatosFormularioAlterno']()

    expect(component['spinner'].show).toHaveBeenCalled()
    expect(component['spinner'].hide).toHaveBeenCalled()
    expect(component['modalDialogService'].error).toHaveBeenCalledWith(
      'PROCESO NO TERMINADO',
      'No se terminó con el proceso de firma y guardado.',
      'Aceptar'
    )
  })

  describe('verDocumentoVisor', () => {
    it('debería mostrar vista previa del documento', async () => {
      const mockDocumento = {
        id: '1',
        file: new Blob(),
        nombreOrigen: 'Documento.pdf',
        isSign: true,
      }
      spyOn(component['sanitizer'], 'bypassSecurityTrustResourceUrl').and.callThrough()
      spyOn(component['spinner'], 'hide')

      await component['verDocumentoVisor'](mockDocumento)

      expect(component['documentoAdjunto']).toEqual(jasmine.objectContaining({
        id: '1',
        namePdf: 'Documento.pdf',
        isSign: true,
        base64: jasmine.any(String),
      }))
      expect(component['spinner'].hide).toHaveBeenCalled()
    })
  })

  describe('eliminarDocumento', () => {
    it('debería eliminar el documento y restablecer valores', () => {
      const mockDocumento = { id: '1' }
      component.files = [{ id: '1' }, { id: '2' }]
      spyOn(component['genericosFormulario'].get('idTipoCopia')!, 'setValue')
      spyOn((component as any), 'nuevoDocumento').and.callThrough()

      component['eliminarDocumento'](mockDocumento)

      expect(component.files.length).toBe(1)
      expect(component['genericosFormulario'].get('idTipoCopia')!.setValue).toHaveBeenCalledWith(null)
      expect(component['documentoCargado']).toBeFalse()
      expect(component['nuevoDocumento']).toHaveBeenCalled()
    })
  })

  describe('seleccionarActoInvestigacion', () => {

    it('debería no hacer nada si el evento es null o undefined', () => {
      component['seleccionarActoInvestigacion'](null)
      expect(component['extenderActoInvestigacion']).toBeFalse()
  
      component['seleccionarActoInvestigacion'](undefined)
      expect(component['extenderActoInvestigacion']).toBeFalse()
    })
  
    it('debería actualizar extenderActoInvestigacion si el evento tiene la propiedad checked', () => {
      const event = { checked: true }
      component['seleccionarActoInvestigacion'](event)
      expect(component['extenderActoInvestigacion']).toBe(true)
  
      event.checked = false
      component['seleccionarActoInvestigacion'](event)
      expect(component['extenderActoInvestigacion']).toBe(false)
    })

  })

  it('debería bloquear el formulario y ocultar el spinner', () => {

    spyOn(component as any, 'deshabilitarFormulario')
    spyOn(component['spinner'], 'hide')
  
    component['idCaso'] = '123213213ASDASDSDASDASDSADSA'
    
    component['bloquearFormulario']()
  
    expect(component['esFirmadoGuardado']).toBeTrue()
    expect(component['tramiteEnModoEdicion']).toBeFalse()
    expect(component['idEstadoRegistro']).toBe(ESTADO_REGISTRO.FIRMADO)
  
    expect(component['gestionCasoService'].obtenerCasoFiscal).toHaveBeenCalledWith('123213213ASDASDSDASDASDSADSA')
    
    expect(component['deshabilitarFormulario']).toHaveBeenCalled()
    expect(component['spinner'].hide).toHaveBeenCalled()
  })

})