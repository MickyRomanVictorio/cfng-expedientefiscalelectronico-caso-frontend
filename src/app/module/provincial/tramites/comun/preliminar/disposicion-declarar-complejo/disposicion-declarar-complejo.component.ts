import { Component, EventEmitter, inject, Input, Output } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RegistrarPlazoComponent } from '@core/components/modals/acto-procesal/asignar-plazo/registrar-plazo/registrar-plazo.component'
import { CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum, } from '@core/constants/constants'
import { ID_ETAPA } from '@core/constants/menu'
import { Alerta, AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { AmpliarPlazoRequest, DisposicionDeclararComplejo } from '@core/interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface'
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service'
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { AlertaService } from '@core/services/shared/alerta.service'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { TokenService } from '@core/services/shared/token.service'
import { Expediente } from '@core/utils/expediente'
import { DeclararComplejoService } from '@services/provincial/tramites/declarar-complejo.service'
import { ESTADO_REGISTRO, ETAPA_TRAMITE, IconAsset } from 'dist/ngx-cfng-core-lib'
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
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
  imports: [
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
  ],
  standalone: true,
  selector: 'app-disposicion-declarar-complejo',
  templateUrl: './disposicion-declarar-complejo.component.html',
  styleUrls: ['./disposicion-declarar-complejo.component.scss'],
  providers: [NgxCfngCoreModalDialogService],
})
export class DisposicionDeclararComplejoComponent {

  @Input() idCaso!: string
  @Input() numeroCaso: string = '';
  @Input() idActoTramiteCaso!: string
  @Input() etapa!: string
  @Input() idEtapa!: string
  @Input() tramiteSeleccionado: TramiteProcesal | null = null
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>()
  @Input() iniTramiteCreado: boolean = false;

  protected readonly iconAsset = inject(IconAsset)

  protected caso: Expediente
  public datosDeclararComplejo: DisposicionDeclararComplejo | null = null
  public plazos: AmpliarPlazoRequest | null = null

  private fechaInicioDiligencia: string = ''
  private fechaFinDiligencia: string = ''
  private informacionCasoInicial: string = ''
  protected bloquearFormulario: boolean = false
  protected estaIncompleto: string = '1'

  private readonly suscripciones: Subscription[] = []
  private readonly alertaService = inject(AlertaService)
  private readonly gestionCasoService = inject(GestionCasoService)
  private readonly firmaIndividualService = inject(FirmaIndividualService)
  private readonly dialogService = inject(DialogService)
  private readonly casoService = inject(Casos)
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  protected tramiteService = inject(TramiteService)
  protected declararComplejoService = inject(DeclararComplejoService);
  private readonly tokenService = inject(TokenService);

  private readonly desuscribir$ = new Subject<void>()

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

  get seRegistraronPlazos(): boolean {
    return this.plazos !== undefined && this.plazos !== null
  }

  get formularioValido(): boolean {
    return this.seRegistraronPlazos
  }

  protected elFormularioHaCambiado(): boolean {
    return this.informacionCasoInicial !== JSON.stringify(this.datosDeclararComplejo)
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

  protected verBotonGuardar(valor: boolean) {
    this.tramiteService.formularioEditado = valor
  }

  public abrirModalPlazos(): void {

    const ref = this.dialogService.open(RegistrarPlazoComponent, {
      showHeader: false,
      width: '60rem',
      data: {
        idCaso: this.idCaso,
        calificarCaso: this.caso,
        idTramite: this.tramiteSeleccionado?.idTramite,
        idActoProcesal: this.tramiteSeleccionado!.idActoTramiteConfigura,
        idActoTramiteEstado: this.tramiteSeleccionado!.idActoTramiteEstado,
        fechaInicioDiligencia: this.datosDeclararComplejo?.fechaInicioDiligencia,
        fechaFinDiligencia: this.datosDeclararComplejo?.fechaFinDiligencia,
        plazos: this.datosDeclararComplejo?.plazos,
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

  public obtenerFormulario() {
    this.suscripciones.push(
      this.declararComplejoService
        .obtenerInformacionDeclararComplejo(this.etapa, this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.obtenerDetalleActoTramiteCaso()
            if (resp != undefined && resp != null) {
              this.datosDeclararComplejo = resp
              this.fechaInicioDiligencia = resp.fechaInicioDiligencia
              this.fechaFinDiligencia = resp.fechaFinDiligencia
              this.plazos = this.datosDeclararComplejo!.plazos
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
            this.modalDialogService.error(
              'Error',
              error.error.message,
              'Aceptar'
            )
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
    return this.declararComplejoService.guardarDisposicionDeclararComplejo(this.etapa, this.datosDeclararComplejo)
      .pipe(
        tap(() => {
          this.modalDialogService.success(
            'Datos guardados correctamente',
            'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
            'Aceptar'
          )
          this.informacionCasoInicial = JSON.stringify(this.datosDeclararComplejo)
          this.estaIncompleto = this.datosDeclararComplejo!.formularioIncompleto
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

    this.datosDeclararComplejo = {
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
    let codigoAlerta = this.idEtapa === ETAPA_TRAMITE.ETAPA_PRELIMINAR ? CodigoAlertaTramiteEnum.AL_DC : CodigoAlertaTramiteEnum.AL_DCP
    const request: AlertaGeneralRequestDTO = {
      idCaso: this.idCaso,
      numeroCaso: this.caso.numeroCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      codigoAlertaTramite: codigoAlerta,
      idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
      destino: CodigoDestinoAlertaTramiteEnum.PROV_FISCAL_ASIGNADO
    }
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe()
  }

}