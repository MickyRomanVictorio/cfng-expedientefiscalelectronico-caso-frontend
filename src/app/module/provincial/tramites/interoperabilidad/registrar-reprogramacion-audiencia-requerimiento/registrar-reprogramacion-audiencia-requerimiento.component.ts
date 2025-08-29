import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { urlValidator } from '@core/components/registrar-agenda-notificacion-reprogramar/utils/url-validator';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { DigitOnlyModule } from '@core/directives/digit-only.module';
import { CatalogoInterface } from '@core/interfaces/comunes/catalogo-interface';
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import { AgendaNotificacionInterface } from '@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { AgendaMultipleService } from '@core/services/provincial/tramites/agenda-multiple.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { MaestroService } from '@core/services/shared/maestro.service';
import { Expediente } from '@core/utils/expediente';
import { obtenerIcono } from '@core/utils/icon';
import { CmpLibModule, ctrlErrorMsg } from 'dist/cmp-lib';
import { ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import { CalendarModule } from 'primeng/calendar';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Observable } from 'rxjs';
import { MessagesModule } from 'primeng/messages';
import { ProgressBarModule } from 'primeng/progressbar';

enum TipoCitacionEnum {
  PRESENCIAL = 1222,
  VIRTUAL = 1223,
}

@Component({
  selector: 'app-registrar-reprogramacion-audiencia-requerimiento',
  standalone: true,
  imports: [
    RadioButtonModule,
    DateMaskModule,
    CommonModule,
    DropdownModule,
    InputTextareaModule,
    MessagesModule,
    InputTextareaModule,
    CmpLibModule,
    ReactiveFormsModule,
    SelectButtonModule,
    InputNumberModule,
    DigitOnlyModule,
    FormsModule,
    ProgressBarModule,
    ToastModule,
    TableModule,
    CalendarModule,
    SelectButtonModule,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
  ],
  providers: [
    DialogService,
    DatePipe,
    DynamicDialogRef,
    DynamicDialogConfig,
    NgxCfngCoreModalDialogService,
  ],
  templateUrl:
    './registrar-reprogramacion-audiencia-requerimiento.component.html',
  styleUrl: './registrar-reprogramacion-audiencia-requerimiento.component.scss',
})
export class RegistrarReprogramacionAudienciaRequerimientoComponent {
  @Input() public idCaso: string = '';
  @Input() public idEtapa: string = '';
  @Input() public tramiteSeleccionado: any | null = null;
  @Input() public idActoTramiteCaso: string | null = null;
  @Input() public tramiteEnModoEdicion: boolean = false;
  @Input() public validacionTramite!: ValidacionTramite;

