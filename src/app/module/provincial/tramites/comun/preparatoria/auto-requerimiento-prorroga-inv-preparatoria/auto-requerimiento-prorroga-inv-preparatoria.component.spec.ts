import { ComponentFixture, TestBed } from '@angular/core/testing'
import { AutoRequerimientoProrrogaInvPreparatoriaComponent } from './auto-requerimiento-prorroga-inv-preparatoria.component'
import { of, throwError } from 'rxjs'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service'
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { ResolucionAutoRequerimientoProrrogaService } from '@core/services/provincial/tramites/comun/preparatoria/resolucion-auto-requerimiento-prorroga.service'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { NgxSpinnerService } from 'ngx-spinner'
class MockFirmaIndividualService {
  esFirmadoCompartidoObservable = of({ esFirmado: false })
}

class MockNgxCfngCoreModalDialogService {
  success = jasmine.createSpy('success')
  error = jasmine.createSpy('error')
}

class MockResolucionService {
  obtenerRequerimientoProrrogaInvPreparatoria = jasmine.createSpy().and.returnValue(of({
    fechaInicioDiligencia: '2024-01-01',
    fechaFinDiligencia: '2024-01-31',
    plazos: { idCaso: '1' },
    formularioIncompleto: '1',
  }))
  guardarRequerimientoProrrogaInvPreparatoria = jasmine.createSpy().and.returnValue(of(null))
}

class MockCasos {
  actoTramiteDetalleCaso = jasmine.createSpy().and.returnValue(of({ idEstadoTramite: 1 }))
}

class MockGestionCasoService {
  casoActual = {} as any
}

class MockTramiteService {
  formularioEditado = false
}

class MockNgxSpinnerService {
  show = jasmine.createSpy('show')
  hide = jasmine.createSpy('hide')
}

describe('AutoRequerimientoProrrogaInvPreparatoriaComponent', () => {
  let component: AutoRequerimientoProrrogaInvPreparatoriaComponent
  let fixture: ComponentFixture<AutoRequerimientoProrrogaInvPreparatoriaComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoRequerimientoProrrogaInvPreparatoriaComponent],
      providers: [
        { provide: FirmaIndividualService, useClass: MockFirmaIndividualService },
        { provide: NgxCfngCoreModalDialogService, useClass: MockNgxCfngCoreModalDialogService },
        { provide: ResolucionAutoRequerimientoProrrogaService, useClass: MockResolucionService },
        { provide: Casos, useClass: MockCasos },
        { provide: GestionCasoService, useClass: MockGestionCasoService },
        { provide: TramiteService, useClass: MockTramiteService },
        { provide: NgxSpinnerService, useClass: MockNgxSpinnerService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // Para ignorar componentes desconocidos
    }).compileComponents()

    fixture = TestBed.createComponent(AutoRequerimientoProrrogaInvPreparatoriaComponent)
    component = fixture.componentInstance

    // Set inputs
    component.idCaso = '123'
    component.idActoTramiteCaso = '456'
    component.etapa = 'INICIO'

    fixture.detectChanges()
  })

  it('debería crear el componente', () => {
    expect(component).toBeTruthy()
  })

  it('debería obtener el formulario al inicializar', () => {
    expect(component.datosProrrogaInvPreparatoria).toBeTruthy()
    expect(component.plazos).toBeTruthy()
  })

  it('debería indicar si el formulario está incompleto', () => {
    expect(component.formularioValido).toBeFalse()
  })

  it('debería emitir el evento `peticionParaEjecutar`', () => {
    spyOn(component.peticionParaEjecutar, 'emit')
    component.ngOnInit()
    expect(component.peticionParaEjecutar.emit).toHaveBeenCalled()
  })

  it('debería guardar el formulario correctamente', (done) => {
    component['guardarFormulario']().subscribe({
      next: (resultado) => {
        expect(resultado).toBe('válido')
        done()
      }
    })
  })

  it('debería manejar error al guardar', (done) => {
    const servicio = TestBed.inject(ResolucionAutoRequerimientoProrrogaService)
    servicio.guardarRequerimientoProrrogaInvPreparatoria = jasmine.createSpy().and.returnValue(throwError(() => new Error('fallo')))
    
    component['guardarFormulario']().subscribe({
      error: (error) => {
        expect(error).toBeTruthy()
        done()
      }
    })
  })
})