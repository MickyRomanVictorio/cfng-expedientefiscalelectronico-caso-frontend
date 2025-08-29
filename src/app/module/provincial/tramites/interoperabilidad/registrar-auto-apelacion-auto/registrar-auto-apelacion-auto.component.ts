import {CommonModule, DatePipe} from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {AcuerdoReparatorioInfo, CasoFiscal,} from '@core/interfaces/comunes/casosFiscales';
import {TramiteProcesal} from '@core/interfaces/comunes/tramiteProcesal';
import {
  GuardarTramiteProcesalComponent
} from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import {NgxSpinnerService} from 'ngx-spinner';
import {CalendarModule} from 'primeng/calendar';
import {DialogService, DynamicDialogConfig, DynamicDialogRef,} from 'primeng/dynamicdialog';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {Subscription} from 'rxjs';
import {Button, ButtonModule} from 'primeng/button';
import {
  MensajeCompletarInformacionComponent
} from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import {RadioButtonModule} from 'primeng/radiobutton';
import {DropdownModule} from 'primeng/dropdown';
import {CheckboxModule} from 'primeng/checkbox';
import {InputTextModule} from 'primeng/inputtext';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {
  MensajeInteroperabilidadPjComponent
} from '@components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import {DomSanitizer} from '@angular/platform-browser';
import {GestionCasoService} from '@services/shared/gestion-caso.service';
import {obtenerIcono} from '@utils/icon';
import {CmpLibModule, ctrlErrorMsg} from 'ngx-mpfn-dev-cmp-lib';
import {AutoResuelveRequest} from '@interfaces/comunes/AutoResuelveRequerimientoRequest';
import {
  RegistrarAutoResuelveAutoModalComponent
} from '@modules/provincial/tramites/interoperabilidad/registrar-auto-apelacion-auto/registrar-auto-apelacion-auto-modal/registrar-auto-resuelve-auto-modal.component';
import {
  ResolucionAutoResuelveAutoSuperiorService
} from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-auto-superior.service';
import {ESTADO_REGISTRO, IconAsset,} from 'dist/ngx-cfng-core-lib';
import {
  RegistrarAutoApelacionAutoModalPenasComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-apelacion-auto/registrar-auto-apelacion-auto-modal-penas/registrar-auto-apelacion-auto-modal-penas.component";
import {
  RegistrarAutoApelacionAutoModalRepCivilComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-apelacion-auto/registrar-auto-apelacion-auto-modal-rep-civil/registrar-auto-apelacion-auto-modal-rep-civil.component";
import {
  RegistrarAutoApelacionAutoModalProcesoComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-apelacion-auto/registrar-auto-apelacion-auto-modal-proceso/registrar-auto-apelacion-auto-modal-proceso.component";
import {
  ObservarComponent
} from "@modules/provincial/tramites/comun/preliminar/disposicion-emitir-pronunciamiento-elevacion-actuados/observar/observar.component";
import {TipoElevacionCodigo} from "@constants/superior";
import {Router} from "@angular/router";
import {AlertaGeneralRequestDTO} from "@interfaces/comunes/alerta";
import {
  CodigoAlertaTramiteEnum,
  CodigoDestinoAlertaTramiteEnum,
  TipoOrigenAlertaTramiteEnum
} from "@constants/constants";
import {
  RespuestaSuperiorDetalleService
} from "@services/provincial/respuesta-superior/respuesta-superior-detalle.service";
import {
  DatosPronunciamiento
} from "@interfaces/provincial/tramites/elevacion-actuados/DisposicionResuelveElevacionActuados";
import {TokenService} from "@services/shared/token.service";
import {TramiteService} from "@services/provincial/tramites/tramite.service";

@Component({
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RadioButtonModule,
    DropdownModule,
    CheckboxModule,
    InputTextareaModule,
    InputTextModule,
    ButtonModule,
    CalendarModule,
    CmpLibModule,
    NgxExtendedPdfViewerModule,
    MensajeCompletarInformacionComponent,
    MensajeInteroperabilidadPjComponent,
    NgxCfngCoreModalDialogModule,
    ObservarComponent,
  ],
  selector: 'app-resolucion-auto-apelacion-auto',
  templateUrl: './registrar-auto-apelacion-auto.component.html',
  styleUrls: ['./registrar-auto-apelacion-auto.component.scss'],
  providers: [DatePipe],
})
export class RegistrarAutoApelacionAutoComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idDocumento: string[] = [];
  @Input() datosExtraFormulario: any;
  @Input() idEstadoTramite!: number;
  @Input() tramiteEnModoEdicion!: boolean;
  @Input() deshabilitado: boolean = false;
  @Input() idActoTramiteCaso!: string;

  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();
  @Output() ocultarTitulo = new EventEmitter<(datos: any) => any>();

  @ViewChild('botonGuardar') botonGuardar!: Button;

  public casoFiscal: CasoFiscal | null = null;
  public acuerdoReparatorioInfo: AcuerdoReparatorioInfo | null = null;
  public caracteresRestantes: number = 1000;
  public subscriptions: Subscription[] = [];
  public referenciaModal!: DynamicDialogRef;
  public idCuaderno: any;
  private numeroPestania: number = 0;

  protected selectedSujetosToSend: any = [];
  protected selectedSujetos: any = [];
  protected selectedSujetosSalidaExterna: any = [];
  protected selectedSujetosPena: any = [];
  protected selectedSujetosProceso: any = [];

  protected esTerminacionAnticipada: boolean = true;
  protected esApelacionProceso: boolean = true;

  private cantidad_maxima_carateres: number = 200;
  public urlPdf: any;
  public formGroup!: FormGroup;
  public obtenerIcono = obtenerIcono;
  soloLectura: boolean = false;
  public sujetosProcesales: any[] = [];
  public  mostrarDevolverAlFiscalProvincial: Boolean = false;
  public nombreFiscaliaProvincial: string = '';
  protected readonly iconAsset = inject(IconAsset);
  protected idJerarquia: number = 0;
  protected ocultarBotones: boolean = false;
  protected verFormularioObservar = signal<boolean>(false);
  @ViewChild('scrollInferior', { static: false }) scrollInferior!: ElementRef;
  protected observacionProvincial: string = '';
  protected datosPronunciamiento: DatosPronunciamiento | null = null;
  protected codJerarquia: any;
  private valoresIniciales: any;

  constructor(
    private formulario: FormBuilder,
    private dialogService: DialogService,
    public _sanitizer: DomSanitizer,
    private resolucionAutoService: ResolucionAutoResuelveAutoSuperiorService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly router: Router,
    private readonly respuestaSuperiorDetalleService: RespuestaSuperiorDetalleService,
    private tokenService: TokenService,
    private tramiteService: TramiteService
  ) {
    const usuarioSession = this.tokenService.getDecoded();
    this.codJerarquia = usuarioSession.usuario.codJerarquia;
  }

  ngOnInit(): void {
    this.formGroup = this.formulario.group({
      fechaNotificacion: new FormControl('', Validators.required),
      txtObservacion: new FormControl(''),
    });
    this.obtenerDatosFormulario();
    this.isDisabledForm();

    this.tramiteService.habilitarGuardar = true;
    this.formGroup.valueChanges.subscribe(values =>
      this.tramiteService.formularioEditado = this.valoresIniciales ?
        JSON.stringify(this.valoresIniciales) !== JSON.stringify(values) : false
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  /** VALIDACION DE FORMULARIO **/

  isDisabledForm(): void {
    console.log('isDisabledForm', this.tramiteEnModoEdicion);
    if (
      !this.tramiteEnModoEdicion &&
      (this.estadoRecibido || !this.esTramiteCorrecto || this.soloLectura)
    ) {
      this.formGroup.get('fechaNotificacion')!.disable();
      this.formGroup.get('txtObservacion')!.disable();
      this.soloLectura = true;
    } else {
      this.formGroup.get('fechaNotificacion')!.enable();
      this.formGroup.get('txtObservacion')!.enable();
    }
  }

  get validarForm(): boolean {
    let validSujetos;
    if(this.esTerminacionAnticipada){
      validSujetos = (this.selectedSujetosPena && this.selectedSujetosPena.length > 0) || (this.selectedSujetosSalidaExterna && this.selectedSujetosSalidaExterna.length > 0);
    }else if(this.esApelacionProceso){
      validSujetos = this.selectedSujetosProceso && this.selectedSujetosProceso.length > 0;
    } else{
      validSujetos = this.selectedSujetos && this.selectedSujetos.length > 0;
    }
    return this.formGroup.valid &&  validSujetos;
  }

  public verificationForm(): FormGroup {
    return new FormGroup({
      fechaNotificacion: new FormControl('', [Validators.required]),
      txtObservacion: new FormControl(null, [Validators.maxLength(200)]),
    });
  }

  /** GESTION DE ESTADOS **/

  get estadoRecibido(): boolean {
    return (
      this.idEstadoTramite !== null &&
      this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
    );
  }

  get esTramiteCorrecto(): boolean {
    return this.idActoTramiteCaso !== null;
  }

  errorMsg(ctrlName: any) {
    return ctrlErrorMsg(this.verificationForm().get(ctrlName));
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  get iconButton(): string {
    return this.formularioValido || this.soloLectura ? 'success' : 'error';
  }

  get formularioValido(): boolean {
    let validSujetos;
    if(this.esTerminacionAnticipada){
      validSujetos = (this.selectedSujetosPena && this.selectedSujetosPena.length > 0) || (this.selectedSujetosSalidaExterna && this.selectedSujetosSalidaExterna.length > 0);
    }else if(this.esApelacionProceso){
      validSujetos = this.selectedSujetosProceso && this.selectedSujetosProceso.length > 0;
    } else{
      validSujetos = this.selectedSujetos && this.selectedSujetos.length > 0;
    }
    return validSujetos;
  }

  public actualizarContadorInputTextArea(e: Event): void {
    const value = (e.target as HTMLTextAreaElement).value;
    this.caracteresRestantes = this.cantidad_maxima_carateres - value.length;
  }

  get mostrarFormulario(): Boolean {
    return !!(this.idActoTramiteCaso && this.idDocumento);
  }

  /** LLAMADA A DATOS **/

  public obtenerDatosFormulario(): void {
    this.spinner.show();
    this.subscriptions.push(
      this.resolucionAutoService
        .obtenerTramite(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            console.log('resp',resp);
            this.datosPronunciamiento = resp;
            this.datosPronunciamiento!.fiscalPronuncimiento = resp.nombreFiscalProvincial;
            this.datosPronunciamiento!.nombreFiscalia = resp.nombreFiscaliaProvincial;

            this.nombreFiscaliaProvincial = resp.nombreFiscaliaProvincial;
            this.numeroPestania = resp.nuPestana;
            this.spinner.hide();
            resp.fechaNotificacion
              ? this.formGroup
                  .get('fechaNotificacion')!
                  .setValue(new Date(resp.fechaNotificacion))
              : null;
            resp.observacion
              ? this.formGroup.get('txtObservacion')!.setValue(resp.observacion)
              : null;
            this.esTerminacionAnticipada = resp.esTerminacionAnticipada;
            this.esApelacionProceso = resp.esApelacionProceso;
            this.observacionProvincial = resp.observacionProvincial;
            this.valoresIniciales = this.formGroup.getRawValue();
            this.tramiteService.formularioEditado = false;
          },
          error: (error) => {
            this.spinner.hide();
            console.error(error);
          },
        })
    );
  }
  public devolverAlFiscalProvincial(): void {
    console.log('devolverAlFiscalProvincial', this.selectedSujetos);
    let ref = this.modalDialogService.warning(
      'DEVOLVER PESTAÑA DE APELACIÓN AL FISCAL PROVINCIAL',
      `Esta acción realiza la devolución de la pestaña de apelación a la ${this.nombreFiscaliaProvincial}. ` +
        'Por favor, no olvide que al realizar esta acción, solo la pestaña de apelación pasará a modo lectura y no podrá acceder. ' +
        'Tener en cuenta que el/los sujeto(s) procesal(es) a quien(es) se le(s) está emitiendo el pronunciamiento son los siguientes:' +
        ' <br/>' +
        this.selectedSujetos
          .map((sujeto: any) => sujeto.nombreCompleto)
          .join(', ') +
        ' <br/>' +
        '¿Está seguro de realizar este trámite?”',
      'Aceptar',
      true,
      'Cancelar'
    );
    ref.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.resolucionAutoService.devolverProvincial(this.idActoTramiteCaso).subscribe({
            next: (resp) => {
              if(resp.code === "0"){
                this.mostrarDevolverAlFiscalProvincial = false;
              this.modalDialogService.info('La pestaña de apelación ha sido devuelta correctamente al Fiscal Provincial', '', 'Aceptar');
              }else{
                this.modalDialogService.error('Error al devolver la pestaña', '', 'Aceptar');
              }
            }
          });


        }
      },
    });
  }

  unirRespuestasSujetos() {
    this.selectedSujetosToSend = [];
    this.selectedSujetos.forEach((sujeto: any) => {
      this.selectedSujetosToSend.push({
        idSujetoCaso: sujeto.idSujetoCaso,
        idTipoParteSujeto: sujeto.idTipoParteSujeto,
        idTipoRespuestaResolucionInstancia2: sujeto.idTipoRespuestaResolucionInstancia2
      });
    });
    this.selectedSujetosPena.forEach((sujeto: any) => {
      this.selectedSujetosToSend.push({
        idSujetoCaso: sujeto.idSujetoCaso,
        idTipoParteSujeto: sujeto.idTipoParteSujeto,
        idTipoRespuestaResolucionInstancia2: sujeto.idTipoRespuestaResolucionInstancia2
      });
    });
    this.selectedSujetosSalidaExterna.forEach((sujeto: any) => {
      this.selectedSujetosToSend.push({
        idSujetoCaso: sujeto.idSujetoCaso,
        idTipoParteSujeto: sujeto.idTipoParteSujeto,
        idTipoRespuestaResolucionInstancia2: sujeto.idTipoRespuestaResolucionInstancia2
      });
    });
    this.selectedSujetosProceso.forEach((sujeto: any) => {
      this.selectedSujetosToSend.push({
        idSujetoCaso: sujeto.idSujetoCaso,
        idTipoParteSujeto: sujeto.idTipoParteSujeto,
        idTipoRespuestaResolucionInstancia2: sujeto.idTipoRespuestaResolucionInstancia2
      });
    });
  }

  public guardarFormulario(): void {
    this.spinner.show();

    this.unirRespuestasSujetos();
    let datosForm = this.formGroup.getRawValue();
    let request: AutoResuelveRequest = {
      operacion: 0,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: this.datePipe.transform(
        datosForm.fechaNotificacion,
        'dd/MM/yyyy'
      )!,
      observacion: datosForm.txtObservacion,
      listSujetos: this.selectedSujetosToSend,
    };
    this.subscriptions.push(
      this.resolucionAutoService.registrarTramite(request).subscribe({
        next: (resp) => {
          this.spinner.hide();
          this.mostrarDevolverAlFiscalProvincial = true;
          this.gestionCasoService.obtenerCasoFiscal(
            this.gestionCasoService.casoActual.idCaso
          );
          this.soloLectura = true;
          this.formGroup.get('fechaNotificacion')!.disable();
          this.formGroup.get('txtObservacion')!.disable();

          this.modalDialogService.success(
            'Datos guardado correctamente',
            'Se guardaron correctamente los datos para el trámite: <b>' +
              this.tramiteSeleccionado?.nombreTramite +
              '</b>.',
            'Aceptar'
          );
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      })
    );
  }

  /** LLAMADA A COMPONENTES EXTERNOS **/

  public openModalSelectTramite(): void {
    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      showHeader: false,
      data: {
        tipo: 2,
        idCaso: this.idCaso,
        idEtapa: this.idEtapa,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idActoProcesal: 0,
      },
    } as DynamicDialogConfig);

    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    dialogRef?.changeDetectorRef.detectChanges();

    const instance = dialogRef?.instance?.componentRef
      ?.instance as GuardarTramiteProcesalComponent;
    instance?.onSave.subscribe((data) => {
      this.acuerdoReparatorioInfo = {
        idTramiteCaso: data.idTramiteCaso,
        idTramiteEstado: data.idTramiteCasoEstado,
      };
      ref.close();
    });
  }

  public openModalSujetos(tipoModal: number): void {
    let dataModal = {
      showHeader: false,
      data: {
        numeroCaso: this.numeroCaso,
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        listSujetosProcesales: this.selectedSujetos,
        soloLectura: this.soloLectura,
        numeroPestania: this.numeroPestania
      },
    };
    let ref: any;
    switch (tipoModal) {
      case 1:
        dataModal.data.listSujetosProcesales = this.selectedSujetos;
        ref = this.dialogService.open(RegistrarAutoResuelveAutoModalComponent, dataModal);
        ref.onClose.subscribe((data: any) => {
          this.selectedSujetos = data;
          this.tramiteService.formularioEditado = true;
        });
        break;
      case 2:
        dataModal.data.listSujetosProcesales = this.selectedSujetosPena;
        ref = this.dialogService.open(RegistrarAutoApelacionAutoModalPenasComponent, dataModal);
        ref.onClose.subscribe((data: any) => {
          this.selectedSujetosPena = data;
          this.tramiteService.formularioEditado = true;
        });
        break;
      case 3:
        dataModal.data.listSujetosProcesales = this.selectedSujetosSalidaExterna;
        ref = this.dialogService.open(RegistrarAutoApelacionAutoModalRepCivilComponent, dataModal);
        ref.onClose.subscribe((data: any) => {
          this.selectedSujetosSalidaExterna = data;
          this.tramiteService.formularioEditado = true;
        });
        break;
      case 4:
        dataModal.data.listSujetosProcesales = this.selectedSujetosProceso;
        ref = this.dialogService.open(RegistrarAutoApelacionAutoModalProcesoComponent, dataModal);
        ref.onClose.subscribe((data: any) => {
          this.selectedSujetosProceso = data;
          this.tramiteService.formularioEditado = true;
        });
        break;
    }
  }

  private recibirTramite(): void {
    this.resolucionAutoService
      .aceptarCaso({
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTipoElevacion: +TipoElevacionCodigo.ElevacionActuados,
        observacion: '',
        numeroCaso: this.numeroCaso
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
                this.respuestaSuperiorDetalleService.notificarAccionFinalizada("");
                this.router.navigate([
                  '/app/administracion-casos/',
                  this.idCaso,
                  'elevacion-respuestas',
                ]).then(() => {
                  window.location.reload();//Forzar la actualización para forzar la actualización menú lateral
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
    if(esModal===true){
      const _ = this.dialogService.open(ObservarComponent, {
        width: '600px',
        showHeader: false,
        data: {
          //datosPronunciamiento: this.datosPronunciamiento,
          esSoloLectura: this.idJerarquia === 2,
        },
      } as DynamicDialogConfig<any>);
      return;
    }

    this.verFormularioObservar.set(true);
    this.ocultarBotones = true;

    setTimeout(() => {
      this.scrollInferior?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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

  protected eventoObservarCancelar(): void {
    this.verFormularioObservar.set(false);
    this.ocultarBotones = false;
  }
  protected eventoObservarEnviar(datos: any): void {
    this.observarTramite(datos.observacion);
  }

  private observarTramite(observacion: string): void {
    this.resolucionAutoService
      .observarCaso({
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTipoElevacion: +TipoElevacionCodigo.ElevacionActuados,
        observacion: observacion,
        numeroCaso: this.numeroCaso
      })
      .subscribe({
        next: (_) => {
          this.modalDialogService
            .success(
              'Disposición observada',
              'Se ha observado la disposición.',
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
                //this.registrarAlertas(request);

                this.ocultarBotones = true;
                this.verFormularioObservar.set(false);
                this.respuestaSuperiorDetalleService.notificarAccionFinalizada("exito");
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

}