  protected distritoJudicialList = [];
  protected juzgadosList = [];
  protected obtenerIcono = obtenerIcono;
  protected flagregistrar: boolean = false;
  protected formRegistro: FormGroup = new FormGroup({});
  protected caso: Expediente;
  protected listaAudiencias: AgendaNotificacionInterface[] = [];
  protected audienciaSeleccionada: AgendaNotificacionInterface | undefined;
  protected tipoActividadAgenda: CatalogoInterface[] = [];
  protected cerrarLabel: boolean = false;
  private idEstadoRegistro: number = 0;
  protected minDateFechaAudiencia: Date;
  protected longitudMaximaObservaciones: number = 200;
  protected esReunionVirtual: boolean = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly fb: FormBuilder,
    public maestroService: MaestroService,
    private readonly agendaMultipleService: AgendaMultipleService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly casoService: Casos
  ) {
    this.minDateFechaAudiencia = new Date(new Date().setMinutes(0, 0));

    this.inicializarFormulario();
    this.caso = this.gestionCasoService.casoActual;
  }

  public async ngOnInit() {
    this.listarTipoActividadAgenda();
    this.obtenerUltimaAgendaReprogramada()
  }

  // fechaHoraAudicacionReprogramada
  // : 
  // null
  // fechaHoraAudicenciaAnterior
  // : 
  // "2025-02-21T15:47:55.000+00:00"
  // fechaNotificacion
  // : 
  // null
  // idAgendaFiscalAnterior
  // : 
  // "2EA9BC34A13E29EDE0650250569D508A"
  // idDistritoPJ
  // : 
  // 0
  // idJuzgadoPJ
  // : 
  // null
  // idTipoActividadAgenda
  // : 
  // 0
  // observacion
  // : 
  // null
  // urlReunion
  // : 
  // null
  private obtenerUltimaAgendaReprogramada() {
    this.agendaMultipleService
      .obtenerAgendaReprogramada(this.idActoTramiteCaso!)
      .subscribe({
        next: (resp: any) => {
          this.formRegistro.reset();
          this.formRegistro.patchValue({
            fechaNotificacion: resp.fechaNotificacion,
            cboAudiencias: null,
            fechaAudiencia: null,
            fechaAudienciaNueva: null,
            tipoCitacion: null,
            cboDistritoJudicial: new FormControl(null, [Validators.required]),
            cboJuzgado: new FormControl(null, [Validators.required]),
            txtObservacion: new FormControl(null, [
              Validators.maxLength(this.longitudMaximaObservaciones),
            ]),
            urlReunion: new FormControl(null, [Validators.maxLength(250)]),
          });
         // this.formRegistro.disable();
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }

  private inicializarFormulario() {
    this.formRegistro = this.fb.group({
      fechaNotificacion: new FormControl(null, [Validators.required]),
      cboAudiencias: new FormControl(null),
      fechaAudiencia: new FormControl(null, [Validators.required]),
      fechaAudienciaNueva: new FormControl(null, [Validators.required]),
      tipoCitacion: new FormControl(null),
      cboDistritoJudicial: new FormControl(null, [Validators.required]),
      cboJuzgado: new FormControl(null, [Validators.required]),
      txtObservacion: new FormControl(null, [
        Validators.maxLength(this.longitudMaximaObservaciones),
      ]),
      urlReunion: new FormControl(null, [Validators.maxLength(250)]),
    });
    this.formRegistro.get('tipoCitacion')?.valueChanges.subscribe((value) => {
      this.eventoCambiarTipoCitacion(value);
    });
  }

  get servicioNoActivo(): boolean {
    return (
      (!this.tieneActoTramiteCasoDocumento && !this.tramiteEstadoRecibido) ||
      this.sinTramite
    );
  }

  get sinTramite(): boolean {
    return this.validacionTramite.cantidadTramiteSeleccionado == 0;
  }

  get tieneActoTramiteCasoDocumento(): boolean {
    return !(this.idActoTramiteCaso == null || this.idActoTramiteCaso == '');
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoRegistro === ESTADO_REGISTRO.RECIBIDO;
  }

  get urlReunion() {
    return this.formRegistro.get('urlReunion');
  }

  private obtenerDetalleActoTramiteCaso() {
    this.casoService.actoTramiteDetalleCaso(this.idActoTramiteCaso!).subscribe({
      next: (resp: any) => {
        this.idEstadoRegistro = resp.idEstadoTramite;
        if (!this.servicioNoActivo) {
          this.validarEtapa();
        }
      },
    });
  }

  protected errorMsg(ctrlName: any) {
    if (ctrlName === 'college')
      return ctrlErrorMsg(this.formRegistro.get(ctrlName));
    if (ctrlName === 'dniEmitDate')
      return ctrlErrorMsg(this.formRegistro.get(ctrlName));
    if (ctrlName === 'email')
      return ctrlErrorMsg(this.formRegistro.get(ctrlName));
    return ctrlErrorMsg(this.verificationForm().get(ctrlName));
  }


  private verificationForm(): FormGroup {
    return new FormGroup({
      fechaNotificacion: new FormControl('', [Validators.required]),
    });
  }

  protected counterReportChar(): number {
    return this.formRegistro.get('txtObservacion')!.value !== null
      ? this.formRegistro.get('txtObservacion')!.value.length
      : 0;
  }

  public getListDistritoJudicial(): void {
    this.maestroService.getDistritoJudicial().subscribe({
      next: (resp) => {
        if (resp && resp.code === 200) {
          this.distritoJudicialList = resp.data;
        }
      },
    });
  }


  listarJuzgadosPazLetrado(idDistritoJudicial: number) {
    this.formRegistro.get('cboJuzgado')?.setValue(null);
    this.maestroService
      .getJuzgadosPorDistritoJudicial(idDistritoJudicial)
      .subscribe({
        next: (resp) => {
          this.juzgadosList = resp.data;
        },
        error: () => {},
      });
  }

  private get formFirmaValidation(): boolean {
    return this.formRegistro.valid;
  }

  protected get formsValidation(): boolean {
    return this.formFirmaValidation;
  }


  protected eventoRegistrarAgenda(): void {
    //if (this.esJuzgamiento) {
    this.reprogramarAudiencia();
    //}
  }


  private reprogramarAudiencia() {
    const datos = this.formRegistro.getRawValue();

    if (this.esFechaAgendaDuplicada(datos)) {
      this.manejarFechaDuplicada(datos);
    } else {
      this.confirmarReprogramacionAudiencia(datos);
    }
  }

  private manejarFechaDuplicada(datos: any) {
    this.modalFechaYHoraDuplicada().subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Cancelado) return;
        setTimeout(() => {
          this.confirmarReprogramacionAudiencia(datos);
        }, 200);
      },
    });
  }


  private confirmarReprogramacionAudiencia(datos: any) {
    this.modalConfirmarReprogramacionAudiencia().subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.reprogramarNotificacionAudiencia(datos);
        }
      },
    });
  }


  private modalFechaYHoraDuplicada(): Observable<CfeDialogRespuesta> {
    return this.modalDialogService.question(
      'Fecha y hora de agenda duplicada',
      'La Fecha y hora de programación que está ingresando ya se encuentra registrada. ¿Está seguro de realizar la siguiente acción?',
      'Aceptar',
      'Cancelar'
    );
  }

  private modalConfirmarReprogramacionAudiencia(): Observable<CfeDialogRespuesta> {
    return this.modalDialogService.question(
      'Reprogramación de audiencia',
      '¿Está seguro de reprogramar la audiencia?',
      'Aceptar',
      'Cancelar'
    );
  }

  private reprogramarNotificacionAudiencia(datos: any) {
    const agenda: AgendaNotificacionInterface = {
      idRegistroTabla: this.audienciaSeleccionada!.idRegistroTabla,
      idAgendaFiscal: this.audienciaSeleccionada!.idAgendaFiscal,
      idCaso: this.audienciaSeleccionada!.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso!, // del tramite
      fechaNotificacion: datos.fechaPresentacion,
      fechaHoraAudicencia: datos.fechaAudienciaNueva,
      idTipoActividadAgenda: datos.tipoCitacion,
      tipoActividadAgenda: '',
      urlReunion: datos.urlReunion,
      idDistritoPJ: datos.cboDistritoJudicial,
      idJuzgadoPJ: datos.cboJuzgado,
      observacion: datos.txtObservacion,
      estadoAgendaFiscal: this.audienciaSeleccionada!.estadoAgendaFiscal,
    };
    this.agendaMultipleService
      .reprogramarNotificacionAudiencia(agenda)
      .subscribe({
        next: (resp) => {
          if (resp && resp.code == 200) {
            setTimeout(() => {
              this.modalDialogService.success(
                '',
                'Se registró correctamente la información de reprogramación de la agenda de notificación de audiencia',
                'Aceptar'
              );
            }, 200);
            this.flagregistrar = true;
            this.formRegistro.disable();
            // this.deshabilitarFormulario();
          }
        },
        error: (err) => {
          this.flagregistrar = false;
        },
      });
  }


  private validarEtapa() {
    // debugger;
    if (this.esJuzgamiento) {
      this.formRegistro.get('fechaAudiencia')?.clearValidators();

      if (!this.tramiteEnModoEdicion && this.tramiteEstadoRecibido) {
        this.flagregistrar = true;
        this.obtenerUltimaAgendaReprogramada();
        
        this.obtenerAgendasFiscales();
        this.getListDistritoJudicial();
      } else {
        // this.deshabilitarFormulario();
        this.obtenerAgendasFiscales();
        this.getListDistritoJudicial();
      }
    }
  }

  protected get esJuzgamiento(): boolean {
    const juzgamientoValues = ['10', '11', '12'];
    return juzgamientoValues.includes(this.caso.idEtapa);
  }

  private obtenerAgendasFiscales() {
    this.agendaMultipleService
      .listarAgendaAnteriores(this.idActoTramiteCaso!)
      // .listarAgendaMultiple(this.caso.idActoTramiteCasoUltimo)
      // .listarAgendaMultiple('23AA05D7FC2F25D3E0650250569D508A')
      .subscribe({
        next: (resp) => {
          this.listaAudiencias = resp;
        },
        error: (error) => {
          console.error(error);
        },
      });
  }


  private listarTipoActividadAgenda(): void {
    // this.suscriptions.push(
    this.maestroService.getCatalogo('ID_N_TIPO_ACTIV_AGENDA').subscribe({
      next: (resp) => {
        this.tipoActividadAgenda = resp.data;
      },
      error: (error) => {
        this.tipoActividadAgenda = [];
      },
    });
    // );
  }

  protected eventoSeleccionarAudiencia($event: any) {

    this.audienciaSeleccionada = this.listaAudiencias.find(
      (x) => x.idAgendaFiscal == $event.value
    );

    if (this.tramiteEnModoEdicion || !this.tramiteEstadoRecibido) {
      if (this.audienciaSeleccionada) {
        const data: any = {
          fechaAudiencia: '',
          fechaAudienciaNueva: '',
          tipoCitacion: this.audienciaSeleccionada.idTipoActividadAgenda,
          cboDistritoJudicial: this.audienciaSeleccionada.idDistritoPJ,
          cboJuzgado: this.audienciaSeleccionada.idJuzgadoPJ,
          txtObservacion: this.audienciaSeleccionada.observacion,
          urlReunion: this.audienciaSeleccionada.urlReunion,
        };

        this.formRegistro.patchValue(data);

        this.formRegistro.enable();
        // this.esReunionVirtual;
        this.listarTipoActividadAgenda();
        this.obtenerAgendasFiscales();
        this.getListDistritoJudicial();
      }
    }
  }

  /**
   * Convierte el primer caracter de cada palabra en mayuscula, y el resto en minuscula.
   * Reemplaza ' De ' por ' de '.
   * @param titulo El texto a ser formateado.
   * @returns El texto formateado.
   */
  protected obtenerTitulo(titulo: string): string {
    if (!titulo) return '';
    let textoFormateado = titulo.toLowerCase();
    let palabras = textoFormateado.split(' ');
    for (let i = 0; i < palabras.length; i++) {
      palabras[i] = palabras[i].charAt(0).toUpperCase() + palabras[i].slice(1);
    }
    textoFormateado = palabras.join(' ');
    textoFormateado = textoFormateado.replaceAll(' De ', ' de ');
    return textoFormateado;
  }

  /**
   * Determina si la citación es una reunión virtual o no.
   * @returns true si la citación es una reunión virtual, false en caso contrario
   */
  // protected get esReunionVirtual() {
  //   return this.formRegistro.get('tipoCitacion')?.value === 1223;
  // }

  /**
   * Verifica si la fecha de reprogramación de la agenda de notificación de audiencia ya se encuentra registrada
   * @param datos datos del formulario de reprogramación
   * @returns true si la fecha ya se encuentra registrada, false en caso contrario
   */
  private esFechaAgendaDuplicada(datos: any): boolean {
    // return this.listaAudiencias.some(
    //   (x) => x.fechaHoraAudicencia === datos.fechaAudienciaNueva
    // );

    return this.listaAudiencias.some(
      (x) =>
        this.truncateToMinutes(
          new Date(this.listaAudiencias[2].fechaHoraAudicencia)
        ).getTime() ===
        this.truncateToMinutes(new Date(datos.fechaAudienciaNueva)).getTime()
    );
  }

  private truncateToMinutes(date: Date): Date {
    const truncatedDate = new Date(date);
    truncatedDate.setSeconds(0);
    truncatedDate.setMilliseconds(0);
    return truncatedDate;
  }

  protected eventoCambiarTipoCitacion(value: number) {
    const urlReunionControl = this.formRegistro.get('urlReunion');

    if (value === TipoCitacionEnum.PRESENCIAL) {
      this.esReunionVirtual = false;
      urlReunionControl?.clearValidators();
    } else {
      this.esReunionVirtual = true;
      urlReunionControl?.setValidators([
        Validators.maxLength(250),
        urlValidator(),
      ]);
    }
    urlReunionControl?.updateValueAndValidity();
  }
}
