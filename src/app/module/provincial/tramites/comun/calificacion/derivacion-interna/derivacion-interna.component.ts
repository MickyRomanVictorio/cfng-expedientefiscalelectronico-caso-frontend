import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { concatMap, debounceTime, firstValueFrom, Observable, of, Subject, Subscription, takeUntil, throwError } from 'rxjs'
import { NgxSpinnerService } from 'ngx-spinner'
import { AlertaFormulario } from '@core/interfaces/comunes/alerta-formulario.interface'
import { obtenerAlertasDeArchivo } from '@utils/validacion-tramites'
import { ReusablesAlertas } from '@services/reusables/reusable-alertas.service'
import { AlertasTramiteComponent } from '@components/generales/alertas-tramite/alertas-tramite.component'
import { DropdownModule } from 'primeng/dropdown'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox'
import { InputTextModule } from 'primeng/inputtext'
import { MaestroService } from '@services/shared/maestro.service'
import { TokenService } from '@services/shared/token.service'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import {
  DISTRITO_FISCAL_LIMA_CENTRO,
  ESPECIALIDAD_COMUN,
  ESTADO_REGISTRO,
  getValidString,
  IconAsset,
  TIPO_DERIVACION,
  TIPO_ESPECIALIDAD_PENAL,
} from 'ngx-cfng-core-lib'
import { GestionarDerivacionService } from '@services/provincial/tramites/comun/calificacion/gestionar-derivacion/gestionar-derivacion.service'
import { obtenerIcono } from '@core/utils/icon'
import { TokenSession } from '@interfaces/shared/session.interface'
import { FirmaIndividualService } from '@services/firma-digital/firma-individual.service'
import { TramiteService } from '@services/provincial/tramites/tramite.service'
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators'
import { AlertaService } from '@core/services/shared/alerta.service'
import { Alerta, AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta'
import { ID_ETAPA } from '@core/constants/menu'
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { capitalizedFirstWord } from '@core/utils/string'
import { DerivacionInformacion } from '@core/interfaces/provincial/tramites/derivacion/derivacion-informacion.interface'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service'
import { AlertaDerivacion } from '@core/interfaces/provincial/tramites/derivacion/alerta-derivacion.interface'
import { CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum } from '@core/constants/constants'
import { Router } from '@angular/router'

@Component({
  selector: 'app-derivacion-interna',
  standalone: true,
  imports: [
    CommonModule,
    AlertasTramiteComponent,
    DropdownModule,
    ReactiveFormsModule,
    FormsModule,
    CheckboxModule,
    InputTextModule,
    CmpLibModule,
  ],
  templateUrl: './derivacion-interna.component.html',
  styleUrls: ['./derivacion-interna.component.scss'],
})
export class DerivacionInternaComponent implements OnInit, OnDestroy {

  @Input() idCaso: string = ''
  @Input() numeroCaso: string = ''
  @Input() etapa: string = ''
  @Input() idEtapa: string = ''
  @Input() tramiteSeleccionado: TramiteProcesal | null = null
  @Input() idActoTramiteCaso!: string
  @Output() peticionParaEjecutar = new EventEmitter<() => Observable<any>>()
  @Input() iniTramiteCreado: boolean = false

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly tramiteService = inject(TramiteService)
  private readonly maestroService = inject(MaestroService)
  private readonly gestionarDerivacionService = inject(GestionarDerivacionService)
  private readonly firmaIndividualService = inject(FirmaIndividualService)
  private readonly tokenService = inject(TokenService)
  private readonly spinner = inject(NgxSpinnerService)
  private readonly reusablesAlertas = inject(ReusablesAlertas)
  private readonly alertaService = inject(AlertaService)
  private readonly formulario = inject(FormBuilder)
  private readonly casoService = inject(Casos)
  protected readonly iconAsset = inject(IconAsset)
  private router =  inject(Router)

  protected tipoEspecialidades: any[] = []
  protected especialidades: any[] = []
  protected distritos: any[] = []
  protected fiscalias: any[] = []
  protected despachos: any[] = []
  protected codigoEntidad: string = ''
  protected codigoDespacho: string = ''
  protected codDistritoFiscal: string = ''
  protected idDistritoFiscal: number = 0
  protected idJerarquia: number = 0
  protected fiscaliaNoEFE: boolean = false
  protected especialidadNoEfe: boolean = false
  protected numeroCasoNoExiste: boolean = false
  protected numeroCasoValidado: boolean = false
  protected numeroCasoConcluido: boolean = false

  protected casoPorAcumularValidado: boolean = false
  protected numeroCasoNoPerteneceAlDespacho: boolean = false
  protected bloquearFormulario: boolean = false
  private estaIncompleto: string = '1'

  private derivacionInformacion: DerivacionInformacion | null = null
  private informacionDerivacionInicial: string = ''

  protected formularioDerivacion: FormGroup

  protected alertas: AlertaFormulario[] = []
  protected obtenerIcono = obtenerIcono
  private readonly suscripciones: Subscription[] = []

  private readonly desuscribir$ = new Subject<void>()

  constructor() {
    this.formularioDerivacion = this.formulario.group({
      tipoEspecialidad: [null, Validators.required],
      especialidad: [null, Validators.required],
      distrito: [null],
      fiscalia: [null],
      despacho: [null],
      esDerivacionDespachoEspecifico: [false],
      esDerivacionParaAcumulacion: [false],
      numeroCasoAlQueSeVaAcumular: [''],
    })
    const usuarioSesion: TokenSession = this.tokenService.getDecoded()
    this.codigoEntidad = usuarioSesion?.usuario.codDependencia || ''
    this.codigoDespacho = usuarioSesion?.usuario.codDespacho || ''
    this.codDistritoFiscal = usuarioSesion?.usuario.codDistritoFiscal || ''
    this.idDistritoFiscal = 2
    this.idJerarquia = parseInt(usuarioSesion?.usuario.codJerarquia, 10)
    this.formularioDerivacion.get('esDerivacionDespachoEspecifico')!.disable()
    this.formularioDerivacion.get('esDerivacionParaAcumulacion')!.disable()
  }

  ngOnInit(): void {
    this.inicializarComponente()
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe())
    this.desuscribir$.next()
    this.desuscribir$.complete()
  }

  get formularioValido(): boolean {
    const datos = this.formularioDerivacion.getRawValue()
    let resultado =
      this.alertas.length === 0 &&
      datos.tipoEspecialidad !== null &&
      ((datos.especialidad !== null && !this.mostrarDistritoGeografico) ||
        (datos.especialidad === null && this.especialidadNoEfe) ||
        (datos.especialidad !== null &&
          this.mostrarDistritoGeografico &&
          datos.distrito !== null)) &&
      (!datos.esDerivacionDespachoEspecifico ||
        (datos.esDerivacionDespachoEspecifico &&
          datos.fiscalia !== null &&
          datos.despacho !== null
        )
      ) &&
      (!datos.esDerivacionParaAcumulacion ||
        (datos.esDerivacionParaAcumulacion &&
          datos.numeroCasoAlQueSeVaAcumular !== '' &&
          this.numeroCasoValido &&
          this.casoPorAcumularValidado))

    return resultado
  }

  get esFiscaliaSeleccionada(): boolean {
    return this.formularioDerivacion.get('fiscalia')?.value != null
  }

  get esDerivacionDespachoEspecifico(): boolean {
    return this.formularioDerivacion.get('esDerivacionDespachoEspecifico')
      ?.value
  }

  get esDerivacionParaAcumulacion(): boolean {
    return this.formularioDerivacion.get('esDerivacionParaAcumulacion')?.value
  }

  get mostrarDistritoGeografico(): boolean {
    return (
      this.idDistritoFiscal === DISTRITO_FISCAL_LIMA_CENTRO &&
      this.formularioDerivacion.get('tipoEspecialidad')!.value === TIPO_ESPECIALIDAD_PENAL &&
      this.formularioDerivacion.get('especialidad')!.value === ESPECIALIDAD_COMUN
    )
  }

  get patronNumeroCasoValidado(): boolean {
    const numeroCaso: string = this.formularioDerivacion.get(
      'numeroCasoAlQueSeVaAcumular'
    )?.value
    const patron = /^\d+-\d{4}-\d+-(0|[1-9]\d*)$/
    const longitudCorrecta = numeroCaso.length <= 25
    const cantidadGuionesCorrecta = numeroCaso.split('-').length === 4
    return (
      patron.test(numeroCaso) && longitudCorrecta && cantidadGuionesCorrecta
    )
  }

  get numeroCasoValido(): boolean {
    return this.patronNumeroCasoValidado && this.numeroCasoValidado
  }

  private inicializarComponente(): void {
    /**this.resolverAlertas()**/

    /**this.obtenerAlertas().then(() => {**/
      this.obtenerTipoEspecialidades().pipe(
        concatMap(() => this.obtenerDistritoActual())
      ).subscribe({
        next: () => {
          this.obtenerDatosDerivacion()
        }
      })
    /** })**/

    this.peticionParaEjecutar.emit(() => this.guardarFormulario())

    this.formularioDerivacion.get('numeroCasoAlQueSeVaAcumular')?.valueChanges
      .pipe(debounceTime(2000))
      .subscribe((value: string) => {
        if (this.patronNumeroCasoValidado) {
          /**this.validarNumeroCaso(value)**/
          this.numeroCasoValidado = true
        } else {
          this.numeroCasoValidado = false
        }
      })

    this.formularioDerivacion.valueChanges.subscribe({
      next: () => {
        this.validarFormulario()
      }
    })

    this.suscripciones.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            setTimeout(() => {
              const request: AlertaGeneralRequestDTO = {
                idCaso: this.idCaso,
                numeroCaso: this.numeroCaso,
                idActoTramiteCaso: this.idActoTramiteCaso,
                codigoAlertaTramite: (this.esDerivacionParaAcumulacion ? CodigoAlertaTramiteEnum.AL_DE2 : CodigoAlertaTramiteEnum.AL_DE1),
                idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
                destino: CodigoDestinoAlertaTramiteEnum.PROV_ENTIDAD_DESPACHO_DERIVACION,
                data: []
              };
              this.registrarAlertas(request);
            }, 0); //

            this.bloquearFormulario = true
            this.formularioDerivacion.disable()
          }
        }
      )
    )
  }

  /**public redireccionarBandejaAcumuladoPorRevisar(): void {
    const ruta = "app/administracion-casos/derivaciones/recibidos/acumulado-de/acumulado-por-revisar";
    this.router.navigate([`${ruta}`])**/
      /**.then((success) => {
        if (success) {
          setTimeout(() => window.location.reload(), 100);
        } else {
          console.error('Falló la navegación');
        }
      }); */
  /** }**/

  /**private resolverAlertas(): void {
    if (this.iniTramiteCreado && (this.idEtapa==ID_ETAPA.CALIFICACION || this.idEtapa==ID_ETAPA.PRELIMINAR)) {
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
      .subscribe();
  }**/

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }

  private obtenerDistritoActual(): Observable<any> {
    return this.maestroService.getDistritoFiscalPorCodigo(this.codDistritoFiscal)
      .pipe(tap((resp) => this.idDistritoFiscal = resp.data.id))
  }

  private async obtenerAlertas(): Promise<void> {
    this.spinner.show()

    const validaciones = [
      this.reusablesAlertas.obtenerAlertaCasoConSolicitudAcumulacionPorRevisar(
        this.idCaso
      ),
    ]

    const resultados = await Promise.allSettled(
      validaciones.map((validacion) => firstValueFrom(validacion))
    )

    this.alertas = [...this.alertas, ...obtenerAlertasDeArchivo(resultados)]

    this.spinner.hide()
  }

  private obtenerTipoEspecialidades(): Observable<any> {
    return this.maestroService.listarTipoEspecialidad(this.codigoEntidad)
      .pipe(tap((resp) => this.tipoEspecialidades = resp))
  }

  protected alSeleccionarTipoEspecialidad(idTipoEspecialidad: number): void {
    this.alSeleccionarTipoEspecialidadObs(idTipoEspecialidad).subscribe()
  }

  protected alSeleccionarTipoEspecialidadObs(idTipoEspecialidad: number): Observable<any> {
    this.formularioDerivacion.patchValue({
      especialidad: null,
      distrito: null,
      esDerivacionDespachoEspecifico: false,
      fiscalia: null,
      despacho: null,
      esDerivacionParaAcumulacion: false,
      numeroCasoAlQueSeVaAcumular: '',
    })
    if (idTipoEspecialidad === null) {
      this.especialidades = []
      this.distritos = []
      this.fiscalias = []
      this.despachos = []
      return of()
    }
    this.formularioDerivacion.get('esDerivacionDespachoEspecifico')!.disable()
    return this.obtenerEspecialidades(idTipoEspecialidad)
  }

  private obtenerEspecialidades(idTipoEspecialidad: number): Observable<any> {
    this.especialidadNoEfe = false
    return this.maestroService.listarEspecialidad(this.codigoEntidad, idTipoEspecialidad).pipe(
      tap((resp) => {
        this.especialidades = resp
        this.habilitarGuardar(this.formularioValido)
        if (this.especialidades.length === 0) {
          this.especialidadNoEfe = true
        }
      })
    )
  }

  protected alSeleccionarEspecialidad(idEspecialidad: string): void {
    this.alSeleccionarEspecialidadObs(idEspecialidad).subscribe()
  }

  protected alSeleccionarEspecialidadObs(idEspecialidad: string): Observable<any> {
    const especialidad = this.especialidades.find(
      (e) => e.id === idEspecialidad
    )
    this.especialidadNoEfe = especialidad?.noEfe === '1'
    this.formularioDerivacion.patchValue({
      distrito: null,
      esDerivacionDespachoEspecifico: false,
      fiscalia: null,
      despacho: null,
      esDerivacionParaAcumulacion: false,
      numeroCasoAlQueSeVaAcumular: '',
    })
    this.fiscaliaNoEFE = false
    if (idEspecialidad === null) {
      this.distritos = []
      this.fiscalias = []
      this.despachos = []
      return of()
    }
    if (this.mostrarDistritoGeografico) {
      this.formularioDerivacion.get('esDerivacionDespachoEspecifico')!.disable()
      return this.obtenerDistritos(idEspecialidad).pipe(tap(() => this.habilitarGuardar(this.formularioValido)))
    } else {
      this.formularioDerivacion.get('esDerivacionDespachoEspecifico')!.enable()
      this.habilitarGuardar(this.formularioValido)
      return of(true)
    }
  }

  private obtenerDistritos(idEspecialidad: string): Observable<any> {
    const idTipoEspecialidad = this.formularioDerivacion.get('tipoEspecialidad')?.value
    return this.maestroService.listarDistrito(this.idDistritoFiscal, idTipoEspecialidad, idEspecialidad, 0)
      .pipe(tap((resp) => this.distritos = resp))
  }

  protected alSeleccionarDistritos(): void {
    this.formularioDerivacion.get('esDerivacionDespachoEspecifico')!.enable()
  }

  protected alSeleccionarDerivacionDespachoEspecifico(valor: CheckboxChangeEvent): void {
    this.alSeleccionarDerivacionDespachoEspecificoObs(valor).subscribe()
  }

  protected alSeleccionarDerivacionDespachoEspecificoObs(valor: CheckboxChangeEvent): Observable<any> {
    if (valor.checked) {
      this.formularioDerivacion.get('esDerivacionParaAcumulacion')!.enable()
      this.formularioDerivacion.get('esDerivacionParaAcumulacion')!.setValue(false)
      return this.obtenerFiscalias().pipe(tap(() => this.habilitarGuardar(this.formularioValido)))
    } else {
      this.formularioDerivacion.get('esDerivacionParaAcumulacion')!.disable()
      this.formularioDerivacion.patchValue({
        esDerivacionParaAcumulacion: false,
        numeroCasoAlQueSeVaAcumular: '',
        fiscalia: null,
        despacho: null,
      })
      this.fiscalias = []
      this.despachos = []
      this.fiscaliaNoEFE = false
      this.habilitarGuardar(this.formularioValido)
      return of(true)
    }
  }

  private obtenerFiscalias(): Observable<any> {
    const idTipoEspecialidad = this.formularioDerivacion.get('tipoEspecialidad')?.value
    const idEspecialidad = this.formularioDerivacion.get('especialidad')?.value
    const idUbigeo = this.formularioDerivacion.get('distrito')?.value ?? 0
    return this.maestroService.listarFiscalia(this.idDistritoFiscal, idTipoEspecialidad, idEspecialidad, idUbigeo, this.idJerarquia)
      .pipe(tap((resp) => this.fiscalias = resp))
  }

  protected alSeleccionarFiscalia(codigoEntidad: string): void {
    this.alSeleccionarFiscaliaObs(codigoEntidad).subscribe()
  }

  protected alSeleccionarFiscaliaObs(codigoEntidad: string): Observable<any> {
    const entidadSeleccionada = this.fiscalias.find(
      (entidad) => entidad.id === codigoEntidad
    )
    this.fiscaliaNoEFE = entidadSeleccionada?.noEfe === '1'
    this.formularioDerivacion.patchValue({
      despacho: null,
      esDerivacionParaAcumulacion: false,
      numeroCasoAlQueSeVaAcumular: '',
    })
    if (codigoEntidad === null) {
      this.despachos = []
      return of(true)
    }
    return this.obtenerDespacho(codigoEntidad)
  }

  private obtenerDespacho(codigoEntidad: string): Observable<any> {
    return this.maestroService.listarDespacho(codigoEntidad).pipe(
      tap((resp) => {
        this.despachos = resp
        this.habilitarGuardar(this.formularioValido)
      })
    )
  }

  protected alSeleccionarDespacho(): void {
    /**this.formularioDerivacion.patchValue({
      esDerivacionParaAcumulacion: false,
      numeroCasoAlQueSeVaAcumular: '',
    })**/
    this.habilitarGuardar(this.formularioValido)
  }

  protected alSeleccionarDerivacionParaAcumulacion(valor: CheckboxChangeEvent): void {
    this.numeroCasoValidado = false;
    if (valor) {
      this.formularioDerivacion.get('numeroCasoAlQueSeVaAcumular')!.setValue(this.obtenerNumeroCasoPorAcumular())
      this.gestionarDerivacionService.notificarMensajeAdvertencia(true)
      this.habilitarGuardar(this.formularioValido)
      return
    }
    this.gestionarDerivacionService.notificarMensajeAdvertencia(false)
    this.formularioDerivacion.patchValue({ numeroCasoAlQueSeVaAcumular: '' })
    this.habilitarGuardar(this.formularioValido)
  }

  private obtenerNumeroCasoPorAcumular(): string {
    const anho = new Date().getFullYear().toString().slice(0, 2)
    return `${this.codigoEntidad}-${anho}__-___-0`
  }

  private obtenerDatosDerivacion(): void {
    const derivacion$ = this.gestionarDerivacionService
    .obtenerDatosDerivacion(this.etapa, this.idActoTramiteCaso)
    .pipe(
      filter((datos): datos is DerivacionInformacion => datos != null),
      tap(datos => this.setValoresBasicosFormulario(datos)),
      switchMap(datos => this.ejecutarCadenaDerivacion(datos)),
      tap(() => this.obtenerDetalleActoTramiteCaso()),
      tap(() => {
        if (this.estaIncompleto === '0') {
          this.habilitarFirma()
        }
      })
    )
    this.suscripciones.push(derivacion$.subscribe())
  }

  private setValoresBasicosFormulario(datos: DerivacionInformacion): void {

    this.formularioDerivacion.patchValue({
      tipoEspecialidad: datos.idTipoEspecialidad,
    })

    this.numeroCasoValidado = datos.numeroCasoAlQueSeVaAcumular !== null
    this.estaIncompleto = datos.formularioIncompleto

    const debeHabilitarCampo =
      (datos.idTipoEspecialidad !== null && datos.idEspecialidad && datos.idUbigeo) ||
      !(datos.idTipoEspecialidad === TIPO_ESPECIALIDAD_PENAL && datos.idEspecialidad === ESPECIALIDAD_COMUN)

    if (debeHabilitarCampo) {
      this.formularioDerivacion.get('esDerivacionDespachoEspecifico')!.enable()
    }

    if (datos.esDerivacionParaAcumulacion === '1') {
      this.casoPorAcumularValidado = true
    }

    this.informacionDerivacionInicial = JSON.stringify({
      idTipoEspecialidad: datos.idTipoEspecialidad,
      idEspecialidad: datos.idEspecialidad,
      idUbigeo: datos.idUbigeo,
      esDerivacionDespachoEspecifico: this.validarSiEsDerivacionDespachoEspecifico(datos.codigoFiscaliaDestino, datos.codigoDespachoDestino),
      codigoFiscaliaDestino: datos.codigoFiscaliaDestino,
      codigoDespachoDestino: datos.codigoDespachoDestino,
      esDerivacionParaAcumulacion: datos.esDerivacionParaAcumulacion,
      numeroCasoAlQueSeVaAcumular: datos.numeroCasoAlQueSeVaAcumular,
      formularioIncompleto: datos.formularioIncompleto
    })
  }

  private ejecutarCadenaDerivacion(datos: DerivacionInformacion): Observable<any> {
    const esDirecto = datos.codigoFiscaliaDestino !== null && datos.codigoDespachoDestino !== null
    return this.alSeleccionarTipoEspecialidadObs(datos.idTipoEspecialidad).pipe(
      tap(() => this.formularioDerivacion.patchValue({ especialidad: datos.idEspecialidad })),
      concatMap(() => this.alSeleccionarEspecialidadObs(datos.idEspecialidad)),
      tap(() => {
        this.formularioDerivacion.patchValue({
          distrito: datos.idUbigeo !== 0 ? datos.idUbigeo : null,
          esDerivacionDespachoEspecifico: esDirecto
        })
      }),
      concatMap(() => this.alSeleccionarDerivacionDespachoEspecificoObs({ checked: esDirecto })),
      tap(() => this.formularioDerivacion.patchValue({ fiscalia: datos.codigoFiscaliaDestino })),
      concatMap(() => this.alSeleccionarFiscaliaObs(datos.codigoFiscaliaDestino as string)),
      tap(() => this.formularioDerivacion.patchValue({
        despacho: datos.codigoDespachoDestino,
        esDerivacionParaAcumulacion: datos.esDerivacionParaAcumulacion === '1',
        numeroCasoAlQueSeVaAcumular: datos.numeroCasoAlQueSeVaAcumular,
      }))
    )
  }

  private guardarFormulario(): Observable<any> {
    const datos = this.formularioDerivacion.getRawValue()
    const esDerivacionDespachoEspecifico = this.validarSiEsDerivacionDespachoEspecifico(datos.fiscalia, datos.despacho)
    this.derivacionInformacion = {
      etapa: this.etapa,
      idTipoDerivacion: datos.esDerivacionParaAcumulacion
                        ? TIPO_DERIVACION.ACUMULACION_INTERNA
                        : TIPO_DERIVACION.DERIVACION_INTERNA,
      idTipoEspecialidad: datos.tipoEspecialidad,
      idEspecialidad: datos.especialidad,
      esDerivacionDespachoEspecifico,
      idUbigeo: esDerivacionDespachoEspecifico === '1' ? datos.distrito : null,
      idDistritoFiscalDestino: this.idDistritoFiscal,
      codigoFiscaliaDestino: esDerivacionDespachoEspecifico === '1' ? datos.fiscalia : null,
      codigoDespachoDestino: esDerivacionDespachoEspecifico === '1' ? datos.despacho : null,
      esDerivacionParaAcumulacion: datos.esDerivacionParaAcumulacion ? '1' : '0',
      numeroCasoAlQueSeVaAcumular: datos.esDerivacionParaAcumulacion ? getValidString(datos.numeroCasoAlQueSeVaAcumular) : null,
      formularioIncompleto: this.estaIncompleto,
    }
    return this.gestionarDerivacionService
      .guardarDerivacion(this.idActoTramiteCaso, this.derivacionInformacion)
      .pipe(
        tap(() => {
          this.modalDialogService.success(
            'Datos guardado correctamente',
            'Se guardaron correctamente los datos para el trámite: <b>' +
              this.nombreTramite() +
              '</b>.',
            'Aceptar'
          )
          this.informacionDerivacionInicial = JSON.stringify(this.obtenerFormularioActual())
          this.estaIncompleto = this.formularioValido ? '0' : '1'
          this.estaIncompleto === '0' ? this.habilitarFirma() : this.habilitarGuardar(false)
        }),
        map(() => 'válido'),
        catchError(() => {
          this.modalDialogService.error(
            'Error',
            'No se pudo guardar la información para el trámite: <b>' +
              this.nombreTramite() +
              '</b>.',
            'Aceptar'
          )
          return throwError(() => new Error('Error al guardar'))
        })
      )
  }

  protected alCambiarCasoAlQueSeVaAcumular(): void {
    this.numeroCasoValidado = false
    this.numeroCasoNoExiste = false;
    this.numeroCasoConcluido = false;
    this.numeroCasoNoPerteneceAlDespacho = false
    this.habilitarGuardar(this.formularioValido)
    this.casoPorAcumularValidado = false
  }


  protected validarExistenciaDelCaso(): void {
    if ( !this.casoPorAcumularValidado ) {
      const numeroCaso = this.formularioDerivacion.get('numeroCasoAlQueSeVaAcumular')!.value
      const despacho = this.formularioDerivacion.get('despacho')!.value
      this.numeroCasoNoExiste = false;
      this.numeroCasoConcluido = false;
      this.numeroCasoNoPerteneceAlDespacho = false;
      this.suscripciones.push(
        this.gestionarDerivacionService.validarCasoAcumular(this.etapa, despacho, numeroCaso).subscribe({
          next: () => {
            this.casoPorAcumularValidado = true;
            this.habilitarGuardar(this.formularioValido)
          },
          error: (error: any) => {
            console.log('error = ', error);
            this.casoPorAcumularValidado = false;
            if (error.error.message.includes('NO SE ENCONTRÓ EL CASO') ) {
              this.numeroCasoNoExiste = true
            }
            if (error.error.message.includes('EL CASO ESTA CONCLUIDO') ) {
              this.numeroCasoConcluido = true
            }
            if (error.error.message.includes('EL CASO NO CORRESPONDE AL DESPACHO') ) {
              this.numeroCasoNoPerteneceAlDespacho = true
            }
          },
        })
      )
    }
  }

  /**private validarNumeroCaso(numeroCaso: string): void {
    this.numeroCasoNoExiste = false;
    this.numeroCasoConcluido = false;
    this.numeroCasoNoPerteneceAlDespacho = false;
    const despacho = this.formularioDerivacion.get('despacho')!.value
    this.suscripciones.push(
      this.gestionarDerivacionService
        .validarExistenciaCaso(this.etapa, numeroCaso, despacho)
        .subscribe({
          next: () => (this.numeroCasoValidado = true),
          error: ( error: any ) => {
            console.log('error = ', error);
            this.numeroCasoValidado = false
            if (error?.error?.includes('NO SE ENCONTRÓ EL CASO') ) {
              this.numeroCasoNoExiste = true
            }
            if (error?.error?.includes('Este caso se encuentra concluido, por lo que no se le puede acumular casos') ) {
              this.numeroCasoConcluido = true
            }
            if (error?.error?.includes('EL CASO NO CORRESPONDE AL DESPACHO') ) {
              this.numeroCasoNoPerteneceAlDespacho = true
            }
          },
        })
    )
  }**/

  /**public validarSolicitudAcumulacion(): void {
    this.tieneSolicitudAcumulacion = false;
    this.suscripciones.push(
      this.gestionarDerivacionService
        .validarSolicitudAcumulacion(this.etapa, this.idCaso)
        .subscribe({
          next: (resp) => {
            if (resp.message === 'EXISTE') {
              this.tieneSolicitudAcumulacion = true;
            }
          },
          error: (error) => {
            console.error(error);
          },
        })
    );
  }**/

  registrarAlertas(request: AlertaGeneralRequestDTO): void {
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

  /**private registrarAlertas(): void {
    const datos = this.formularioDerivacion.getRawValue()
    const request: AlertaDerivacion = {
      idCaso: this.idCaso,
      numeroCaso: this.numeroCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      esDerivacionParaAcumular: datos.esDerivacionParaAcumulacion ? '1' : '0',
    }
    this.suscripciones.push(
      this.gestionarDerivacionService.registraAlertas(this.etapa, request).subscribe()
    )
  }**/

  private obtenerDetalleActoTramiteCaso(): void {
    this.casoService.actoTramiteDetalleCaso(this.idActoTramiteCaso)
    .subscribe({
      next: (resp: any) => {
        if (resp.idEstadoTramite === ESTADO_REGISTRO.FIRMADO) {
          this.bloquearFormulario = true
          this.formularioDerivacion.disable();
        }
      }
    })
  }

  private habilitarFirma(): void {
    this.formularioEditado(false)
    this.habilitarGuardar(false)
  }

  private validarFormulario(): void {
    this.establecerBotonesTramiteSiCambio()
    this.estaIncompleto = this.formularioValido ? '0' : '1'
  }

  private establecerBotonesTramiteSiCambio(): void {
    const cambio = this.elFormularioHaCambiado();
    if (cambio) {
      this.formularioEditado(true)
      this.habilitarGuardar(false)
    } else if (this.formularioValido && this.estaIncompleto !== '1') {
      this.habilitarFirma()
    } else {
      this.formularioEditado(true)
      this.habilitarGuardar(false)
    }
  }

  private elFormularioHaCambiado(): boolean {
    return this.informacionDerivacionInicial != JSON.stringify(this.obtenerFormularioActual())
  }

  private obtenerFormularioActual(): DerivacionInformacion {
    const datos = this.formularioDerivacion.getRawValue()
    return {
      idTipoEspecialidad: datos.tipoEspecialidad,
      idEspecialidad: datos.especialidad,
      idUbigeo: datos.distrito,
      esDerivacionDespachoEspecifico: this.validarSiEsDerivacionDespachoEspecifico(datos.fiscalia, datos.despacho),
      codigoFiscaliaDestino: datos.fiscalia,
      codigoDespachoDestino: datos.despacho,
      esDerivacionParaAcumulacion: datos.esDerivacionParaAcumulacion ? '1' : '0',
      numeroCasoAlQueSeVaAcumular: getValidString(datos.numeroCasoAlQueSeVaAcumular),
      formularioIncompleto: this.estaIncompleto
    }
  }

  private validarSiEsDerivacionDespachoEspecifico(codigoFiscalia: string | null, codigoDespacho: string){
    return codigoFiscalia !== null && codigoDespacho !== null ? '1' : '0'
  }


}
