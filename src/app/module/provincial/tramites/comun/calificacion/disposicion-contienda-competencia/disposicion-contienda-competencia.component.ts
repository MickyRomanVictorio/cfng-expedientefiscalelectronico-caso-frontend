import { CommonModule } from '@angular/common'
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { ContiendaCompetencia } from '@interfaces/provincial/tramites/comun/calificacion/contienda-competencia/contienda-competencia'
import { ContiendaCompetenciaService } from '@services/provincial/tramites/comun/calificacion/contienda-competencia/contienda-competencia.service'
import { MaestroService } from '@services/shared/maestro.service'
import { TokenService } from '@services/shared/token.service'
import { ENTIDAD, TIPO_ENTIDAD } from '@core/types/efe/provincial/tramites/comun/calificacion/contienda-competencia.type'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { NgxSpinnerService } from 'ngx-spinner'
import { DropdownModule } from 'primeng/dropdown'
import { Observable, of, Subject, Subscription, throwError } from 'rxjs'
import { catchError, switchMap, takeUntil } from 'rxjs/operators'
import { TramiteProcesal } from "@interfaces/comunes/tramiteProcesal"
import { TramiteService } from "@services/provincial/tramites/tramite.service"
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog'
import { Alerta, AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta'
import { AlertaService } from '@core/services/shared/alerta.service'
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service'
import { CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum } from '@core/constants/constants'
import { ID_ETAPA } from '@core/constants/menu'
import { ESTADO_REGISTRO, IconAsset } from 'dist/ngx-cfng-core-lib'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service'
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component'
import { capitalized } from '@core/utils/string'

@Component({
  standalone: true,
  imports: [CommonModule, DropdownModule, FormsModule, ReactiveFormsModule, CmpLibModule, NgxCfngCoreModalDialogModule, MensajeCompletarInformacionComponent],
  selector: 'app-disposicion-contienda-competencia',
  templateUrl: './disposicion-contienda-competencia.component.html',
  styleUrls: ['./disposicion-contienda-competencia.component.scss']
})
export class DisposicionContiendaCompetenciaComponent implements OnInit {

  @Input() idCaso!: string
  @Input() numeroCaso: string = ''
  @Input() idEtapa: string = ''
  @Input() idActoTramiteCaso!: string
  @Input() etapa!: string
  @Input() tramiteSeleccionado: TramiteProcesal | null = null
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>()
  @Input() iniTramiteCreado: boolean = false

  private readonly formulario = inject(FormBuilder)
  private readonly maestroService = inject(MaestroService)
  private readonly contiendaService = inject(ContiendaCompetenciaService)
  private readonly tokenService = inject(TokenService)
  private readonly spinner = inject(NgxSpinnerService)
  protected tramiteService = inject(TramiteService)
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly alertaService = inject(AlertaService)
  private readonly firmaIndividualService = inject(FirmaIndividualService)
  private readonly casoService = inject(Casos)
  protected readonly iconAsset = inject(IconAsset);
  
  protected tiposContienda: any[] = []
  protected distritosFiscales: any[] = []
  protected fiscaliasSuperiores: any[] = []
  protected formularioDisposicionContienda: FormGroup
  protected coDistritoFiscalUsuario: string = ''
  protected bloquearFormulario: boolean = false
  protected estaIncompleto: string = '1'
  protected TIPO_CONTIENDA_NEGATIVA: number = 1

  private informacionCasoInicial: string = ''
  protected mostrarFiscaliasSuperioresYPresidencia: boolean = true
  protected mensajeValidacion: string = ''


  private readonly suscripciones: Subscription[] = []
  private readonly desuscribir$ = new Subject<void>()

  constructor(
  ) {
    this.formularioDisposicionContienda = this.formulario.group({
      tipoContienda: [this.TIPO_CONTIENDA_NEGATIVA, Validators.required],
      distritoFiscal: [null, Validators.required],
      fiscaliaSuperior: [null],
      formularioIncompleto: ['0']
    })
    this.coDistritoFiscalUsuario = this.tokenService.getDecoded().usuario.codDistritoFiscal
  }

  ngOnInit() {

    this.resolverAlertas()

    this.obtenerDistritosFiscales()

    this.obtenerDatosFormulario()

    this.firmaIndividualService.esFirmadoCompartidoObservable.pipe(
      takeUntil(this.desuscribir$)
    ).subscribe(
      (respuesta: any) => {
        if (respuesta.esFirmado) {
          const request: AlertaGeneralRequestDTO = {
            idCaso: this.idCaso,
            numeroCaso: this.numeroCaso,
            idActoTramiteCaso: this.idActoTramiteCaso,
            codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_SUP_CONT1,
            idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
            destino: CodigoDestinoAlertaTramiteEnum.SUP_FISCAL_SUPERIOR,
          }
          this.bloquearFormulario = true
          this.formularioDisposicionContienda.disable()
          this.registrarAlertas(request)
        }
      }
    )

    this.obtenerTipoContienda()

    this.manejarCambioDistritoFiscal()

    this.manejarCambioSuperiorPresidencia()

    this.peticionParaEjecutar.emit(() => this.guardarFormulario())

    this.formularioDisposicionContienda.valueChanges.subscribe({
      next: () => {
        this.establecerBotonesTramiteSiCambio()
      }
    })

  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(suscripcion => suscripcion.unsubscribe())
    this.desuscribir$.next()
    this.desuscribir$.complete()
  }

  get formularioValido(): boolean {
    const { tipoContienda, distritoFiscal, fiscaliaSuperior } = this.formularioDisposicionContienda.getRawValue()
    return tipoContienda !== null &&
           distritoFiscal !== null && 
           fiscaliaSuperior !== null
  }

  get esMismoDistritoFiscal(): boolean {
    const datos = this.formularioDisposicionContienda.getRawValue()
    return datos?.distritoFiscal === this.coDistritoFiscalUsuario
  }

  get etiquetaFiscaliaPresidenciaElevar(): string {
    const datos = this.formularioDisposicionContienda.getRawValue()
    return datos.distritoFiscal === this.coDistritoFiscalUsuario ? 'Físcalia Superior a elevar' : 'Presidencia del distrito fiscal'
  }
  
  private obtenerTipoContienda(): void {
    this.suscripciones.push(
      this.maestroService.listarTipoContienda().subscribe(resp => {
        this.tiposContienda = resp
      })
    )
  }

  private obtenerDistritosFiscales(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show()
      this.suscripciones.push(
        this.contiendaService.listarDistritosFiscales().subscribe({
          next: resp => {
            this.distritosFiscales = resp
            this.spinner.hide()
            resolve()
          },
          error: error => {
            console.error('Error al listar distritos fiscales', error)
            this.spinner.hide()
            reject(error instanceof Error ? error : new Error(JSON.stringify(error)))
          }
        })
      )
    })
  }

  private mostrarDistritoFiscalDelUsuario(coDistritoFiscal: string): void {
    const distritoFiscal = this.distritosFiscales.find(data => data.coDistritoFiscal === coDistritoFiscal)
    if (distritoFiscal) {
      this.formularioDisposicionContienda.patchValue({
        distritoFiscal: distritoFiscal.coDistritoFiscal
      })
    }
  }

  private manejarCambioDistritoFiscal(): void {
    this.formularioDisposicionContienda.get('distritoFiscal')!.valueChanges.pipe(
      switchMap(coDistritoFiscal => {
        this.mensajeValidacion = ''
        if (coDistritoFiscal && coDistritoFiscal !== '00') {
          return this.contiendaService.listarFiscaliasSuperioresYPresidencia(coDistritoFiscal).pipe(
            catchError(error => {
              console.error('Error al obtener fiscalias superiores y presidencia:', error)
              return of([])
            })
          )
        } else {
          this.fiscaliasSuperiores = []
          return of([])
        }
      })
    ).subscribe(resp => {

      this.fiscaliasSuperiores = this.esMismoDistritoFiscal
      ? resp.filter((entidad: any) => entidad.idTipoEntidad !== TIPO_ENTIDAD.PRESIDENCIA)
      : resp.filter((entidad: any) => entidad.idTipoEntidad === TIPO_ENTIDAD.PRESIDENCIA)

      if (this.fiscaliasSuperiores.length > 0) {
        const entidadSeleccionada = this.fiscaliasSuperiores[0]
        const fiscalSuper = this.formularioDisposicionContienda.get('fiscaliaSuperior')?.value;
        if (fiscalSuper == null) {
          this.formularioDisposicionContienda.patchValue({
            fiscaliaSuperior: entidadSeleccionada.coEntidad
          })
        }
        if (!this.esMismoDistritoFiscal) {
          this.mensajeValidacion = entidadSeleccionada.flNoefe === '1'
            ? ENTIDAD.NO_TIENE_EFE
            : ENTIDAD.TIENE_EFE
        }
        return
      }

      if ( !this.esMismoDistritoFiscal ) {
        this.mensajeValidacion = ENTIDAD.NO_TIENE_PRESIDENCIA
      }

    })

  }

  private manejarCambioSuperiorPresidencia(): void {
    this.formularioDisposicionContienda.get('fiscaliaSuperior')!.valueChanges.subscribe({
      next: resp => {
        if ( resp !== null ) {
          const entidadSeleccionada = this.fiscaliasSuperiores.find((entidad: any) => entidad.coEntidad === resp)

          /**this.contiendaService.notificarMensajeAdvertencia(`${capitalized(entidadSeleccionada.noEntidad)}`)**/
          if (entidadSeleccionada) {
            this.contiendaService.notificarMensajeAdvertencia(`${capitalized(entidadSeleccionada.noEntidad)}`)
          } else {
            this.contiendaService.notificarMensajeAdvertencia('')
          }
          return
        }
        this.contiendaService.notificarMensajeAdvertencia('')
      }
    })
  }

  private obtenerDatosFormulario(): void {
    this.spinner.show()
    this.suscripciones.push(
      this.contiendaService.obtenerDatosContiendaCompetencia(this.idActoTramiteCaso).subscribe({
        next: resp => {
          this.obtenerDetalleActoTramiteCaso()
          if (resp != undefined && resp != null) {
            this.formularioDisposicionContienda.patchValue({
              tipoContienda: resp.idTipoContienda === 0 ? this.TIPO_CONTIENDA_NEGATIVA : resp.idTipoContienda,
              distritoFiscal: resp.coDistritoFiscal ?? this.coDistritoFiscalUsuario,
              fiscaliaSuperior: resp.coEntidad,
              formularioIncompleto: resp.formularioIncompleto ?? '0'
            })
            this.informacionCasoInicial = JSON.stringify(this.formularioDisposicionContienda.getRawValue())
            if ( resp.coDistritoFiscal === null ){
              this.mostrarDistritoFiscalDelUsuario(this.coDistritoFiscalUsuario)
            }
            if (resp.formularioIncompleto === '0') {
              this.estaIncompleto = '0'
              this.habilitarFirma()
            }
            setTimeout(() => {
              this.establecerBotonesTramiteSiCambio()
            }, 1000)
          }
        },
        error: error => {
          console.error('Error al obtener datos de contienda', error)
          this.spinner.hide()
        }
      })
    )
  }

  private habilitarFirma(): void {
    this.formularioEditado(false)
    this.habilitarGuardar(false)
  }

  private formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor
  }

  private habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor
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

  protected elFormularioHaCambiado(): boolean {
    return this.informacionCasoInicial !== JSON.stringify(this.formularioDisposicionContienda.getRawValue())
  }

  private obtenerDetalleActoTramiteCaso(): void {
    this.casoService.actoTramiteDetalleCaso(this.idActoTramiteCaso)
    .subscribe({
      next: (resp: any) => {
        if (resp.idEstadoTramite === ESTADO_REGISTRO.FIRMADO) {
          this.bloquearFormulario = true
          this.formularioDisposicionContienda.disable()
        }
      }
    })
  }

  private guardarFormulario(): Observable<any> {
    const formulario = this.formularioDisposicionContienda.getRawValue()
    let coEntidadDestino = formulario.fiscaliaSuperior
    const dataContiendaCompetencia: ContiendaCompetencia = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      idTipoContienda: formulario.tipoContienda,
      coDistritoFiscal: formulario.distritoFiscal,
      coEntidadDestino: coEntidadDestino,
      formularioIncompleto: this.formularioValido ? '0' : '1',
    }
    return this.contiendaService.guardarContiendaCompetencia(dataContiendaCompetencia).pipe(
      switchMap(_ => {
        this.tramiteService.formularioEditado = false
        this.modalDialogService.success(
          'Datos guardados correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
          'Aceptar'
        )
        return of('válido')
      }),
      catchError(() => {
        this.modalDialogService.error(
          'Error',
          'No se pudo guardar la información para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
          'Aceptar'
        )
        return throwError(() => new Error('Error al guardar.'))
      })
    )
  }

  // ALERTAS

  private registrarAlertas(request: AlertaGeneralRequestDTO): void {
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe()
  }

  private resolverAlertas() {
    if (this.iniTramiteCreado && (this.idEtapa == ID_ETAPA.CALIFICACION || this.idEtapa == ID_ETAPA.PRELIMINAR)) {
      this.solucionarAlerta()
    }
  }

  private solucionarAlerta(): void {
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

}