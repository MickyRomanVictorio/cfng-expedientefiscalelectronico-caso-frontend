import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AlertasTramiteComponent } from '@components/generales/alertas-tramite/alertas-tramite.component';
import {
  CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum,
  TipoOrigenAlertaTramiteEnum,
} from '@core/constants/constants';
import { TipoElevacionCodigo } from '@core/constants/superior';
import { Alerta, AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import { AlertaFormulario } from '@core/interfaces/comunes/alerta-formulario.interface';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { GenericResponseModel } from '@core/interfaces/comunes/GenericResponse';
import {
  DatosPronunciamiento
} from '@core/interfaces/provincial/tramites/elevacion-actuados/DisposicionResuelveElevacionActuados';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { RespuestaSuperiorDetalleService } from '@core/services/provincial/respuesta-superior/respuesta-superior-detalle.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { RespuestaCasoSupService } from '@core/services/reusables/reusable-respuesta-caso-sup.service';
import { AlertaService } from '@core/services/shared/alerta.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { TokenService } from '@core/services/shared/token.service';
import { VisorEfeService } from '@core/services/visor/visor.service';
import { Expediente } from '@core/utils/expediente';
import { DateMaskModule } from '@directives/date-mask.module';
import { Catalogo } from '@interfaces/comunes/catalogo';
import { ResuelveContienda } from '@interfaces/provincial/tramites/comun/calificacion/contienda-competencia/resuelve-contienda.interface';
import { ObservarComponent } from '@modules/provincial/tramites/comun/preliminar/disposicion-emitir-pronunciamiento-elevacion-actuados/observar/observar.component';
import {
  CfeDialogRespuesta, NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService
} from '@ngx-cfng-core-modal/dialog';
import { ReusablesAlertas } from '@services/reusables/reusable-alertas.service';
import { ElevacionActuadosSuperiorService } from '@services/reusables/superior/emitir-pronunciamiento/elevacion-actuados-superior-service';
import { MaestroService } from '@services/shared/maestro.service';
import { obtenerIcono } from '@utils/icon';
import { obtenerAlertasDeArchivo } from '@utils/validacion-tramites';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import {
  catchError,
  firstValueFrom,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  throwError,
} from 'rxjs';

@Component({
  selector: 'app-disposicion-emitir-pronunciamiento-contienda-competencia',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    FormsModule,
    CalendarModule,
    DateMaskModule,
    CheckboxModule,
    AlertasTramiteComponent,
    CmpLibModule,
    TableModule,
    NgxCfngCoreModalDialogModule,
    ObservarComponent
  ],
  providers: [DatePipe, DialogService],
  templateUrl:
    './disposicion-emitir-pronunciamiento-contienda_competencia.component.html',
  styleUrls: [
    './disposicion-emitir-pronunciamiento-contienda_competencia.component.scss',
  ],
})
export class DisposicionEmitirPronunciamientoContiendacompetenciaComponent  implements OnInit{

  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';
  @Input() idActoTramiteCaso: string = '';
  @Output() peticionParaEjecutar = new EventEmitter< (datos: Object) => Observable<any>>();
  @Input() idEtapa: string = '';

  //Para movel el scrollbar al final
  @ViewChild('scrollInferior', { static: false }) scrollInferior!: ElementRef;

  public suscripciones: Subscription[] = [];
  public casoFiscal: CasoFiscal | null = null;
  public formularioPronunciamiento!: FormGroup;
  public pdfUrl: any;
  protected referenciaModal!: DynamicDialogRef;
  public alertas: AlertaFormulario[] = [];
  public obtenerIcono = obtenerIcono;
  public distritos: any[] = [];
  public fiscalias: any[] = [];
  public despachos: any[] = [];
  public consecuencias: any[] = [];
  public seOrdena: any[] = [];
  protected tipoResultado: Catalogo[] = [];
  protected motivos: Catalogo[] = [];
  public idDocumento: string[] = [];
  protected datos!: ResuelveContienda;
  protected deshabilitado: boolean = false;
  private caso!: Expediente;

  protected pdfUrlTramite: SafeResourceUrl | null = null;
  protected ocultarBotones: boolean = false;
  protected idJerarquia: number = 0;
  protected idNode: string = '';
  protected observacionProvincial: string = '';
  private readonly desuscribir$ = new Subject<void>();
  protected datosPronunciamiento: DatosPronunciamiento | null = null;
  public mostrarCamposFormulario: boolean = false;
  protected verFormularioObservar = signal<boolean>(false);

