import { ComponentFixture, TestBed } from '@angular/core/testing'
import { AutoReprogramacionJuicioComponent } from './auto-reprogramacion-juicio.component'
import { RegistrarAgendaNotificacionesReprogramarComponent } from '@core/components/registrar-agenda-notificacion-reprogramar/registrar-agenda-notificacion-reprogramar.component'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MaestroService } from '@core/services/shared/maestro.service';
import { AgendaMultipleService } from '@core/services/provincial/tramites/agenda-multiple.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';

const TRAMITE_MOCK: TramiteProcesal = {
    idActoTramiteEstado: '00012910100111011100015816000',
    idActoTramiteConfigura: '000129101001110111',
    idTramite: '000158',
    nombreTramite: 'RESOLUCIÓN - AUTO DE REPROGRAMACIÓN DE AGENDA DE NOTIFICACIÓN DE AUDIENCIA DE JUICIO',
    formulario: 'AutoReprogramacionJuicioComponent',
    idTipoDocumento: 16,
    generaPlazo: '0',
    flgIngresoTramite: '1',
}

describe('AutoReprogramacionJuicioComponent', () => {

    let component: AutoReprogramacionJuicioComponent
    let fixture: ComponentFixture<AutoReprogramacionJuicioComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
              AutoReprogramacionJuicioComponent, 
              RegistrarAgendaNotificacionesReprogramarComponent
            ],
            providers: [
              provideHttpClientTesting(),
              FormBuilder,
              { provide: DynamicDialogRef, useValue: {} },
              { provide: DynamicDialogConfig, useValue: {} },
              { provide: MaestroService, useValue: jasmine.createSpyObj('MaestroService', ['metodoNecesario']) },
              { provide: AgendaMultipleService, useValue: jasmine.createSpyObj('AgendaMultipleService', ['metodoNecesario']) },
              { provide: GestionCasoService, useValue: jasmine.createSpyObj('GestionCasoService', ['metodoNecesario']) },
              { provide: NgxCfngCoreModalDialogService, useValue: jasmine.createSpyObj('NgxCfngCoreModalDialogService', ['metodoNecesario']) },
              { provide: Casos, useValue: jasmine.createSpyObj('Casos', ['metodoNecesario']) },
            ]
          }).compileComponents();
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(AutoReprogramacionJuicioComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('debe crear el componente', () => {
        expect(component).toBeTruthy()
    })

    describe('Propiedades de entrada (Input)', () => {
        it('debe actualizar el valor de idCaso', () => {
            component.idCaso = 'test-case-id'
            fixture.detectChanges()
            expect(component.idCaso).toBe('test-case-id')
        })

        it('debe actualizar el valor de idEtapa', () => {
            component.idEtapa = 'test-stage-id'
            fixture.detectChanges()
            expect(component.idEtapa).toBe('test-stage-id')
        })

        it('debe actualizar el valor de esNuevo', () => {
            component.esNuevo = true
            fixture.detectChanges()
            expect(component.esNuevo).toBeTrue()
        })

        it('debe actualizar el valor de tramiteSeleccionado', () => {
            const tramiteMock: TramiteProcesal = TRAMITE_MOCK
            component.tramiteSeleccionado = tramiteMock
            fixture.detectChanges()
            expect(component.tramiteSeleccionado).toBe(tramiteMock)
        })

        it('debe actualizar idActoTramiteCaso usando el setter', () => {
            component.idActoTramiteCaso = 'test-acto-id'
            fixture.detectChanges()
            expect(component['_idActoTramiteCaso']).toBe('test-acto-id')
        })
    })

    describe('Eventos de salida (Output)', () => {

        it('debe emitir datosFormulario con un objeto', () => {
            spyOn(component.datosFormulario, 'emit')
            const mockData = { clave: 'valor' }
            component.datosFormulario.emit(mockData)
            expect(component.datosFormulario.emit).toHaveBeenCalledWith(mockData)
        })

        it('debe emitir peticionParaEjecutar con una función', () => {
            spyOn(component.peticionParaEjecutar, 'emit')
            const mockFn = (datos: any) => datos
            component.peticionParaEjecutar.emit(mockFn)
            expect(component.peticionParaEjecutar.emit).toHaveBeenCalledWith(mockFn)
        })

    })

    describe('Interacción con el componente hijo', () => {

        it('debe pasar idCaso al componente hijo', () => {
            const childComponent: RegistrarAgendaNotificacionesReprogramarComponent =
                fixture.debugElement.children[0].componentInstance
            component.idCaso = 'test-case-id'
            fixture.detectChanges()
            expect(childComponent.idCaso).toBe('test-case-id')
        })

        it('debe pasar idEtapa al componente hijo', () => {
            const childComponent: RegistrarAgendaNotificacionesReprogramarComponent =
                fixture.debugElement.children[0].componentInstance
            component.idEtapa = 'test-stage-id'
            fixture.detectChanges()
            expect(childComponent.idEtapa).toBe('test-stage-id')
        })

        it('debe pasar tramiteSeleccionado al componente hijo', () => {
            const childComponent: RegistrarAgendaNotificacionesReprogramarComponent =
                fixture.debugElement.children[0].componentInstance
            const tramiteMock: TramiteProcesal = TRAMITE_MOCK
            component.tramiteSeleccionado = tramiteMock
            fixture.detectChanges()
            expect(childComponent.tramiteSeleccionado).toBe(tramiteMock)
        })
    })

})