import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { DialogService } from 'primeng/dynamicdialog'
import { catchError, map, Subject, Subscription, takeUntil, tap, throwError } from 'rxjs'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { Expediente } from '@core/utils/expediente'
import { DateMaskModule } from '@directives/date-mask.module'
import { AmpliarPlazoRequest, RequerimientoProrrogaInvPreparatoria } from '@interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface'
import { CustomFormService } from '@modules/provincial/tramites/comun/preliminar/ampliacion-diligencias-preliminares/ampliar-plazo/custom-form.service'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { ButtonModule } from 'primeng/button'
import { CalendarModule } from 'primeng/calendar'
import { DialogModule } from 'primeng/dialog'
import { DropdownModule } from 'primeng/dropdown'
import { InputNumberModule } from 'primeng/inputnumber'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { MessagesModule } from 'primeng/messages'
import { ProgressBarModule } from 'primeng/progressbar'
import { ToastModule } from 'primeng/toast'
import { AsociarSujetosDelitosComponent } from '@core/components/reutilizable/asociar-sujetos-delitos/asociar-sujetos-delitos.component'
import { ESTADO_REGISTRO, IconAsset } from 'dist/ngx-cfng-core-lib'
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service'
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { ResolucionAutoRequerimientoProrrogaService } from '@core/services/provincial/tramites/comun/preparatoria/resolucion-auto-requerimiento-prorroga.service'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service'
import { NgxSpinnerService } from 'ngx-spinner'
import { RegistrarPlazoComponent } from '@core/components/modals/acto-procesal/asignar-plazo/registrar-plazo/registrar-plazo.component'

@Component({
  standalone: true,
  selector: 'app-auto-requerimiento-prorroga-inv-preparatoria',
  templateUrl: './auto-requerimiento-prorroga-inv-preparatoria.component.html',
  styleUrls: ['./auto-requerimiento-prorroga-inv-preparatoria.component.scss'],
  imports: [
    CommonModule,
    CmpLibModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextareaModule,
    MessagesModule,
    InputTextModule,
    ButtonModule,
    InputNumberModule,
    FormsModule,
    ProgressBarModule,
    ToastModule,
    CalendarModule,
    DateMaskModule,
    DialogModule,
    AsociarSujetosDelitosComponent
  ],
  providers: [CustomFormService, NgxCfngCoreModalDialogService],
})
export class AutoRequerimientoProrrogaInvPreparatoriaComponent implements OnInit, OnDestroy {

  @Input() idCaso!: string
  @Input() numeroCaso: string = ''
  @Input() idActoTramiteCaso!: string
  @Input() etapa!: string
  @Input() idEtapa: string = ''
  @Input() tramiteSeleccionado: TramiteProcesal | null = null
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>()
  @Input() iniTramiteCreado: boolean = false

  protected readonly iconAsset = inject(IconAsset)
  private readonly firmaIndividualService = inject(FirmaIndividualService)
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly resolucionAutoRequerimientoProrrogaService = inject(ResolucionAutoRequerimientoProrrogaService)
  private readonly dialogService = inject(DialogService)
  private readonly casoService = inject(Casos)
  private readonly spinner = inject(NgxSpinnerService)
  private readonly gestionCasoService = inject(GestionCasoService)
  protected tramiteService = inject(TramiteService)

  private fechaInicioDiligencia: string = ''
  private fechaFinDiligencia: string = ''
  protected bloquearFormulario: boolean = false
  protected seHanRegistradoAsociaciones: boolean = false
  public plazos: AmpliarPlazoRequest | null = null
  protected estaIncompleto: string = '1'
  private informacionCasoInicial: string = ''

  private readonly desuscribir$ = new Subject<void>()

  public datosProrrogaInvPreparatoria: RequerimientoProrrogaInvPreparatoria | null = null
  protected caso: Expediente

  private readonly suscripciones: Subscription[] = []

  constructor() {
    this.caso = this.gestionCasoService.casoActual
  }