  constructor(
    private readonly reusablesAlertas: ReusablesAlertas,
    private readonly maestroService: MaestroService,
    private readonly formulario: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly elevacionActuadosSuperiorService: ElevacionActuadosSuperiorService,
    protected readonly _sanitizer: DomSanitizer,
    protected readonly tramiteService: TramiteService,
    protected readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly visorEfeService: VisorEfeService,
    private readonly respuestaCasoService: RespuestaCasoSupService,
    private readonly alertaService: AlertaService,
    private readonly router: Router,
    private readonly tokenService: TokenService,
    private readonly firmaIndividualService: FirmaIndividualService,
    private readonly respuestaSuperiorDetalleService:RespuestaSuperiorDetalleService,
    private readonly dialogService: DialogService,
    private readonly gestionCasoService: GestionCasoService,
  ) {}

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual
    this.firmaIndividualService.esFirmadoCompartidoObservable.pipe(
      takeUntil(this.desuscribir$)
    ).subscribe(
      (respuesta: any) => {
        if (respuesta.esFirmado) {
          this.formularioPronunciamiento.disable();
          const request: AlertaGeneralRequestDTO = {
            idCaso: this.idCaso,
            numeroCaso: this.numeroCaso,
            idActoTramiteCaso: this.idActoTramiteCaso,
            codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_CC1,
            idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
            destino: CodigoDestinoAlertaTramiteEnum.SUP_DESPACHO_PROVINCIAL,
            data: [{ campo: 'fiscalSuperiorOrigen', valor: this.datosPronunciamiento?.nombreFiscalia ?? ''}]
          };
          this.registrarAlertas(request);
        }
      }
    );
    this.crearFomulario();
    this.obtenerDatosFormulario();
    this.formularioEditado(true);
    this.peticionParaEjecutar.emit((_) => this.guardarFormulario());
    this.cargarTiposResultado();
    //this.obtenerAlertas();
  }

  //#region Responder Resuelve Elevacion
  private responderResuelveElevacion(datos: DatosPronunciamiento): void {
    //
    this.formularioPronunciamiento.disable();
    //
    this.visorEfeService.getArchivo(datos.idNode!, 'doc.pdf').subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.pdfUrlTramite =
          this._sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
      },
    });
  }

  protected eventoSeleccionarResultado(e: DropdownChangeEvent): void {
    this.habilitarGuardar(true);
    this.formularioEditado(true);
  }

  private guardarFormulario() {
    const datos = this.formularioPronunciamiento.getRawValue();
    if (datos.tipoResultado === null || datos.tipoResultado === '' || datos.tipoResultado === '0') {
      this.modalDialogService.error(
        'Resultado',
        'Para continuar debe seleccionar el resultado.',
        'Aceptar'
      );
      return throwError(
        () => new Error('Falta completar los datos del formulario')
      );
    }
    //
    datos.excluirFiscal = datos.excluirFiscal ? '1' : '0';
    //
    return this.elevacionActuadosSuperiorService
      .emitirPronunciamientoContiendaCompetencia({
        idActoTramiteCaso: this.idActoTramiteCaso,
        ...datos,
      })
      .pipe(
        switchMap((_) => {
          const rs = this.modalDialogService.warning(
            'Confirmar devolución de caso a fiscalía provincial',
            ` <b>¿Está seguro que desea realizar la devolución del caso ${this.numeroCaso} de contienda de competencia a la ${this.datosPronunciamiento?.nombreFiscalia}?</b>.
              Por favor no olvide que al devolver el caso éste pasará a modo lectura y no podrá acceder a él, después no podrá revertir el cambio.`,
            'Si, confirmar', true, 'Cancelar'
          );
          rs.subscribe((resp) => {
            if(resp==='cancelado'){
              this.tramiteService.formularioEditado = true;
            }else{
              this.tramiteService.formularioEditado = false;
            }
          });
          return of('válido');
        }),
        catchError((error) => {
          this.modalDialogService.error(
            'Pronunciamiento',
            error.error.message && error.status === 422
              ? error.error.message
              : 'Ocurrió un error al intentar guardar los datos.',
            'Aceptar'
          );
          return throwError(
            () =>
              new Error(
                'Ocurrió un error al intentar guardar la disposición. Por favor intente de nuevo'
              )
          );
        })
      );
  }

  private crearFomulario(): void {
    this.formularioPronunciamiento = this.formulario.group({
      tipoResultado: ['', [Validators.required]],
      excluirFiscal: [false]
    });
  }

  public cargarTiposResultado() {
    this.maestroService.obtenerCatalogo('ID_N_TIPO_RESULTADO').subscribe({
      next: (resp) => {
        /**this.tipoResultado = resp.data.filter( (el:any)=> (el.id == 763 || el.id===765) );**///Solo mostrar Fundado e Infundo
        this.tipoResultado = resp.data.filter( (el:any)=> (el.id == 1105 || el.id===1106) );//Solo mostrar Fundado e Infundo
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  private async obtenerAlertas(): Promise<void> {
    this.spinner.show();

    const validaciones = [
      this.reusablesAlertas.obtenerAlertaCasoConSolicitudAcumulacionPorRevisar(
        this.idCaso
      ),
    ];

    const resultados = await Promise.allSettled(
      validaciones.map((validacion) => firstValueFrom(validacion))
    );

    this.alertas = [...this.alertas, ...obtenerAlertasDeArchivo(resultados)];

    if (this.alertas.length > 0) {
      // this.ocultarBotonTramite.emit(true)
    }

    this.spinner.hide();
  }

  private obtenerDatosFormulario(): void {
    console.log('entro obtenerDatosFormulario')
    setTimeout(() => {
      this.habilitarGuardar(true);
    }, 100);
    this.suscripciones.push(
      this.elevacionActuadosSuperiorService
        .obtenerDatosPronunciamientoContiendacompetencia(this.idActoTramiteCaso)
        .subscribe({
          next: (datos: GenericResponseModel<DatosPronunciamiento>) => {
            console.log('entro datos = ', datos)
            //Pendiente de desarrollar
            if (datos.data === undefined || datos.data === null) {
              return;
            }
            this.datosPronunciamiento = datos.data;
            if (datos.code === 200) {
              this.formularioPronunciamiento.patchValue({
                tipoResultado: this.datosPronunciamiento.tipoResultado,
                excluirFiscal: this.datosPronunciamiento.excluirFiscal==='1'
              });
              if (
                this.datosPronunciamiento.flgResponder === '1' &&
                this.datosPronunciamiento.idJerarquia === 1
              ) {
                this.responderResuelveElevacion(this.datosPronunciamiento);
                this.tramiteService.validacionTramite.verEditor = false;
              }
              if (
                this.datosPronunciamiento.tipoResultado === 763 ||
                this.datosPronunciamiento.tipoResultado === 764
              ) {
                this.mostrarCamposFormulario = true;
              } else {
                this.mostrarCamposFormulario = false;
              }

              this.idJerarquia = this.datosPronunciamiento.idJerarquia!;
              this.idNode = this.datosPronunciamiento.idNode!;
              this.observacionProvincial =
                this.datosPronunciamiento.observacionProvincial!;
            }
          },
          error: (err) => {
            console.error('Error al obtener el formulario: ', err);
          },
        })
    );
  }
  protected obtenerFormulario() {
    this.suscripciones.push(
      this.elevacionActuadosSuperiorService
        .obtenerDatosPronunciamiento(this.idActoTramiteCaso)
        .subscribe({
          next: (datos: GenericResponseModel<DatosPronunciamiento>) => {
            if (datos.data === undefined || datos.data === null) {
              return;
            }
            this.datosPronunciamiento = datos.data;
            if (datos.code === 200) {
              this.formularioPronunciamiento.patchValue({
                tipoResultado: this.datosPronunciamiento.tipoResultado,

              });
              if (
                this.datosPronunciamiento.flgResponder === '1' &&
                this.datosPronunciamiento.idJerarquia === 1
              ) {
                this.responderResuelveElevacion(this.datosPronunciamiento);
              }
              if (
                this.datosPronunciamiento.tipoResultado === 763 ||
                this.datosPronunciamiento.tipoResultado === 764
              ) {
                this.mostrarCamposFormulario = true;
              } else {
                this.mostrarCamposFormulario = false;
              }

              this.idJerarquia = this.datosPronunciamiento.idJerarquia!;
              this.idNode = this.datosPronunciamiento.idNode!;
              this.observacionProvincial =
                this.datosPronunciamiento.observacionProvincial!;
            }
          },
          error: (err) => {
            console.error('Error al obtener el formulario: ', err);
          },
        })
    );
  }

  private habilitarGuardar(estado: boolean): void {
    this.tramiteService.habilitarGuardar = estado;
  }
  private formularioEditado(estado: boolean): void {
    this.tramiteService.formularioEditado = estado;
  }

  protected eventoObservarTramitev1() {
    //
    this.verFormularioObservar.set(true);
    this.ocultarBotones = true;
    //
    setTimeout(() => {
      this.scrollInferior?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  //Se paso a un modal el componente ObservarComponent
  eventoObservarTramite() {
    const modalDetalle = this.dialogService.open(ObservarComponent, {
      showHeader: false,
      styleClass: 'p-dialog--lg',
      data: {
        esModal: false,
        datosPronunciamiento: this.datosPronunciamiento,
        esSoloLectura: false
      }
    });

    modalDetalle.onClose.subscribe({
      next: (rs) => {
        if (rs?.aceptar) {
          this.eventoObservarEnviar(rs.datos);
        } else {
          this.eventoObservarCancelar();
        }
      }
    });
  }

  protected eventoRecibirTramite() {
    this.modalDialogService
      .warning(
        'Confirmar acción',
        'Por favor confirme la acción de recibir el trámite',
        'Aceptar',
        true,
        'Cancelar'
      )
      .subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.recibirTramite();
          }
        },
      });
  }

  private recibirTramite():void{
    this.respuestaCasoService.aceptarCaso({
      idCaso : this.idCaso,
      idActoTramiteCaso : this.idActoTramiteCaso,
      idTipoElevacion : +TipoElevacionCodigo.ContiendaCompetencia,
      observacion : "",
      numeroCaso: this.numeroCaso
    }).subscribe({
      next: (_) => {
        this.modalDialogService.success('Disposición recibida','Se recibió correctamente la disposición','Aceptar').subscribe({
          next: (_) => {
            this.ocultarBotones=true;
            this.respuestaSuperiorDetalleService.notificarAccionFinalizada("aceptarCaso");
          }
        })
      },
      error: (_) => {
        this.modalDialogService.error('Error', 'No se pudo recibir la disposición','Aceptar');
      }
    });
  }

  registrarAlertas(request: AlertaGeneralRequestDTO): void {
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

  resolverAlertas(): void {
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
  }

  //#region Formulario Observar
  protected eventoObservarCancelar(): void {
    this.verFormularioObservar.set(false);
    this.ocultarBotones = false;
  }
  protected eventoObservarEnviar(datos:any): void {
    this.observarTramite(datos.observacion);
  }

  private observarTramite(observacion: string): void {
    this.respuestaCasoService
      .observarCaso({
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTipoElevacion: +TipoElevacionCodigo.ContiendaCompetencia,
        observacion: observacion,
        numeroCaso: this.numeroCaso,
      })
      .subscribe({
        next: (_) => {
          this.modalDialogService
            .success(
              'Disposición observada',
              'Se ha observado la disposición que resuelve la contienda de competencia.',
              'Aceptar'
            )
            .subscribe({
              next: (_) => {
                //
                this.ocultarBotones = true;
                this.verFormularioObservar.set(false);
                this.respuestaSuperiorDetalleService.notificarAccionFinalizada("exito");
                //

                setTimeout(() => {
                  this.resolverAlertas();
                  const request: AlertaGeneralRequestDTO = {
                    idCaso: this.idCaso,
                    numeroCaso: this.numeroCaso,
                    idActoTramiteCaso: this.idActoTramiteCaso,
                    codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_CC3,
                    idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
                    destino: CodigoDestinoAlertaTramiteEnum.SUP_USUARIO_SUPERIOR,
                    data: [{ campo: 'fiscalSuperiorNombresConpletosOrigen', valor: this.datosPronunciamiento?.fiscalPronuncimiento ?? '' }]
                  };
                  this.registrarAlertas(request);
                }, 0); //

              },
            });
        },
        error: (_) => {
          this.modalDialogService.error(
            'Error',
            'No se pudo recibir la disposición',
            'Aceptar'
          );
        },
      });
  }

  //#endregion

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

}
