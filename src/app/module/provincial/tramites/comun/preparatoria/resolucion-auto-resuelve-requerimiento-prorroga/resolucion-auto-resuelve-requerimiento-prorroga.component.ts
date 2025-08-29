import {CommonModule} from '@angular/common'
import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core'
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms'
import {AlertaData} from '@interfaces/comunes/alert'
import {TramiteProcesal} from '@core/interfaces/comunes/tramiteProcesal'
import {RegistrarPlazoRequest} from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest'
import {
  ResolucionAutoRequerimientoProrroga
} from '@interfaces/provincial/tramites/comun/preparatoria/resolucion-auto-requerimiento-prorroga'
import {Casos} from '@services/provincial/consulta-casos/consultacasos.service'
import {
  ResolucionAutoRequerimientoProrrogaService
} from '@services/provincial/tramites/comun/preparatoria/resolucion-auto-requerimiento-prorroga.service'
import {GestionCasoService} from '@services/shared/gestion-caso.service'
import {MensajeNotificacionService} from '@services/shared/mensaje.service'
import {AlertaModalComponent} from '@components/modals/alerta-modal/alerta-modal.component'
import {ESTADO_REGISTRO, getDateFromString, IconAsset, obtenerFechaDDMMYYYY, obtenerFechaTipoDate, RESPUESTA_MODAL, TIPO_RESULTADO,} from 'ngx-cfng-core-lib'
import {obtenerIcono} from '@utils/icon'
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib'
import {NgxSpinnerService} from 'ngx-spinner'
import {MessageService} from 'primeng/api'
import {ButtonModule} from 'primeng/button'
import {CalendarModule} from 'primeng/calendar'
import {CheckboxModule} from 'primeng/checkbox'
import {DialogModule} from 'primeng/dialog'
import {DividerModule} from 'primeng/divider'
import {DropdownModule} from 'primeng/dropdown'
import {DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef,} from 'primeng/dynamicdialog'
import {InputTextModule} from 'primeng/inputtext'
import {MenuModule} from 'primeng/menu'
import {MessagesModule} from 'primeng/messages'
import {RadioButtonModule} from 'primeng/radiobutton'
import {ToastModule} from 'primeng/toast'
import {catchError, lastValueFrom, of, Subscription} from 'rxjs'
import {
  PlazoAmpliacionComponent
} from '@components/modals/acto-procesal/asignar-plazo/plazo-ampliacion/plazo-ampliacion.component'
import {
  GuardarTramiteProcesalComponent
} from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component'
import { Expediente } from '@core/utils/expediente'
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component'
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component'
import { capitalizedFirstWord } from '@core/utils/string'
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite'
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { RegistrarPlazoComponent } from '@core/components/modals/acto-procesal/asignar-plazo/registrar-plazo/registrar-plazo.component'
import { AmpliarPlazoRequest, RequerimientoProrrogaInvPreparatoria, ResolucionAutoResuelveRequerimientoProrrogaDTO } from '@core/interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface'

@Component({
  standalone: true,
  selector: 'app-resolucion-auto-resuelve-requerimiento-prorroga',
  templateUrl:
    './resolucion-auto-resuelve-requerimiento-prorroga.component.html',
  styleUrls: [
    './resolucion-auto-resuelve-requerimiento-prorroga.component.scss',
  ],
  imports: [
    ButtonModule,
    RadioButtonModule,
    CalendarModule,
    CommonModule,
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
    CmpLibModule,
    MensajeCompletarInformacionComponent,
    MensajeInteroperabilidadPjComponent
  ],
  providers: [MessageService, DialogService, MensajeNotificacionService, NgxCfngCoreModalDialogService],
})
export class ResolucionAutoResuelveRequerimientoProrrogaComponent implements OnInit {

