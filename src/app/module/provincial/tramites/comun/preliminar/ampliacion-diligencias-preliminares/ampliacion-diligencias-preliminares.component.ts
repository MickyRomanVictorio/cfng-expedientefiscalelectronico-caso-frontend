import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { DialogService } from 'primeng/dynamicdialog'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { DateMaskModule } from '@directives/date-mask.module'
import { AmpliacionDiligenciaPreliminar, AmpliarPlazoRequest } from '@interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface'
import { AmpliacionPlazoPreliminaresService } from '@services/provincial/tramites/ampliacion-plazo-preliminares.service'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { NgxSpinnerService } from 'ngx-spinner'
import { CalendarModule } from 'primeng/calendar'
import { DialogModule } from 'primeng/dialog'
import { DropdownModule } from 'primeng/dropdown'
import { InputNumberModule } from 'primeng/inputnumber'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { MessagesModule } from 'primeng/messages'
import { ProgressBarModule } from 'primeng/progressbar'
import { ToastModule } from 'primeng/toast'
import { catchError, map, Subject, Subscription, takeUntil, tap, throwError } from 'rxjs'
import { CustomFormService } from './ampliar-plazo/custom-form.service'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { Expediente } from '@core/utils/expediente'
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service'
import { Alerta, AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta'
import { CodigoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum } from '@core/constants/constants'
import { AlertaService } from '@core/services/shared/alerta.service'
import { AsociarSujetosDelitosComponent } from '@core/components/reutilizable/asociar-sujetos-delitos/asociar-sujetos-delitos.component'
import { ESTADO_REGISTRO, IconAsset } from 'dist/ngx-cfng-core-lib'
import { RegistrarPlazoComponent } from '@core/components/modals/acto-procesal/asignar-plazo/registrar-plazo/registrar-plazo.component'
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service'
import { TokenService } from '@core/services/shared/token.service'
import { ID_ETAPA } from '@core/constants/menu'
@Component({
  selector: 'app-ampliacion-diligencias-preliminares',
  standalone: true,
  templateUrl: './ampliacion-diligencias-preliminares.component.html',
  styleUrls: ['./ampliacion-diligencias-preliminares.component.scss'],
  imports: [
    CommonModule,
    CmpLibModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextareaModule,
    MessagesModule,
    InputTextModule,
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
export class AmpliacionDiligenciasPreliminaresComponent implements OnInit, OnDestroy {

  @Input() idCaso!: string
  @Input() numeroCaso: string = '';
  @Input() idActoTramiteCaso!: string
  @Input() etapa!: string
  @Input() idEtapa: string = '';//Id de la etapa
  @Input() tramiteSeleccionado: TramiteProcesal | null = null
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>()
  @Input() iniTramiteCreado: boolean = false;

  protected readonly iconAsset = inject(IconAsset)
  private readonly alertaService = inject(AlertaService)
  private readonly gestionCasoService = inject(GestionCasoService)
  private readonly firmaIndividualService = inject(FirmaIndividualService)
  private readonly ampliacionPlazoService = inject(AmpliacionPlazoPreliminaresService)
  private readonly spinner = inject(NgxSpinnerService)
  private readonly dialogService = inject(DialogService)
  private readonly casoService = inject(Casos)
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  protected tramiteService = inject(TramiteService)
  private readonly tokenService = inject(TokenService);

  protected caso: Expediente
  protected seHanRegistradoAsociaciones: boolean = false

  public datosAmpliacionDiligencia: AmpliacionDiligenciaPreliminar | null = null
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
    //resuleve las alertas del caso
    this.resolverAlertas();

    this.obtenerFormulario()
    this.habilitarGuardar(true)

    this.peticionParaEjecutar.emit(() => this.guardarFormulario())

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

  resolverAlertas() {
    if (this.iniTramiteCreado && (this.idEtapa == ID_ETAPA.PRELIMINAR)) {
      this.solucionarAlerta();
    }
  }

  solucionarAlerta(): void {
    console.log('numeroCaso = ', this.numeroCaso);
    console.log('codDespacho = ', this.tokenService.getDecoded().usuario.codDespacho);
    console.log('usuario = ', this.tokenService.getDecoded().usuario.usuario);

    const alerta: Alerta = {
      codigoCaso: this.numeroCaso,
      codigoDespacho: this.tokenService.getDecoded().usuario.codDespacho,
      fechaCreacion: '',
      codigoUsuarioDestino: this.tokenService.getDecoded().usuario.usuario,
      texto: '',
      idAsignado: this.tokenService.getDecoded().usuario.usuario
    }
    this.alertaService
      .solucionarAlerta(alerta)
      .pipe(takeUntil(this.desuscribir$))
  }


  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  get formularioValido(): boolean {
    return this.seRegistraronPlazos && this.seHanRegistradoAsociaciones
  }

  get seRegistraronPlazos(): boolean {
    return this.plazos !== undefined && this.plazos !== null
  }

  protected elFormularioHaCambiado(): boolean {
    return this.informacionCasoInicial !== JSON.stringify(this.datosAmpliacionDiligencia)
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

  private obtenerFormulario() {
    this.spinner.show()
    this.suscripciones.push(
      this.ampliacionPlazoService
        .obtenerAmpliacionDiligenciaPreliminar(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.obtenerDetalleActoTramiteCaso()
            this.spinner.hide()
            if (resp != undefined && resp != null) {
              this.datosAmpliacionDiligencia = resp
              this.fechaInicioDiligencia = resp.fechaInicioDiligencia
              this.fechaFinDiligencia = resp.fechaFinDiligencia
              this.plazos = this.datosAmpliacionDiligencia!.plazos
              this.informacionCasoInicial = JSON.stringify(resp)
              if (resp.formularioIncompleto === '0') {
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
    this.casoService.actoTramiteDetalleCaso(this.idActoTramiteCaso)
      .subscribe({
        next: (resp: any) => {
          if (resp.idEstadoTramite === ESTADO_REGISTRO.FIRMADO) {
            this.bloquearFormulario = true
          }
        }
      })
  }

  protected guardarFormulario() {
    return this.ampliacionPlazoService.guardarAmpliacionDiligenciaPreliminar(this.datosAmpliacionDiligencia!)
      .pipe(
        tap(() => {
          this.modalDialogService.success(
            'Datos guardados correctamente',
            'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
            'Aceptar'
          )
          this.informacionCasoInicial = JSON.stringify(this.datosAmpliacionDiligencia)
          this.estaIncompleto = this.datosAmpliacionDiligencia!.formularioIncompleto
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

    this.datosAmpliacionDiligencia = {
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
      codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_AI,
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
        fechaInicioDiligencia: this.datosAmpliacionDiligencia?.fechaInicioDiligencia,
        fechaFinDiligencia: this.datosAmpliacionDiligencia?.fechaFinDiligencia,
        plazos: this.datosAmpliacionDiligencia?.plazos,
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

  protected establecerSiSeHanRegistradoAsociaciones(valor: boolean): void {
    this.seHanRegistradoAsociaciones = valor
    this.alSeleccionar()
  }

}