  ngOnInit(): void {

    this.obtenerFormulario()
    this.habilitarGuardar(true)

    this.peticionParaEjecutar.emit(() => this.guardarFormulario())

    this.firmaIndividualService.esFirmadoCompartidoObservable
      .pipe(takeUntil(this.desuscribir$))
      .subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.bloquearFormulario = true
          }
        }
      )
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe())
    this.desuscribir$.next()
    this.desuscribir$.complete()
  }

  get formularioValido(): boolean {
    return this.seRegistraronPlazos && this.seHanRegistradoAsociaciones
  }

  get seRegistraronPlazos(): boolean {
    return this.plazos !== undefined && this.plazos !== null
  }

  protected elFormularioHaCambiado(): boolean {
    return this.informacionCasoInicial !== JSON.stringify(this.datosProrrogaInvPreparatoria)
  }

  protected establecerSiSeHanRegistradoAsociaciones(valor: boolean): void {
    this.seHanRegistradoAsociaciones = valor
    this.alSeleccionar()
  }

  private obtenerFormulario() {
      this.spinner.show()
      this.suscripciones.push(
        this.resolucionAutoRequerimientoProrrogaService
          .obtenerRequerimientoProrrogaInvPreparatoria(this.idActoTramiteCaso)
          .subscribe({
            next: (resp) => {
              this.obtenerDetalleActoTramiteCaso()
              this.spinner.hide()
              if (resp != undefined && resp != null) {
                this.datosProrrogaInvPreparatoria = resp
                this.fechaInicioDiligencia = resp.fechaInicioDiligencia
                this.fechaFinDiligencia = resp.fechaFinDiligencia
                this.plazos = this.datosProrrogaInvPreparatoria!.plazos
                this.informacionCasoInicial = JSON.stringify(resp)
                if (resp.formularioIncompleto === '0') {
                  this.estaIncompleto = '0'
                  this.habilitarFirma()
                }
                setTimeout(() => {
                  this.alSeleccionar()
                }, 1000)
  
              }
            },
            error: (error) => {
              console.error(error)
              this.spinner.hide()
            },
          })
      )
    }
  
  private obtenerDetalleActoTramiteCaso(): void {
    this.casoService.actoTramiteDetalleCaso(this.idActoTramiteCaso)
      .subscribe({
        next: (resp: any) => {
          if (resp.idEstadoTramite === ESTADO_REGISTRO.FIRMADO) {
            this.bloquearFormulario = true
          }
        }
      })
  }

  protected abrirModalAmpliarPlazo(): void {
  
      const ref = this.dialogService.open(RegistrarPlazoComponent, {
        showHeader: false,
        width: '60rem',
        data: {
          idCaso: this.idCaso,
          calificarCaso: this.caso,
          idTramite: this.tramiteSeleccionado?.idTramite,
          idActoProcesal: this.tramiteSeleccionado!.idActoTramiteConfigura,
          idActoTramiteEstado: this.tramiteSeleccionado!.idActoTramiteEstado,
          fechaInicioDiligencia: this.datosProrrogaInvPreparatoria?.fechaInicioDiligencia,
          fechaFinDiligencia: this.datosProrrogaInvPreparatoria?.fechaFinDiligencia,
          plazos: this.datosProrrogaInvPreparatoria?.plazos,
        },
      })
  
      ref.onClose.subscribe((data) => {
        this.plazos = data
        if (data) {
          this.plazos = {
            idCaso: data.idCaso,
            nroPlazo: data.nroPlazo,
            idActoProcesal: data.idActoProcesal,
            idTramite: data.idTramite,
            descripcionPlazo: data.descripcionPlazo,
            idTipoUnidad: data.idTipoUnidad,
            idTipoComplejidad: data.idTipoComplejidad,
            idTipoSedeInvestigacion: data.idTipoSedeInvestigacion,
          }
        }
        this.alSeleccionar()
      })
  
  }

  protected guardarFormulario() {
    return this.resolucionAutoRequerimientoProrrogaService.guardarRequerimientoProrrogaInvPreparatoria(this.datosProrrogaInvPreparatoria!)
        .pipe(
          tap(() => {
            this.modalDialogService.success(
              'Datos guardados correctamente',
              'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
              'Aceptar'
            )
            this.informacionCasoInicial = JSON.stringify(this.datosProrrogaInvPreparatoria)
            this.estaIncompleto = this.datosProrrogaInvPreparatoria!.formularioIncompleto
            this.estaIncompleto === '0' ? this.habilitarFirma() : this.habilitarGuardar(false)
          }),
          map(() => 'válido'),
          catchError(() => {
            this.modalDialogService.error(
              'Error',
              'No se pudo guardar la información para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
              'Aceptar'
            )
            return throwError(() => new Error('Error al guardar'))
          })
    )
  }

  private establecerBotonesTramiteSiCambio(): void {
    const cambio = this.elFormularioHaCambiado()
    if (cambio) {
      this.formularioEditado(true)
      this.habilitarGuardar(true)
    } else if (this.formularioValido && this.estaIncompleto !== '1') {
      this.habilitarFirma()
    } else {
      this.formularioEditado(true)
      this.habilitarGuardar(false)
    }
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor
  }

  private habilitarFirma(): void {
    this.formularioEditado(false)
    this.habilitarGuardar(false)
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor
  }

  private alSeleccionar(): void {

    this.datosProrrogaInvPreparatoria = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      formularioIncompleto: this.formularioValido ? '0' : '1',
      fechaInicioDiligencia: this.fechaInicioDiligencia,
      fechaFinDiligencia: this.fechaFinDiligencia,
      plazos: this.plazos!,
      flCasoReservado: this.caso.flgReservado === '1',
    }

    this.establecerBotonesTramiteSiCambio()

  }

}