  @Input() idCaso: string = ''
  @Input() idEstadoTramite = 0
  @Input() idActoTramiteCaso = ''
  @Input() idEtapa: string = ''
  @Input() tramiteSeleccionado: TramiteProcesal | null = null
  @Input() validacionTramite!: ValidacionTramite

  private readonly tramiteService = inject(TramiteService)
  private readonly gestionCasoService  = inject(GestionCasoService)
  private readonly modalDialogService  = inject(NgxCfngCoreModalDialogService)
  private readonly dialogService = inject(DialogService)
  protected readonly iconAsset = inject(IconAsset)
  private readonly casoService = inject(Casos)
  protected readonly resolucionAutoRequerimientoProrrogaService = inject(ResolucionAutoRequerimientoProrrogaService)
 
  private readonly suscripciones: Subscription[] = []
  protected ocultarBotonGuardar: boolean = false
  protected fechaIngreso: Date | null = null
  protected tramiteGuardado: boolean = false
  protected caso: Expediente
  protected plazos: AmpliarPlazoRequest | null = null
  protected datosProrrogaInvPreparatoria: ResolucionAutoResuelveRequerimientoProrrogaDTO | null = null

  protected formulario: FormGroup = new FormGroup({
    idResultado: new FormControl(null, [Validators.required]),
    plazo: new FormControl(null),
    fechaNotificacion: new FormControl(null, [Validators.required]),
    conAudio: new FormControl(false),
    conVideo: new FormControl(false),
    observacion: new FormControl(null),
  })

  protected codFundado: number = 1509
  protected codFundadoParte: number = 1510
  protected codInfundado: number = 1511

  constructor() {
    this.caso = this.gestionCasoService.casoActual
  }

  ngOnInit() {

      this.obtenerFormulario()

      this.fechaIngreso = getDateFromString(this.gestionCasoService.expedienteActual.fechaIngresoDenuncia)

  
      if (this.tramiteEstadoRecibido || this.tramiteEnModoVisor) {
        this.ocultarBotonGuardar = true
        this.tramiteGuardado = true
        this.formulario.disable()
      }
  
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((e) => e.unsubscribe())
  }

  get esFundadoEnParte(): boolean {
    return this.formulario.get('idResultado')!.value === this.codFundadoParte
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
  }

  get tieneActoTramiteCasoDocumento(): boolean {
    return !(this.idActoTramiteCaso == null || this.idActoTramiteCaso == '')
  }

  get servicioNoActivo(): boolean {
    return !this.tieneActoTramiteCasoDocumento && !this.tramiteEstadoRecibido
  }

  get seRegistraronPlazos(): boolean {
    return this.plazos !== undefined && this.plazos !== null
  }

