import { CommonModule } from '@angular/common'
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AsociarSujetosDelitosComponent } from '@core/components/reutilizable/asociar-sujetos-delitos/asociar-sujetos-delitos.component'
import { CodigoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum, } from '@core/constants/constants'
import { ID_ETAPA } from '@core/constants/menu'
import { Alerta, AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service'
import { AlertaService } from '@core/services/shared/alerta.service'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { TokenService } from '@core/services/shared/token.service'
import { Expediente } from '@core/utils/expediente'
import { IndagacionesPrevias } from '@interfaces/provincial/tramites/comun/preliminar/indagaciones-previas.interface'
import { IndagacionesPreviasService } from '@services/provincial/tramites/indagaciones-previas.service'
import { TramiteService } from '@services/provincial/tramites/tramite.service'
import { validOnlyNumberDrop, validOnlyNumberOnPaste, validOnlyNumbers, } from '@utils/utils'
import { ESTADO_REGISTRO, IconAsset, ValidationModule } from 'dist/ngx-cfng-core-lib'
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { InputTextModule } from 'primeng/inputtext'
import { catchError, map, Observable, Subject, Subscription, takeUntil, tap, throwError } from 'rxjs'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    AsociarSujetosDelitosComponent,
    ValidationModule
  ],
  providers: [NgxCfngCoreModalDialogService],
  selector: 'app-disposicion-indagaciones-previas',
  templateUrl: './disposicion-indagaciones-previas.component.html',
  styleUrls: ['./disposicion-indagaciones-previas.component.scss'],
})
export class DisposicionIndagacionesPreviasComponent implements OnInit, OnDestroy {

  @Input() idCaso!: string
  @Input() numeroCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() idActoTramiteCaso!: string
  @Input() etapa!: string
  @Input() tramiteSeleccionado: TramiteProcesal | null = null
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>()
  @Input() iniTramiteCreado: boolean = false;

  protected dias: number = 0
  private diasGuardado: number = 0
  protected datosForm!: IndagacionesPrevias
  protected caso: Expediente
  protected bloquearFormulario: boolean = false
  protected estaIncompleto: string = '1'

  private readonly tramiteService = inject(TramiteService)
  private readonly indagacionesService = inject(IndagacionesPreviasService)
  private readonly alertaService = inject(AlertaService)
  private readonly gestionCasoService = inject(GestionCasoService)
  private readonly firmaIndividualService = inject(FirmaIndividualService)
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly casoService = inject(Casos)
  protected iconAsset = inject(IconAsset)
  private readonly tokenService = inject(TokenService)

  private readonly suscripciones: Subscription[] = []
  private readonly desuscribir$ = new Subject<void>()

  private informacionCasoInicial: string = ''
  protected seHanRegistradoAsociaciones: boolean = false

  constructor(

  ) {
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
      .subscribe((respuesta: any) => {
        if (respuesta.esFirmado) {
          this.registrarAlertas()
          this.bloquearFormulario = true
        }
      })
  }

  resolverAlertas() {
    if (this.iniTramiteCreado && (this.idEtapa==ID_ETAPA.CALIFICACION)) {
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
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe())
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  get tiempoValido(): boolean {
    return this.dias !== undefined &&
      this.dias !== null &&
      this.dias > 0
  }

  get formularioValido(): boolean {
    return this.tiempoValido &&
      this.seHanRegistradoAsociaciones
  }

  public alSeleccionar(): void {
    this.dias = Number(this.dias.toString().replace(/^0+/, ''))
    if (this.dias > 1000) {
      this.dias = 1000
    }
    if (this.dias === 0) {
      this.dias = 0
    }
    this.datosForm = {
      plazo: this.dias,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      formularioIncompleto: this.formularioValido ? '0' : '1',
    }
    this.establecerBotonesTramiteSiCambio()
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

  protected elFormularioHaCambiado(): boolean {
    return this.informacionCasoInicial !== JSON.stringify(this.datosForm)
  }

  public habilitarFirma(): void {
    this.formularioEditado(false)
    this.habilitarGuardar(false)
  }

  public obtenerFormulario() {
    this.suscripciones.push(
      this.indagacionesService
        .obtenerIndagacionesPrevias(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.obtenerDetalleActoTramiteCaso()
            if (resp != undefined && resp != null) {
              this.datosForm = resp
              this.diasGuardado = resp.plazo
              this.dias = resp.plazo
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
          error: (e) => {
            console.error(e.error)
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

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor
  }

  protected guardarFormulario(): Observable<any> {
    return this.indagacionesService.guardarIndagacionesPrevias(this.datosForm).pipe(
      tap(() => {
        this.modalDialogService.success(
          'Datos guardados correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
          'Aceptar'
        )
        this.informacionCasoInicial = JSON.stringify(this.datosForm)
        this.estaIncompleto = this.datosForm.formularioIncompleto
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
  protected establecerSiSeHanRegistradoAsociaciones(valor: boolean): void {
    this.seHanRegistradoAsociaciones = valor
    this.alSeleccionar()
  }

  protected registrarAlertas(): void {
    const request: AlertaGeneralRequestDTO = {
      idCaso: this.idCaso,
      numeroCaso: this.caso.numeroCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_IP,
      idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
    }
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe()
  }

  protected validOnlyNumbers(event: any): boolean {
    const valor = this.dias !== null && this.dias !== undefined ? this.dias.toString() : ''
    if (valor === '' && event.key === '0') {
      return true
    }
    if (valor === '0' && event.key === '0') {
      event.preventDefault()
      return false
    }
    return validOnlyNumbers(event)
  }

  protected validOnlyNumberOnPaste(evento: ClipboardEvent): any {
    return validOnlyNumberOnPaste(evento)
  }

  protected validOnlyNumberDrop(evento: DragEvent): any {
    return validOnlyNumberDrop(evento)
  }

}
