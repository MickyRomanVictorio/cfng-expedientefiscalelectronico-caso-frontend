import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { MaestroService } from '@services/shared/maestro.service';
import { NgxSpinnerService } from 'ngx-spinner';
// import {StorageService} from "@services/shared/storage.service";
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
  CodigoAlertaTramiteEnum,
  CodigoDestinoAlertaTramiteEnum,
  TipoOrigenAlertaTramiteEnum,
} from '@core/constants/constants';
import { TipoElevacionCodigo } from '@core/constants/superior';
import { AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import { AlertaFormulario } from '@core/interfaces/comunes/alerta-formulario.interface';
import { GenericResponseModel } from '@core/interfaces/comunes/GenericResponse';
import { DatosPronunciamiento } from '@core/interfaces/provincial/tramites/elevacion-actuados/DisposicionResuelveElevacionActuados';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { RespuestaSuperiorDetalleService } from '@core/services/provincial/respuesta-superior/respuesta-superior-detalle.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { RespuestaCasoSupService } from '@core/services/reusables/reusable-respuesta-caso-sup.service';
import { AlertaService } from '@core/services/shared/alerta.service';
import { VisorEfeService } from '@core/services/visor/visor.service';
import { DateMaskModule } from '@directives/date-mask.module';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import { GestionarDerivacionService } from '@services/provincial/tramites/comun/calificacion/gestionar-derivacion/gestionar-derivacion.service';
import { ReusablesAlertas } from '@services/reusables/reusable-alertas.service';
import { ElevacionActuadosSuperiorService } from '@services/reusables/superior/emitir-pronunciamiento/elevacion-actuados-superior-service';
import { TokenService } from '@services/shared/token.service';
import { obtenerIcono } from '@utils/icon';
import { obtenerAlertasDeArchivo } from '@utils/validacion-tramites';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
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
import { ObservarComponent } from './observar/observar.component';
import { urlConsultaCasoFiscal } from '@core/utils/utils';

@Component({
  selector: 'app-disposicion-emitir-pronunciamiento-elevacion-actuados',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    FormsModule,
    CalendarModule,
    // DateFormatPipe,
    DateMaskModule,
    CheckboxModule,
    AlertasTramiteComponent,
    CmpLibModule,
    NgxCfngCoreModalDialogModule,
    ObservarComponent,
  ],
  templateUrl:
    './disposicion-emitir-pronunciamiento-elevacion-actuados.component.html',
  styleUrls: [
    './disposicion-emitir-pronunciamiento-elevacion-actuados.component.scss',
  ],
})
export class DisposicionEmitirPronunciamientoElevacionActuadosComponent
  implements OnInit, OnDestroy
{
  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';
  @Input() idActoTramiteCaso: string = '';
  @Input() idEtapa: string = '';
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();
  @Output() ocultarBotonTramite = new EventEmitter<boolean>();
  //Para movel el scrollbar al final
  @ViewChild('scrollInferior', { static: false }) scrollInferior!: ElementRef;

  public suscripciones: Subscription[] = [];
  public casoFiscal: CasoFiscal | null = null;

  public formularioPronunciamiento: FormGroup;

  public alertas: AlertaFormulario[] = [];
  public obtenerIcono = obtenerIcono;

  public distritosFiscales: any[] = [];
  public tipoEspecialidades: any[] = [];
  public especialidades: any[] = [];
  public distritos: any[] = [];
  public fiscalias: any[] = [];
  public despachos: any[] = [];
  public especialidadesNoEncontradas: boolean = false;
  public tipoResultado: any[] = [];
  public consecuencias: any[] = [];
  public seOrdena: any[] = [];
  protected mostrarConsecuencias: boolean = false;
  protected mostrarSeOrdena: boolean = false;
  protected pdfUrlTramite: SafeResourceUrl | null = null;
  protected datosPronunciamiento: DatosPronunciamiento | null = null;
  protected ocultarBotones: boolean = false;
  protected idJerarquia: number = 0;
  protected idNode: string = '';
  protected observacionProvincial: string = '';
  private readonly desuscribir$ = new Subject<void>();
  protected verFormularioObservar = signal<boolean>(false);

  constructor(
    private readonly alertaService: AlertaService,
    protected reusablesAlertas: ReusablesAlertas,
    protected gestionarDerivacionService: GestionarDerivacionService,
    protected maestroService: MaestroService,
    protected tokenService: TokenService,
    protected formulario: FormBuilder,
    protected spinner: NgxSpinnerService,
    protected elevacionActuadosSuperiorService: ElevacionActuadosSuperiorService,
    protected tramiteService: TramiteService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly visorEfeService: VisorEfeService,
    private readonly sanitizer: DomSanitizer,
    private readonly dialogService: DialogService,
    private readonly respuestaCasoService: RespuestaCasoSupService,
    private readonly router: Router,
    private readonly firmaIndividualService: FirmaIndividualService,
    private readonly respuestaSuperiorDetalleService: RespuestaSuperiorDetalleService
  ) {
    this.formularioPronunciamiento = this.formulario.group({
      tipoResultado: [null, Validators.required],
      consecuencias: [null, null],
      seOrdena: [null],
      excluirFiscal: [false],
    });
    //const usuarioSesion = this.tokenService.getDecoded();
    // this.formularioPronunciamiento.get('esDerivacionDespachoEspecifico').disable()
  }

  ngOnInit(): void {
    this.firmaIndividualService.esFirmadoCompartidoObservable
      .pipe(takeUntil(this.desuscribir$))
      .subscribe((respuesta: any) => {
        if (respuesta.esFirmado) {
          const request: AlertaGeneralRequestDTO = {
            idCaso: this.idCaso,
            numeroCaso: this.numeroCaso,
            idActoTramiteCaso: this.idActoTramiteCaso,
            codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_SUP_PRON_ELE1,
            idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
            destino: CodigoDestinoAlertaTramiteEnum.SUP_DESPACHO_PROVINCIAL,
          };
          this.registrarAlertas(request);
        }
      });
    //   this.esNuevo && this.guardarFormulario();
    //   !this.esNuevo && this.obtenerDatosDerivacion();
    this.obtenerAlertas();
    this.loadTiposResultado();
    this.loadConsecuencias();
    this.loadActosProcesalesSeOrdena();
    this.obtenerFormulario();
    this.formBuild();
    this.peticionParaEjecutar.emit((_) => {
      return this.guardarFormulario();
    });
    //  this.formularioValido;
    this.formularioPronunciamiento.valueChanges.subscribe((val) => {
      this.habilitarGuardar(this.formularioValidoGuardar());
    });
  }
  modificarvalidaciones(campoSeleccionador: string, habilitar: boolean): void {
    let campos = ['consecuencias', 'seOrdena'];
    let campos2 = ['seOrdena'];
    let campos3 = ['consecuencias'];
    if (campoSeleccionador === 'resultado' && habilitar) {
      campos = campos3;
    }
    if (campoSeleccionador === 'consecuencias') {
      campos = campos2;
    }
    campos.forEach((campo) => {
      const control = this.formularioPronunciamiento.get(campo);
      if (control) {
        habilitar
          ? control.setValidators([Validators.required])
          : control.clearValidators();
        control.updateValueAndValidity();
      }
    });
  }
  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
    this.ocultarBotonTramite.emit(false);
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }
  private formBuild(): void {
    this.tramiteService.tramiteEnModoVisor
      ? this.formularioPronunciamiento.disable()
      : null;
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
          this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
      },
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

  private recibirTramite(): void {
    this.respuestaCasoService
      .aceptarCaso({
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTipoElevacion: +TipoElevacionCodigo.ElevacionActuados,
        observacion: '',
        numeroCaso: this.numeroCaso,
      })
      .subscribe({
        next: (_) => {
          this.modalDialogService
            .success(
              'Disposición recibida',
              'Se recibió correctamente la disposición',
              'Aceptar'
            )
            .subscribe({
              next: (_) => {
                this.ocultarBotones = true;
                this.respuestaSuperiorDetalleService.notificarAccionFinalizada(
                  ''
                );

                const ruta = urlConsultaCasoFiscal({
                  idEtapa: this.idEtapa,
                  idCaso: this.idCaso,
                });

                this.router
                  .navigate([`${ruta}/acto-procesal`])
                  .then((success) => {
                    if (success) {
                      setTimeout(() => window.location.reload(), 100);
                    } else {
                      console.error('Falló la navegación');
                    }
                  });
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

  protected eventoObservarTramite(esModal: boolean = false): void {
    if (esModal === true) {
      const _ = this.dialogService.open(ObservarComponent, {
        width: '600px',
        showHeader: false,
        data: {
          datosPronunciamiento: this.datosPronunciamiento,
          esSoloLectura: this.idJerarquia === 2,
        },
      } as DynamicDialogConfig<any>);
      return;
    }
    //
    this.verFormularioObservar.set(true);
    this.ocultarBotones = true;
    //
    setTimeout(() => {
      this.scrollInferior?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  //#endregion

  public loadTiposResultado() {
    const nombreGrupo = 'ID_N_TIPO_RESULTADO';
    this.maestroService
      .obtenerCatalogo(nombreGrupo)
      .subscribe((result: any) => {
        this.tipoResultado = result.data.filter(
          (el: any) => el.id == 763 || el.id === 765
        ); //Solo mostrar Fundado e Infundo
      });
  }

  public loadConsecuencias() {
    const nombreGrupo = 'ID_N_CONSECUENCIA';
    this.maestroService
      .obtenerCatalogo(nombreGrupo)
      .subscribe((result: any) => {
        this.consecuencias = result.data;
      });
  }

  public loadActosProcesalesSeOrdena(): void {
    const nombreGrupo = 'ID_N_ORDENA';
    this.maestroService
      .obtenerCatalogo(nombreGrupo)
      .subscribe((result: any) => {
        this.seOrdena = result.data;
      });
  }

  get esDerivacionParaAcumulacion(): boolean {
    return this.formularioPronunciamiento.get('esDerivacionParaAcumulacion')
      ?.value;
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
      this.ocultarBotonTramite.emit(true);
    }

    this.spinner.hide();
  }
  formularioValidoGuardar(): boolean {
    return this.formularioPronunciamiento.valid;
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
                tipoResultado:
                  this.datosPronunciamiento.tipoResultado > 0
                    ? this.datosPronunciamiento.tipoResultado
                    : null,
                consecuencias: this.datosPronunciamiento.consecuencias,
                seOrdena: isNaN(Number(this.datosPronunciamiento.seOrdena))
                  ? null
                  : Number(this.datosPronunciamiento.seOrdena),
                excluirFiscal: this.datosPronunciamiento.excluirFiscal == '1',
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
                this.mostrarConsecuencias = true;
                //añadido por giovanni
                const tipoConsecuencia =
                  this.formularioPronunciamiento.get('consecuencias')?.value;
                if (tipoConsecuencia === 767) {
                  this.mostrarSeOrdena = false;
                } else {
                  this.mostrarSeOrdena = true;
                }
              } else {
                this.mostrarConsecuencias = false;
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
  public alSeleccionarTipoResultado(): void {
    const tipoResultado =
      this.formularioPronunciamiento.get('tipoResultado')?.value;
    if (tipoResultado === 763 || tipoResultado === 764) {
      this.mostrarConsecuencias = true;
      this.formularioPronunciamiento.patchValue({
        consecuencias: null,
        seOrdena: null,
      });
      this.modificarvalidaciones('resultado', true);
    } else {
      this.mostrarConsecuencias = false;
      this.mostrarSeOrdena = false;
      this.modificarvalidaciones('resultado', false);
    }
  }

  public alSeleccionarConsecuencia(): void {
    const tipoConsecuencia =
      this.formularioPronunciamiento.get('consecuencias')?.value;
    if (tipoConsecuencia === 767) {
      this.mostrarSeOrdena = false;
     this.modificarvalidaciones('consecuencias', false);
    } else {
       this.modificarvalidaciones('consecuencias', true);
      this.mostrarSeOrdena = true;
      this.formularioPronunciamiento.patchValue({
        seOrdena: null,
      });
    }
  }

  guardarFormulario(): Observable<any> {
    if (this.alertas.length > 0) {
      this.modalDialogService.error(
        'Alertas',
        'No se puede guardar porque el trámite tiene alertas',
        'Ok'
      );
      return throwError(() => new Error('Tiene alertas'));
    }

    const datos = this.formularioPronunciamiento.getRawValue();
    let request: DatosPronunciamiento = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      tipoResultado: datos.tipoResultado,
      consecuencias: datos.consecuencias,
      seOrdena: datos.seOrdena,
      excluirFiscal: datos.excluirFiscal == true ? '1' : '0',
    };
    const rs = this.elevacionActuadosSuperiorService
      .emitirPronunciamientoElevacionActuados(request)
      .pipe(
        switchMap((_) => {
          this.tramiteService.formularioEditado = false;
          const rs = this.modalDialogService.warning(
            'Confirmar devolución de caso a fiscalía provincial',
            `<b>¿Está seguro que desea realizar la devolución del caso ${this.numeroCaso} de elevación de actuados a la ${this.datosPronunciamiento?.nombreFiscalia}?</b>.
              Por favor no olvide que al devolver el caso éste pasará a modo lectura y no podrá acceder a él, después no podrá revertir el cambio.`,
            'Si, confirmar', true, 'Cancelar'
          );
          rs.subscribe((resp) => {
            if (resp === 'cancelado') {
              this.tramiteService.formularioEditado = true;
            } else {
              this.tramiteService.formularioEditado = false;
            }
          });
          return of('válido');
        }),
        catchError((error) => {
          this.modalDialogService.error(
            'Error',
            'No se puede guardar los datos',
            'Aceptar'
          );
          return throwError(
            () =>
              new Error(
                'Ocurrió un error al intentar guardar los datos. Por favor intente de nuevo'
              )
          );
        })
      );
    return rs;
  }

  protected habilitarGuardar(estado: boolean): void {
    this.tramiteService.habilitarGuardar = estado;
  }
  protected habilitarFirmar(estado: boolean): void {
    this.tramiteService.habilitarFirmar = estado;
  }
  registrarAlertas(request: AlertaGeneralRequestDTO): void {
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

  //#region Formulario Observar
  protected eventoObservarCancelar(): void {
    this.verFormularioObservar.set(false);
    this.ocultarBotones = false;
  }
  protected eventoObservarEnviar(datos: any): void {
    this.observarTramite(datos.observacion);
  }

  private observarTramite(observacion: string): void {
    this.respuestaCasoService
      .observarCaso({
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTipoElevacion: +TipoElevacionCodigo.ElevacionActuados,
        observacion: observacion,
        numeroCaso: this.numeroCaso,
      })
      .subscribe({
        next: (_) => {
          this.modalDialogService
            .success(
              'Disposición observada',
              'Se ha observado la disposición que resuelve la elevación de actuados.',
              'Aceptar'
            )
            .subscribe({
              next: (_) => {
                this.ocultarBotones = true;
                const request: AlertaGeneralRequestDTO = {
                  idCaso: this.idCaso,
                  numeroCaso: this.numeroCaso,
                  idActoTramiteCaso: this.idActoTramiteCaso,
                  codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_CC3,
                  idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
                  destino: CodigoDestinoAlertaTramiteEnum.SUP_USUARIO_SUPERIOR,
                };
                this.registrarAlertas(request);
                //
                this.ocultarBotones = true;
                this.verFormularioObservar.set(false);
                this.respuestaSuperiorDetalleService.notificarAccionFinalizada(
                  'exito'
                );
                //
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
}
