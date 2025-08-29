import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RegistrarPlazoComponent } from '@core/components/modals/acto-procesal/asignar-plazo/registrar-plazo/registrar-plazo.component';
import { AsociarSujetosDelitosComponent } from '@core/components/reutilizable/asociar-sujetos-delitos/asociar-sujetos-delitos.component';
import { CodigoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum } from '@core/constants/constants'
import { AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { AmpliarPlazoRequest, DisposicionProrrogaInvPreparatoria } from '@core/interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { AlertaService } from '@core/services/shared/alerta.service'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { Expediente } from '@core/utils/expediente'
import { IniciarDiligenciaPreparatoriaService } from '@services/provincial/tramites/preparatoria.service'
import { ESTADO_REGISTRO, IconAsset } from 'dist/ngx-cfng-core-lib'
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { DialogModule } from 'primeng/dialog'
import { DividerModule } from 'primeng/divider'
import { DropdownModule } from 'primeng/dropdown'
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog'
import { InputTextModule } from 'primeng/inputtext'
import { MenuModule } from 'primeng/menu'
import { MessagesModule } from 'primeng/messages'
import { TableModule } from 'primeng/table'
import { ToastModule } from 'primeng/toast'
import { catchError, map, Subject, Subscription, takeUntil, tap, throwError } from 'rxjs'

@Component({
  standalone: true,
  selector: 'app-prorroga-inv-preparatoria',
  templateUrl: './prorroga-inv-preparatoria.component.html',
  styleUrls: ['./prorroga-inv-preparatoria.component.scss'],
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DividerModule,
    CheckboxModule,
    MessagesModule,
    ToastModule,
    DialogModule,
    DropdownModule,
    MenuModule,
    DynamicDialogModule,
    FormsModule,
    ReactiveFormsModule,
    AsociarSujetosDelitosComponent
  ],
  providers: [NgxCfngCoreModalDialogService],
})
export class ProrrogaInvPreparatoriaComponent implements OnInit {

  @Input() idCaso!: string
  @Input() idActoTramiteCaso!: string
  @Input() etapa!: string
  @Input() tramiteSeleccionado: TramiteProcesal | null = null
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>()

  protected readonly iconAsset = inject(IconAsset)
  private readonly dialogService = inject(DialogService)
  private readonly iniciarDiligenciaPreparatoriaService = inject(IniciarDiligenciaPreparatoriaService)
  private readonly gestionCasoService = inject(GestionCasoService)
  private readonly firmaIndividualService = inject(FirmaIndividualService)
  private readonly alertaService = inject(AlertaService)
  private readonly tramiteService = inject(TramiteService)
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly casoService = inject(Casos)
  private readonly spinner = inject(NgxSpinnerService)

  protected caso: Expediente
  protected seHanRegistradoAsociaciones: boolean = false

  public datosProrrogaInvPreparatoria: DisposicionProrrogaInvPreparatoria | null = null
  public plazos: AmpliarPlazoRequest | null = null

  private fechaInicioDiligencia: string = ''
  private fechaFinDiligencia: string = ''
  private informacionCasoInicial: string = ''
  protected bloquearFormulario: boolean = false
  protected estaIncompleto: string = '1'
  private readonly desuscribir$ = new Subject<void>()

  private readonly suscripciones: Subscription[] = []

  constructor() {
    this.caso = this.gestionCasoService.casoActual
  }

  ngOnInit(): void {

    this.obtenerFormulario()
    this.habilitarGuardar(true)

    this.peticionParaEjecutar.emit( () => this.guardarFormulario() )

    this.firmaIndividualService.esFirmadoCompartidoObservable
    .pipe(takeUntil(this.desuscribir$))
    .subscribe(
      (respuesta: any) => {
        if (respuesta.esFirmado) {
          this.registrarAlertas()
          this.bloquearFormulario = true
        }
      }
    )

  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe())
  }

  get formularioValido(): boolean {
    return this.seRegistraronPlazos &&
      this.seHanRegistradoAsociaciones
  }

  get seRegistraronPlazos(): boolean {
    return this.plazos !== undefined && this.plazos !== null
  }

  protected elFormularioHaCambiado(): boolean {
    return this.informacionCasoInicial !== JSON.stringify(this.datosProrrogaInvPreparatoria)
  }

  private establecerBotonesTramiteSiCambio(): void {
    const cambio = this.elFormularioHaCambiado()
    if ( cambio ) {
      this.formularioEditado(true)
      this.habilitarGuardar(true)
    } else if ( this.formularioValido && this.estaIncompleto !== '1' ) {
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

  private obtenerFormulario() {
    this.spinner.show()
    this.suscripciones.push(
      this.iniciarDiligenciaPreparatoriaService
        .obtenerProrrogaInvPreparatoria(this.idActoTramiteCaso)
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
              if ( resp.formularioIncompleto === '0' ) {
                this.estaIncompleto = '0'
                this.habilitarFirma()
              }
              setTimeout(() => {
                this.alSeleccionar()
              }, 1000);

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
    this.casoService.actoTramiteDetalleCaso( this.idActoTramiteCaso )
      .subscribe({
        next: (resp: any) => {
          if ( resp.idEstadoTramite === ESTADO_REGISTRO.FIRMADO ) {
            this.bloquearFormulario = true
          }
        }
    })
  }

  protected guardarFormulario() {
    return this.iniciarDiligenciaPreparatoriaService.guardarProrrogaInvPreparatoria(this.datosProrrogaInvPreparatoria!)
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

  private registrarAlertas(): void {
    const request: AlertaGeneralRequestDTO = {
      idCaso: this.idCaso,
      numeroCaso: this.caso.numeroCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_PI,
      idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
    }
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe()
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor
  }

  protected verBotonGuardar(valor: boolean) {
    this.tramiteService.formularioEditado = valor
  }

  protected abrirModalProrrogaInvPreparatoria(): void {
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
          bloquearFormulario: this.bloquearFormulario,
        },
      })
    
      ref.onClose.subscribe((data) => {
        this.plazos = data
        if ( data ) {
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

  protected establecerSiSeHanRegistradoAsociaciones(valor: boolean): void {
    this.seHanRegistradoAsociaciones = valor
    this.alSeleccionar()
  }

}