  protected get formularioValido(): boolean {
    return this.formulario.valid
  }

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor
  }

  protected nombreTramite(): string {
      return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }

  protected obtenerFormulario(): void {
    this.suscripciones.push(
      this.resolucionAutoRequerimientoProrrogaService.obtenerDatosAutoResuelveProrrogaInvPreparatoria(this.idActoTramiteCaso)
      .subscribe({
        next: (resp) => {
          this.obtenerDetalleActoTramiteCaso()
          this.formulario.patchValue({
            idResultado: resp.idRespuestaRequerimiento,
            plazo: resp.plazos,
            fechaNotificacion: obtenerFechaTipoDate(resp.fechaNotificacion),
            conAudio: resp.conAudio,
            conVideo: resp.conVideo,
            observacion: resp.observaciones,
          })
          this.datosProrrogaInvPreparatoria = resp
        },
        error: () => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar obtener la información del trámite`, 'Aceptar');
        }
      })
    )
  }

  private obtenerDetalleActoTramiteCaso(): void {
    this.casoService.actoTramiteDetalleCaso(this.idActoTramiteCaso)
      .subscribe({
        next: (resp: any) => {
          if (resp.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO) {
            this.ocultarBotonGuardar = true
            this.tramiteGuardado = true
            this.formulario.disable()
          }
        }
      })
  }

  protected registrarAutoResuelveRequerimientoProrroga(): void {

    const resp = this.formulario.getRawValue()
    const request: Partial<ResolucionAutoResuelveRequerimientoProrrogaDTO> = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      idRespuestaRequerimiento: resp.idResultado,
      fechaNotificacion: obtenerFechaDDMMYYYY(resp.fechaNotificacion),
      conAudio: resp.conAudio,
      conVideo: resp.conVideo,
      observaciones: resp.observacion,
      plazos: resp.idResultado === this.codFundadoParte ? this.datosProrrogaInvPreparatoria!.plazos : undefined
    }
    this.suscripciones.push(
      this.resolucionAutoRequerimientoProrrogaService.guardarDatosAutoResuelveProrrogaInvPreparatoria(request)
      .subscribe({
        next: () => {
          this.ocultarBotonGuardar = true
          this.tramiteGuardado = true
          this.formulario.disable()
          this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
          this.modalDialogService.success(
            'Datos guardado correctamente',
            'Se guardaron correctamente los datos para el trámite: <b>' + this.nombreTramite() + '</b>.',
            'Aceptar'
          )
        },
        error: () => {
          this.modalDialogService.error(
            'Error',
            'No se pudo guardar la información para el trámite: <b>' + this.nombreTramite() + '</b>.',
            'Aceptar'
          )
        }
      })
    )
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
         this.datosProrrogaInvPreparatoria!.plazos = this.plazos
      }
    })
  
  }

  protected contarDescripcionObservacion(): number {
    return this.formulario.get('observacion')!.value !== null
      ? this.formulario.get('observacion')!.value.length
      : 0
  }

  protected openModalSelectTramite(): void {
    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      width: '800px',
      showHeader: false,
      data: {
        tipo: 2,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idEtapa: this.idEtapa,
      },
    } as DynamicDialogConfig);
    ref.onClose.subscribe((confirm) => {
      if (confirm === RESPUESTA_MODAL.OK) window.location.reload()
    })
  }

  // @Input() idCaso: string = ''
  // @Input() etapa: string = ''
  // @Input() idEtapa: string = ''
  // @Input() esNuevo: boolean = false
  // @Input() tramiteSeleccionado: TramiteProcesal | null = null
  // @Input() idActoTramiteProcesalEnlace: string = ''
  // @Input() idEstadoTramite: number = 0
  // @Input() flgIngresoTramite: string = ''

  // @Input() deshabilitado: boolean = false

  // @Output() ocultarTitulo = new EventEmitter<boolean>()
  // @Output() ocultarBotonTramite = new EventEmitter<boolean>()
  // @Output() datosFormulario = new EventEmitter<any>()
  // @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>()

  // public obtenerIcono = obtenerIcono

  // public formulario: FormGroup = new FormGroup({
  //   idResultado: new FormControl(null, [Validators.required]),
  //   plazo: new FormControl(null),
  //   fechaNotificacion: new FormControl(null, [Validators.required]),
  //   tieneAudio: new FormControl(false),
  //   tieneVideo: new FormControl(false),
  //   observacion: new FormControl(null),
  // })

  // public refModal!: DynamicDialogRef
  // public suscripciones: Subscription[] = []
  // public casoFiscal: Expediente | null = null
  // public plazoRequest: RegistrarPlazoRequest | null = null
  // public datosResolucion: ResolucionAutoRequerimientoProrroga | null = null

  // public codFundado: number = TIPO_RESULTADO.FUNDADO
  // public codFundadoParte: number = TIPO_RESULTADO.FUNDADO_EN_PARTE
  // public codInfundado: number = TIPO_RESULTADO.INFUNDADO

  // public idCasoPlazo: string = ''
  // public tramiteGuardado: boolean = false

  // constructor(
  //   private spinner: NgxSpinnerService,
  //   private dialogService: DialogService,
  //   private resolucionProrroga: ResolucionAutoRequerimientoProrrogaService,
  //   private mensajeService: MensajeNotificacionService,
  //   private gestionCasoService: GestionCasoService,
  //   private casoService: Casos
  // ) {
  //   this.ocultarBotonTramite.emit(true)
  // }

  // async ngOnInit() {
  //   this.casoFiscal = this.gestionCasoService.expedienteActual

  //   this.obtenerPlazoRequerimiento()

  //   if (this.estadoRecibido) {
  //     await this.obtenerResolucion()

  //     this.formulario.patchValue({
  //       idResultado: this.datosResolucion!.idResultado,
  //       plazo: this.datosResolucion!.plazo,
  //       fechaNotificacion:
  //         this.datosResolucion!.fechaNotificacion !== null
  //           ? new Date(this.datosResolucion!.fechaNotificacion)
  //           : null,
  //       tieneAudio: this.datosResolucion!.tieneAudio,
  //       tieneVideo: this.datosResolucion!.tieneVideo,
  //       observacion: this.datosResolucion!.observacion,
  //     })
  //     this.formulario.disable()
  //     this.tramiteGuardado = true
  //   }
  // }

  // ngOnDestroy(): void {
  //   this.ocultarTitulo.emit(false)
  //   this.ocultarBotonTramite.emit(false)
  //   this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe())
  // }

  // get estadoRecibido(): boolean {
  //   return (
  //     this.idEstadoTramite !== null &&
  //     this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
  //   )
  // }

  // get estadoPedienteCompletar(): boolean {
  //   return (
  //     this.idEstadoTramite !== null &&
  //     this.idEstadoTramite === ESTADO_REGISTRO.PENDIENTE_COMPLETAR
  //   )
  // }

  // get documentoIngresadoPorMPE(): boolean {
  //   return this.flgIngresoTramite !== null && this.flgIngresoTramite === '1'
  // }

  // public obtenerPlazoRequerimiento() {
  //   this.suscripciones.push(
  //     this.resolucionProrroga.obtenerPlazoRequerimiento(this.idCaso).subscribe({
  //       next: (resp) => {
  //         this.plazoRequest = resp
  //         this.idCasoPlazo = this.plazoRequest!.idPlazo!
  //       },
  //       error: (error) => {
  //         console.error(error)
  //       },
  //     })
  //   )
  // }

  // public obtenerResolucion(): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.suscripciones.push(
  //       this.resolucionProrroga
  //         .obtenerResolucion(this.idActoTramiteProcesalEnlace)
  //         .pipe(
  //           catchError((error) => {
  //             this.spinner.hide()
  //             console.error(error)
  //             reject(error)
  //             return of([])
  //           })
  //         )
  //         .subscribe((resp) => {
  //           this.datosResolucion = resp
  //           this.plazoRequest = resp.plazo
  //           resolve()
  //         })
  //     )
  //   })
  // }

  // public mostrarModal(): void {
  //   const ref = this.dialogService.open(PlazoAmpliacionComponent, {
  //     showHeader: false,
  //     data: {
  //       idCaso: this.idCaso,
  //       calificarCaso: this.casoFiscal,
  //       idTramite: this.tramiteSeleccionado!.idTramite,
  //       idActoProcesal: this.tramiteSeleccionado!.idActoTramiteConfigura,
  //       plazos: this.plazoRequest,
  //       idResultado: this.formulario.get('idResultado')!.value,
  //     },
  //   })

  //   ref.onClose.subscribe((data) => {
  //     this.plazoRequest = data
  //     this.plazoRequest!.idPlazo = this.idCasoPlazo
  //     this.formulario.get('plazo')!.setValue(this.plazoRequest)
  //   })
  // }

  // guardar() {
  //   this.spinner.show()
  //   let data: ResolucionAutoRequerimientoProrroga =
  //     this.formulario.getRawValue()
  //   if (
  //     data.idResultado === undefined ||
  //     data.idResultado === null ||
  //     data.idResultado === 0
  //   ) {
  //     this.mensajeService.verMensajeWarning(
  //       'Datos Incompletos',
  //       'Debe seleccionar el resultado'
  //     )
  //     this.spinner.hide()
  //   } else if (
  //     data.idResultado !== this.codInfundado &&
  //     (data.plazo === undefined || data.plazo === null)
  //   ) {
  //     this.mensajeService.verMensajeWarning(
  //       'Datos Incompletos',
  //       'Debe ingresar el plazo'
  //     )
  //     this.spinner.hide()
  //   } else if (
  //     data.fechaNotificacion === undefined ||
  //     data.fechaNotificacion === null
  //   ) {
  //     this.mensajeService.verMensajeWarning(
  //       'Datos Incompletos',
  //       'Debe ingresar la fecha de notificación'
  //     )
  //     this.spinner.hide()
  //   } else {
  //     this.spinner.hide()
  //     const alert = this.dialogService.open(AlertaModalComponent, {
  //       width: '600px',
  //       showHeader: false,
  //       data: {
  //         icon: 'warning',
  //         title: 'CONFIRMAR CREAR TRÁMITE',
  //         description: `¿Está seguro que desea guardar los datos y el trámite <strong>"Resolución - auto que resuelve el requerimiento de prórroga de investigación preparatoria"</strong>?. Por favor confirme esta acción.`,
  //         confirmButtonText: 'Confirmar',
  //         confirm: true,
  //       },
  //     } as DynamicDialogConfig<AlertaData>)
  //     alert.onClose.subscribe({
  //       next: (resp) => {
  //         if (resp === 'confirm') {
  //           data.fechaNotificacion = new Date(data.fechaNotificacion)
  //           data.idActoTramiteCaso = this.idActoTramiteProcesalEnlace
  //           data.idCaso = this.idCaso
  //           this.suscripciones.push(
  //             this.resolucionProrroga
  //               .guardarResolucion(this.idCaso, data)
  //               .subscribe({
  //                 next: async (resp) => {
  //                   if (resp.code === '0') {
  //                     this.formulario.disable()
  //                     this.tramiteGuardado = true
  //                     const caso = await lastValueFrom(
  //                       this.casoService.obtenerCasoFiscal(this.idCaso)
  //                     )
  //                     await this.gestionCasoService.actualizarCaso(caso)
  //                     this.mensajeService.verMensajeNotificacion(
  //                       'REGISTRO CORRECTAMENTE',
  //                       `Se registró correctamente la información de la <strong>Resolución judicial - Auto que resuelve el requerimiento de Prórroga de Investigación Preparatoria.</strong>`,
  //                       'success'
  //                     )
  //                   }
  //                 },
  //                 error: (error) => {
  //                   console.error(error)
  //                   this.spinner.hide()
  //                   this.mensajeService.verMensajeErrorServicio()
  //                 },
  //               })
  //           )
  //         }
  //       },
  //     })
  //   }
  // }

  // openModalSelectTramite() {
  //   const selectActoTramite = this.dialogService.open(
  //     GuardarTramiteProcesalComponent,
  //     {
  //       width: '800px',
  //       showHeader: false,
  //       data: {
  //         tipo: 1,
  //         idCaso: this.idCaso,
  //         idEtapa: this.idEtapa,
  //         idActoProcesal: 0,
  //       },
  //     } as DynamicDialogConfig
  //   )
  // }

  // public icon(name: string): string {
  //   return `assets/icons/${name}.svg`
  // }

  // get iconButton(): string {
  //   return this.formulario.get('plazo')!.value ? 'success' : 'error'
  // }

  // public counterReportChar(): number {
  //   return this.formulario.get('observacion')!.value !== null
  //     ? this.formulario.get('observacion')!.value.length
  //     : 0
  // }



}
