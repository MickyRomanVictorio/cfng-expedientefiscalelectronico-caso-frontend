import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { RegistrarResultadoAudienciaModalComponent } from '@core/components/modals/registrar-resultado-audiencia-modal/registrar-resultado-audiencia-modal.component';
import { obtenerIcono } from '@core/utils/icon';
import { IconAsset, icono, ValidationModule } from 'dist/ngx-cfng-core-lib';
import { esStringNull, getDateFromString, limpiarFormcontrol } from '@core/utils/utils';
import { CmpLibModule } from 'dist/cmp-lib';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessagesModule } from 'primeng/messages';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  ESTADO_REGISTRO,
  RESPUESTA_MODAL,
} from 'ngx-cfng-core-lib';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import {
  catchError, concatMap,
  map,
  Observable,
  Subscription,
  tap,
  throwError,
} from 'rxjs';
import { RegistroResolucionIncoacionService } from '@core/services/provincial/tramites/especiales/incoacion/registro-resolucion-incoacion.service';
import { ResolucionIncoacionInmediata } from '@core/interfaces/provincial/tramites/especiales/incoacion/registrar-resolucion';
import { NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { GestionAudiosComponent } from '@components/modals/gestion-audios/gestion-audios.component';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import {
  ID_N_RESULTADO_TERMINACION_ANTICIPADA,
  ID_N_TIPO_RESULTADO,
} from '@core/types/efe/provincial/tramites/especial/resultado-resolucion-incoacion';
import { ID_TIPO_ORIGEN } from '@core/types/tipo-origen.type';
import { capitalizedFirstWord } from '@core/utils/string';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { MensajeFirma } from '@interfaces/reusables/firma-digital/mensaje-firma.interface';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { AlertaData } from '@interfaces/comunes/alert';
import { Router } from '@angular/router';
import { MensajeCompletarCamposComponent } from '@core/components/mensajes/mensaje-completar-campos/mensaje-completar-campos.component';
import { AlertaFormalizar } from '@interfaces/provincial/tramites/comun/preliminar/formalizar-preparatoria.interface';

@Component({
  selector: 'app-registrar-resolucion',
  standalone: true,
  imports: [
    CommonModule,
    ProgressBarModule,
    ReactiveFormsModule,
    MessagesModule,
    CalendarModule,
    FormsModule,
    RadioButtonModule,
    CmpLibModule,
    CheckboxModule,
    DateMaskModule,
    MensajeCompletarInformacionComponent,
    MensajeCompletarCamposComponent,
    MensajeInteroperabilidadPjComponent,
    ValidationModule
  ],
  templateUrl: './registrar-resolucion.component.html',
  styleUrl: './registrar-resolucion.component.scss',
  providers: [DialogService, DatePipe, NgxCfngCoreModalDialogService],
})
export class RegistrarResolucionComponent implements OnInit, OnDestroy {

  @Output() peticionParaEjecutar = new EventEmitter<() => any>();
  @Input() idEstadoTramite!: number;
  @Input() etapa: string = '';
  public idEtapa!: string;
  public idCaso!: string;
  public numeroCaso!: string;
  public validacionTramite!: ValidacionTramite;
  public tramiteSeleccionado!: TramiteProcesal | null;
  public idActoTramiteCaso: string = '';
  protected tramiteEnModoEdicion!: boolean;
  protected deshabilitado: boolean = false;

  protected obtenerIcono = obtenerIcono;
  protected suscripciones: Subscription[] = [];
  protected formRegistro: FormGroup;
  protected previousValues: any;
  protected referenciaModal!: DynamicDialogRef;
  protected terminacionAnticipada: boolean = false;
  protected verFormulario: boolean = false;
  protected inicializandoFormulario = true;
  protected formRevertido = false;
  protected formReiniciado = false;
  protected observarCambios = true;
  protected camposIgnorados: string[] = ['fechaNotificacion', 'observaciones'];

  protected fechaActual: Date = new Date();
  protected fechaIngreso: Date | null = null;
  protected audiosAudienciaCorrectos: boolean = false;
  protected resultadosAudienciaCorrectos: string = '0';

  protected cambioFormulario: boolean = false;
  protected primerGuardado: boolean = false;
  protected visibleMensajeError: boolean = false;
  protected txtMensajeError: string = "";

  constructor(
    protected iconAsset: IconAsset,
    private router: Router,
    protected fb: FormBuilder,
    protected datePipe: DatePipe,
    protected dialogService: DialogService,
    protected tramiteService: TramiteService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly firmaIndividualService: FirmaIndividualService,
    protected readonly modalDialogService: NgxCfngCoreModalDialogService,
    protected registroResolucionIncoacionService: RegistroResolucionIncoacionService,
  ) {
    this.formRegistro = this.fb.group({
      fechaNotificacion: ['', [Validators.required]],
      resultado: ['', [Validators.required]],
      terminacion: [false],
      terminacionRadio: [''],
      observaciones: ['', [Validators.maxLength(200)]],
    });
    this.previousValues = this.formRegistro.getRawValue();
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }

  get estadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  get permitirGuardar(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.PENDIENTE_COMPLETAR;
  }

  get tramiteOriginadoEnEfe(): boolean {
    return this.validacionTramite.tipoOrigenTramiteSeleccionado === ID_TIPO_ORIGEN.EFE;
  }

  ngOnInit(): void {
    const fechaIngresoStr = this.gestionCasoService.expedienteActual.fechaIngresoDenuncia;
    this.fechaIngreso = getDateFromString(fechaIngresoStr);

    this.tramiteService.verIniciarTramite = false;
    this.peticionParaEjecutar.emit(() => this.guardarFormulario());

    if (this.validacionTramite.cantidadTramiteSeleccionado !== 0) {
      this.verFormulario = true;
      this.obtenerInformacion();
    } else {this.formularioEditado(true)}

    this.suscripciones.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.idEstadoTramite = ESTADO_REGISTRO.FIRMADO;
            this.formRegistro.disable();
            this.validarAlertas();
          }
        }
      )
    )

    if(this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO || this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO){
      this.formRegistro.disable()
    }

    this.formRegistro.valueChanges.subscribe((val) => {
      if (!this.inicializandoFormulario) {
        this.cambioFormulario = true;
        this.formularioEditado(true);
      }
      this.habilitarGuardar(this.formRegistro.valid);
    });

    Object.keys(this.formRegistro.controls).forEach(campo => {
      const control = this.formRegistro.get(campo);
      if (!this.camposIgnorados.includes(campo)) {
        control?.valueChanges.subscribe(valor => {
          if (!this.inicializandoFormulario && this.observarCambios && this.formRegistro.enabled) {
            this.confirmarCambioResultado();
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.limpiarSuscripciones();
  }

  protected guardarFormulario(): Observable<any> {
    let form = this.formRegistro.getRawValue();

    if (
      esStringNull(form.fechaNotificacion) ||
      esStringNull(form.resultado) ||
      (form.terminacion && esStringNull(form.terminacionRadio))
    ) {
      this.modalDialogService.error(
        'Formulario incompleto',
        'Por favor, complete la información de la resolución.',
        'OK'
      );
      return throwError(() => new Error('Formulario incompleto'));
    } else {
      const dataRequest: ResolucionIncoacionInmediata = {
        idActoTramiteCaso: this.idActoTramiteCaso,
        fechaNotificacion: this.datePipe.transform(
          form.fechaNotificacion,
          'yyyy-MM-dd'
        ),
        flagTerminacionAnticipada: form.terminacion == true ? '1' : '0',
        idTipoResultado: this.obteneridTipoResultadoGuardar(),
        idTramiteSetencia: this.obtenerTramiteSentenciaGuardar(),
        observaciones: form.observaciones,
      };

      return this.registroResolucionIncoacionService
        .registrarinocoacion(dataRequest)
        .pipe(
          tap(() => {
            this.cambioFormulario = false;
            this.resultadosAudienciaCorrectos !== '2' ?  this.formularioEditado(false) :  this.formularioEditado(true);
            this.modalDialogService.success(
              'Datos guardado correctamente',
              'Se guardaron correctamente los datos para el trámite: <b>' + this.nombreTramite() + '</b>.',
              'Aceptar'
            );
          }),
          map(() => 'válido'),
          catchError(() => {
            this.modalDialogService.error(
              'Error',
              'No se pudo guardar la información para el trámite: <b>' + this.nombreTramite() + '</b>.',
              'Aceptar'
            );
            return throwError(() => new Error('Error al guardar'));
          })
        );
    }
  }

  protected obtenerInformacion() {
    this.suscripciones.push(
      this.registroResolucionIncoacionService
        .obtenerInfoIncoacion(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            if (resp?.codigo === 200) {
              this.inicializandoFormulario = true;
              this.primerGuardado = true;
              let data = resp?.data as ResolucionIncoacionInmediata;
              this.formRegistro.get('resultado')?.setValue(this.obteneridTipoResultado(data.idTipoResultado));
              this.validarTerminacionAnticipada();
              this.formRegistro.get('terminacion')?.setValue(data.flagTerminacionAnticipada == '1');
              this.formRegistro.get('observaciones')?.setValue(data.observaciones ?? '');
              const fechaString = data.fechaNotificacion;
              const fechaISO = fechaString.replace(' ', 'T');
              this.formRegistro.get('fechaNotificacion')?.setValue(new Date(fechaISO));
              this.validarTerminacionAnticipadaRadios();
              this.formRegistro.get('terminacionRadio')?.setValue(this.obtenerTramiteSentencia(data.idTramiteSetencia));
              this.inicializandoFormulario = false;
              this.obtenerValidacionAudiosAudiencia();
              this.obtenerValidacionResultadosAudiencia();
              this.previousValues = this.formRegistro.getRawValue();
            } else {
              this.primerGuardado = false;
              this.formularioEditado(true)
            }
          },
          error: () => {
            this.modalDialogService.error(
              'ERROR',
              'Error al intentar traer la información de la inocuación de procedo inmediato',
              'Aceptar'
            );
          },
        })
    );
  }

  protected activarFormulario(event: boolean) {
    this.tramiteService.verIniciarTramite = event;
  }

  protected validarTerminacionAnticipada() {
    this.observarCambios = false;
    this.formRegistro.get('terminacion')?.setValue(false);
    this.formRegistro.get('terminacionRadio')?.setValue('');
    limpiarFormcontrol(this.formRegistro.get('terminacionRadio'), []);
    this.terminacionAnticipada = this.formRegistro.get('resultado')?.value === '1';
    this.observarCambios = true;
  }

  protected validarTerminacionAnticipadaRadios() {
    this.observarCambios = false;
    this.formRegistro.get('terminacionRadio')?.setValue('');
    if (this.formRegistro.get('terminacion')?.value === true) {
      limpiarFormcontrol(this.formRegistro.get('terminacionRadio'), [
        Validators.required,
      ]);
    } else {
      limpiarFormcontrol(this.formRegistro.get('terminacionRadio'), []);
    }
    this.observarCambios = true;
  }

  protected limpiarSuscripciones(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion?.unsubscribe());
  }

  protected retornarDataModalResultadoAudiencia(): any {
    const resultado = this.formRegistro.get('resultado')?.value;
    const terminacion = this.formRegistro.get('terminacion')?.value;
    const terminacionRadio = this.formRegistro.get('terminacionRadio')?.value;

    let titulo: string = '';
    let tipo: number = 0;

    switch (resultado) {
      case '2':
        titulo =
          'RESULTADOS DE AUDIENCIA INCOACIÓN A PROCESO INMEDIATO<b>&nbsp;INFUNDADA/INPROCEDENTE</b>';
        tipo = 4;
        break;
      case '1':
        if (!terminacion) {
          titulo =
            'RESULTADOS DE AUDIENCIA INCOACIÓN A PROCESO INMEDIATO<b>&nbsp;FUNDADA/PROCEDENTE</b>';
          tipo = 1;
        } else {
          if (terminacionRadio === '1' || terminacionRadio === '2') {
            titulo =
              'RESULTADOS DE AUDIENCIA INCOACIÓN A PROCESO INMEDIATO<b>&nbsp;FUNDADA/PROCEDENTE - TERMINACIÓN ANTICIPADA APROBADA</b>';
            tipo = 2;
          } else if (terminacionRadio === '3') {
            titulo =
              'RESULTADOS DE AUDIENCIA INCOACIÓN A PROCESO INMEDIATO<b>&nbsp;FUNDADA/PROCEDENTE - TERMINACIÓN ANTICIPADA DESAPROBADA</b>';
            tipo = 3;
          }
        }
        break;
    }
    return {
      titulo: titulo,
      tipo: tipo,
      data: {
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        numeroCaso: this.numeroCaso,
        idEstadoTramite: this.idEstadoTramite,
      },
    };
  }

  test() {
    this.formRegistro.disable();
  }
  protected verResultadoAudiencia() {
    this.referenciaModal = this.dialogService.open(
      RegistrarResultadoAudienciaModalComponent,
      {
        width: '70%',
        showHeader: false,
        contentStyle: { padding: '0', 'border-radius': '15px' },
        data: this.retornarDataModalResultadoAudiencia(),
      }
    );

    this.referenciaModal.onClose.subscribe(() => {
      this.formReiniciado = false;
      this.obtenerValidacionResultadosAudiencia();
    });
  }

  protected validActivoResultadoAudiencia(): boolean {
    return (
      !this.formRegistro.get('resultado')?.value ||
      (this.formRegistro.get('terminacion')?.value == true &&
        this.formRegistro.get('terminacionRadio')?.value == '')
    );
  }

  protected obteneridTipoResultado(valor: number): string {
    return valor === ID_N_TIPO_RESULTADO.FUNDADO_PROCEDENTE ? '1' : '2';
  }

  protected obteneridTipoResultadoGuardar(): number {
    return this.formRegistro.get('resultado')?.value === '1'
      ? ID_N_TIPO_RESULTADO.FUNDADO_PROCEDENTE
      : ID_N_TIPO_RESULTADO.INFUNDADO_IMPROCENDENTE;
  }

  protected obtenerTramiteSentencia(valor: number | null): string | null {
    if (valor != null) {
      return valor ===
        ID_N_RESULTADO_TERMINACION_ANTICIPADA.SENTENCIA_TERMINACION_ANTICIPADA_TOTAL
        ? '1'
        : valor ===
          ID_N_RESULTADO_TERMINACION_ANTICIPADA.SENTENCIA_TERMINACION_ANTICIPADA_PARCIAL
        ? '2'
        : valor ===
          ID_N_RESULTADO_TERMINACION_ANTICIPADA.AUTO_DESAPRUEBA_TERMINACION_ANTICIPADA
        ? '3'
        : '';
    }
    return '';
  }

  protected obtenerTramiteSentenciaGuardar(): number | null {
    let tramite = this.formRegistro.get('terminacionRadio')?.value;
    if (tramite !== '') {
      return tramite === '1'
        ? ID_N_RESULTADO_TERMINACION_ANTICIPADA.SENTENCIA_TERMINACION_ANTICIPADA_TOTAL
        : tramite === '2'
        ? ID_N_RESULTADO_TERMINACION_ANTICIPADA.SENTENCIA_TERMINACION_ANTICIPADA_PARCIAL
        : ID_N_RESULTADO_TERMINACION_ANTICIPADA.AUTO_DESAPRUEBA_TERMINACION_ANTICIPADA;
    }
    return null;
  }

  protected submit() {
    let form = this.formRegistro.getRawValue();
    const dataRequest: ResolucionIncoacionInmediata = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: this.datePipe.transform(
        form.fechaNotificacion,
        'yyyy-MM-dd'
      ),
      flagTerminacionAnticipada: form.terminacion == true ? '1' : '0',
      idTipoResultado: this.obteneridTipoResultadoGuardar(),
      idTramiteSetencia: this.obtenerTramiteSentenciaGuardar(),
      observaciones: form.observaciones,
    };
    this.suscripciones.push(
      this.registroResolucionIncoacionService
        .registrarinocoacion(dataRequest)
        .subscribe({
          next: (resp) => {
            this.alertaDocumentoGuardado(resp);
            this.formRegistro.disable();
            this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
            this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              'Se ha producido un error al intentar registrar la información de la Resolución - auto que resuelve el requerimiento de incoación de proceso inmediato',
              'Ok'
            );
          },
        })
    );
  }

  private alertaDocumentoGuardado(mensajeFirma: MensajeFirma) {
    const mostrarBotonCancelar = mensajeFirma.mostrarBotonCancelar ? mensajeFirma.mostrarBotonCancelar!.trim() === '1' : false;
    const mostrarBotonSegundoConfirmar = mensajeFirma.mostrarBotonSegundoConfirmar ? mensajeFirma.mostrarBotonSegundoConfirmar.trim() === '1' : false;
    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      closeOnEscape: false,
      closable: false,
      data: {
        icon: mensajeFirma.icono,
        title: mensajeFirma.titulo,
        description: mensajeFirma.descripcion,
        confirmButtonText: mensajeFirma.textoBotonConfirmar,
        confirmSecondButtonText: mensajeFirma.textoBotonSegundoConfirmar,
        cancelButtonText: mensajeFirma.textoBotonCancelar,
        confirm: mostrarBotonCancelar,
        confirmSecond: mostrarBotonSegundoConfirmar,
        rowsView: true
      },
    } as DynamicDialogConfig<AlertaData>);

    this.referenciaModal.onClose.subscribe({
      next: (resp) => {
        if (mensajeFirma.idTipoAccion !== null) {
          if (resp === 'confirm' || (resp === 'closedAction' && !mostrarBotonCancelar)) {
            this.router.navigate([mensajeFirma.accion]).then(() => {
              window.location.reload();
            });
          }
          if (resp === 'confirm2') {
            this.router.navigate([mensajeFirma.accionSegundoConfirmar]).then(() => {
              window.location.reload();
            });
          }
        }
      }
    });
  }

  private confirmarCambioResultado() {
    if (this.formReiniciado) {
      this.obtenerValidacionResultadosAudiencia();
      return;
    }
    if (this.formRevertido) {
      this.formRevertido = false;
      return;
    }

    if( this.resultadosAudienciaCorrectos === '0' ) {
      this.formRevertido = false;
      this.previousValues = this.formRegistro.getRawValue();
      this.obtenerValidacionResultadosAudiencia();
      return;
    }

    const modalconf = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      closeOnEscape: false,
      closable: false,
      data: {
        icon: 'warning',
        title: 'CONFIRMAR CAMBIO DE RESULTADO',
        description: 'Al cambiar de resultado se perderá la información ingresada de la audiencia. ¿Desea continuar?',
        confirmButtonText: 'Aceptar',
        confirm: true
      },
    } as DynamicDialogConfig<AlertaData>);

    modalconf.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.reiniciarResultado();
        }
        if (resp === 'cancel') {
          this.revertirCambio();
        }
      }
    });
  }

  reiniciarResultado() {
    this.previousValues = this.formRegistro.getRawValue();
    this.registroResolucionIncoacionService.reiniciarInfoIncoacion(this.idActoTramiteCaso).subscribe({
      next: (resp) => {
        this.obtenerValidacionResultadosAudiencia();
        this.formReiniciado = true;
      },
      error: () => {
        this.modalDialogService.error(
          'Error',
          'Se ha producido un error al intentar reiniciar la información de la Resolución - auto que resuelve el requerimiento de incoación de proceso inmediato',
          'Ok'
        );
      },
    });
  }

  revertirCambio() {
    this.formRevertido = true;
    this.formRegistro.patchValue(this.previousValues);
  }

  protected counterReportChar(): number {
    return this.formRegistro.get('observaciones')!.value !== null
      ? this.formRegistro.get('observaciones')!.value.length
      : 0;
  }

  protected otroTramite() {
    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      showHeader: false,

      data: {
        tipo: 2,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idEtapa: this.idEtapa,
      },
    });

    ref.onClose.subscribe((confirm) => {
      if (confirm === RESPUESTA_MODAL.OK) window.location.reload();
    });
  }

  protected audiosAudiencia() {
    const ref = this.dialogService.open(GestionAudiosComponent, {
      showHeader: false,
      width: '80%',
      contentStyle: { padding: '0' },
      data: {
        idCaso: this.idCaso,
        tituloModal: 'Audios de la audiencia',
        idActoTramiteCaso: this.idActoTramiteCaso,
        modoLectura:this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO || this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
      },
    });

    ref.onClose.subscribe(() => {
      this.obtenerValidacionAudiosAudiencia();
    });
  }

  public icono(name: string): string {
    return icono(name);
  }

  protected obtenerValidacionAudiosAudiencia(){
    this.audiosAudienciaCorrectos = false;
    this.suscripciones.push(
      this.registroResolucionIncoacionService
        .validarAudiosDeAudiencia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            if(resp.data !== null && resp.data === '1'){
              this.audiosAudienciaCorrectos = true;
            }
          }
        })
    );
  }

  protected obtenerValidacionResultadosAudiencia(){
    this.resultadosAudienciaCorrectos = '0';
    this.visibleMensajeError = false;
    this.txtMensajeError = '';

    const dataRequest: ResolucionIncoacionInmediata = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: null,
      flagTerminacionAnticipada: this.formRegistro.get('terminacion')!.value ? '1' : '0',
      idTipoResultado: this.obteneridTipoResultadoGuardar(),
      idTramiteSetencia: this.obtenerTramiteSentenciaGuardar(),
      observaciones: '',
    };
    this.suscripciones.push(
      this.registroResolucionIncoacionService
        .validarResultadosDeAudiencia(dataRequest)
        .subscribe({
          next: (resp) => {
            if(resp.data !== null){
              this.resultadosAudienciaCorrectos = resp.data.codigoValidacion;
              if(this.resultadosAudienciaCorrectos === '2'){
                this.visibleMensajeError = true;
                this.txtMensajeError = resp.data.mensajeValidacion;
                this.formularioEditado(true);
              }else{
                this.formRegistro.invalid  || this.cambioFormulario || !this.primerGuardado ? this.formularioEditado(true): this.formularioEditado(false);
              }
            }
          }
        })
    );
  }

  validarAlertas(): void {
    this.registroResolucionIncoacionService.validarAlertas(this.idActoTramiteCaso).subscribe({
      next: resp => {
        if(resp.data !== null && resp.data === '1'){
          this.registrarAlertas();
        }
      }
    });
  }

  registrarAlertas(): void {
    const request: AlertaFormalizar = {
      idCaso: this.idCaso,
      numeroCaso: this.numeroCaso,
      idActoTramiteCaso: this.idActoTramiteCaso
    };
    this.suscripciones.push(
      this.registroResolucionIncoacionService.registraAlertas(this.etapa, request).subscribe()
    );
  }
}
