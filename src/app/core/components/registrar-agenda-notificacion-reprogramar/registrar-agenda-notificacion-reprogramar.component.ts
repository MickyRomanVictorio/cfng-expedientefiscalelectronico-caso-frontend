import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertComponent } from '@components/modals/alert-mesaunica-despacho/alert.component';
import { DateMaskModule } from '@directives/date-mask.module';
import { DigitOnlyModule } from '@directives/digit-only.module';
import { MaestroService } from '@services/shared/maestro.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule, ctrlErrorMsg } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { CatalogoInterface } from '@core/interfaces/comunes/catalogo-interface';
import { AgendaNotificacionInterface } from '@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { AgendaMultipleService } from '@core/services/provincial/tramites/agenda-multiple.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import { ESTADO_REGISTRO, RESPUESTA_MODAL } from 'ngx-cfng-core-lib';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { urlValidator } from './utils/url-validator';
import { MensajeInteroperabilidadPjComponent } from '../mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { MensajeCompletarInformacionComponent } from '../mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { ValidacionTramite } from '@interfaces/comunes/crearTramite';
import { getDateFromString } from '@core/utils/utils';
import { GuardarTramiteProcesalComponent } from '../modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import dayjs from 'dayjs';

enum TipoCitacionEnum {
  PRESENCIAL = 1222,
  VIRTUAL = 1223,
}

@Component({
  standalone: true,
  selector: 'app-registrar-agenda-notificacion-reprogramar',
  templateUrl: './registrar-agenda-notificacion-reprogramar.component.html',
  styleUrls: ['./registrar-agenda-notificacion-reprogramar.component.scss'],
  imports: [
    RadioButtonModule,
    DateMaskModule,
    CommonModule,
    DropdownModule,
    InputTextareaModule,
    MessagesModule,
    InputTextModule,
    CmpLibModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    DigitOnlyModule,
    FormsModule,
    ProgressBarModule,
    ToastModule,
    AlertComponent,
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
})
export class RegistrarAgendaNotificacionesReprogramarComponent
  implements OnInit {
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
  protected fechaActual: Date = new Date();
  protected fechaIngreso: Date | null = null;
  private readonly dialogService = inject(DialogService)

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
    const fechaIngresoStr = this.gestionCasoService.expedienteActual.fechaIngreso;
    this.fechaIngreso = getDateFromString(fechaIngresoStr);
    this.listarTipoActividadAgenda();
    this.fechaActual = dayjs().startOf('day').toDate();
    if (this.tieneActoTramiteCasoDocumento) {
      this.getListDistritoJudicial();
      this.obtenerDetalleActoTramiteCaso();
    }
  }

  private obtenerUltimaAgendaReprogramada() {
    this.agendaMultipleService
      .obtenerAgendaReprogramada(this.idActoTramiteCaso!)
      .subscribe({
        next: (resp: any) => {
          const data: any = {
            fechaPresentacion: this.truncateToMinutes(resp.fechaNotificacion),
            cboAudiencias: resp.idAgendaFiscalAnterior,
            fechaAudiencia: '',
            fechaAudienciaNueva: new Date(resp.fechaHoraAudicacionReprogramada),
            tipoCitacion: resp.idTipoActividadAgenda,
            cboDistritoJudicial: resp.idDistritoPJ,
            cboJuzgado: resp.idJuzgadoPJ,
            txtObservacion: resp.observacion,
            urlReunion: resp.urlReunion,
          };

          const audiencia: AgendaNotificacionInterface = {
            idRegistroTabla: '',
            idAgendaFiscal: resp.idAgendaFiscalAnterior,
            fechaNotificacion: '',
            fechaHoraAudicencia: resp.fechaHoraAudicenciaAnterior,
            idTipoActividadAgenda: 0,
            tipoActividadAgenda: '',
            urlReunion: '',
            idDistritoPJ: 0,
            idJuzgadoPJ: '',
            observacion: '',
            idCaso: '',
            idActoTramiteCaso: '',
            estadoAgendaFiscal: '',
          };
          this.listaAudiencias.push(audiencia);
          this.formRegistro.reset();
          this.formRegistro.patchValue(data);
          this.formRegistro.disable();
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }

  /**
   * Inicializa el formulario para registrar una notificaci n reprogramada.
   * Los campos que se inicializan son:
   * - fechaPresentacion: fecha de presentaci n del caso
   * - fechaAudiencia: fecha de la audiencia
   * - fechaAudienciaNueva: fecha de la nueva audiencia
   * - tipoCitacion: tipo de citaci n
   * - cboDistritoJudicial: distrito judicial
   * - cboJuzgado: juzgado
   * - txtObservacion: observaciones
   * - urlReunion: url de la reuni n
   */
  private inicializarFormulario() {
    this.formRegistro = this.fb.group({
      fechaPresentacion: new FormControl(null, [Validators.required]),
      cboAudiencias: new FormControl(null),
      fechaAudiencia: new FormControl(null, [Validators.required]),
      fechaAudienciaNueva: new FormControl(null, [Validators.required]),
      tipoCitacion: new FormControl(null, [Validators.required]),
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

  /**
   * Método que controla si se muestra el mesaje de interoperabilidad o se carga el formulario.
   * 1 Si no tiene un documento generado en mesa
   * 2 Si el tipo de trámite no es recbido
   * 3 Si el paso 1 y 2 son verdaderos, pero son de otro trámite en mesa, pero del nuevo no se tiene ningún trámite iniciado
   * entonces se muestra el mensaje de interoperabilidad.
   * @Sumary El caso 3 se presenta cuando ya está en estado RECIBIDO un trámite en mesa y se selecciona un trámite distinto que
   * también es de tipo de inicio RECIBIDO.
   */
  get servicioNoActivo(): boolean {
    return (!this.tieneActoTramiteCasoDocumento && !this.tramiteEstadoRecibido) || this.sinTramite;
  }


  get sinTramite(): boolean {
    return this.validacionTramite.cantidadTramiteSeleccionado == 0;
  }

  get tieneActoTramiteCasoDocumento(): boolean {
    return !(
      this.idActoTramiteCaso == null ||
      this.idActoTramiteCaso == ''
    );
  }

  get tramiteEstadoRecibido(): boolean {
    return this.validacionTramite.idEstadoRegistro === ESTADO_REGISTRO.RECIBIDO;
  }

  get urlReunion() {
    return this.formRegistro.get('urlReunion');
  }

  /**
   * Obtiene el detalle de un acto de tramite caso para deshabilitar el formulario
   * y obtener la lista de distrito judicial y tipos de actividad para la agenda.
   * Si el estado del tramite es recibido, se deshabilita el formulario.
   */
  private obtenerDetalleActoTramiteCaso() {
    this.casoService
      .actoTramiteDetalleCaso(this.idActoTramiteCaso!)
      .subscribe({
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

  /**
   * Obtiene el formulario de verificacion de los campos
   * Fecha de presentacion.
   * @returns {FormGroup} El formulario de verificacion.
   */
  private verificationForm(): FormGroup {
    return new FormGroup({
      fechaPresentacion: new FormControl('', [Validators.required]),
    });
  }
  /**
   * Obtiene el numero de caracteres ingresados en el campo de
   * observaciones. Si el valor del campo es nulo, devuelve 0.
   * @returns {number} El numero de caracteres ingresados.
   */

  protected counterReportChar(): number {
    return this.formRegistro.get('txtObservacion')!.value !== null
      ? this.formRegistro.get('txtObservacion')!.value.length
      : 0;
  }

  /**
   * Obtiene la lista de distritos judiciales.
   * Subscribe al servicio MaestroService.getDistritoJudicial() y
   * almacena el resultado en la propiedad distritoJudicialList.
   */
  public getListDistritoJudicial(): void {
    this.maestroService.getDistritoJudicial().subscribe({
      next: (resp) => {
        if (resp && resp.code === 200) {
          this.distritoJudicialList = resp.data;
        }
      },
    });
  }

  /**
   * Obtiene la lista de juzgados por distrito judicial.
   * @param idDistritoJudicial El id del distrito judicial.
   */
  listarJuzgadosPazLetrado(idDistritoJudicial: number) {
    this.formRegistro.get('cboJuzgado')?.setValue(null);
    this.maestroService
      .getJuzgadosPorDistritoJudicial(idDistritoJudicial)
      .subscribe({
        next: (resp) => {
          this.juzgadosList = resp.data;
        },
        error: () => { },
      });
  }

  private get formFirmaValidation(): boolean {
    return this.formRegistro.valid;
  }

  protected get formsValidation(): boolean {
    return this.formFirmaValidation;
  }

  /**
   * Llama al método reprogramarAudiencia si la etapa actual del caso es una etapa de juzgamiento.
   * Si no es una etapa de juzgamiento, no hace nada.
   */
  protected eventoRegistrarAgenda(): void {
    //if (this.esJuzgamiento) {
    this.reprogramarAudiencia();
    //}
  }

  /**
   * Reprograma la audiencia con los datos del formulario de reprogramación.
   * Verifica si la fecha de reprogramación ya se encuentra registrada.
   * Si la fecha ya se encuentra registrada, muestra un dialogo para confirmar o cancelar la acción.
   * Si se confirma la acción, reprograma la audiencia.
   * Si no se confirma la acción, no hace nada.
   */
  private reprogramarAudiencia() {
    const datos = this.formRegistro.getRawValue();

    if (this.esFechaAgendaDuplicada(datos)) {
      this.manejarFechaDuplicada(datos);
    } else {
      this.confirmarReprogramacionAudiencia(datos);
    }
  }

  /**
   * Maneja la fecha duplicada, mostrando un dialogo para confirmar o cancelar la acción.
   * Si se confirma la acción, reprograma la audiencia con los datos del formulario de reprogramación.
   * Si no se confirma la acción, no hace nada.
   * @param datos datos del formulario de reprogramación.
   */
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

  /**
   * Confirma la reprogramación de la audiencia con los datos del formulario de reprogramación.
   * Si se confirma la acción, reprograma la notificación de audiencia con los datos del formulario de reprogramación.
   * Si no se confirma la acción, no hace nada.
   * @param datos datos del formulario de reprogramación.
   */
  private confirmarReprogramacionAudiencia(datos: any) {
    this.modalConfirmarReprogramacionAudiencia().subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.reprogramarNotificacionAudiencia(datos);
        }
      },
    });
  }

  /**
   * Muestra un dialogo para confirmar o cancelar la acción de reprogramar la audiencia.
   * El dialogo muestra un mensaje que indica que la fecha y hora de programación que se está ingresando ya se encuentra registrada.
   * Si se confirma la acción, se devuelve CfeDialogRespuesta.Confirmado.
   * Si no se confirma la acción, se devuelve CfeDialogRespuesta.Cancelado.
   * @returns un Observable que se resuelve con CfeDialogRespuesta.Confirmado o CfeDialogRespuesta.Cancelado.
   */
  private modalFechaYHoraDuplicada(): Observable<CfeDialogRespuesta> {
    return this.modalDialogService.question(
      'Fecha y hora de agenda duplicada',
      'La Fecha y hora de programación que está ingresando ya se encuentra registrada. ¿Está seguro de realizar la siguiente acción?',
      'Aceptar',
      'Cancelar'
    );
  }

  /**
   * Muestra un dialogo para confirmar o cancelar la acción de reprogramar la audiencia.
   * El dialogo muestra un mensaje que pregunta si se está seguro de reprogramar la audiencia.
   * Si se confirma la acción, se devuelve CfeDialogRespuesta.Confirmado.
   * Si no se confirma la acción, se devuelve CfeDialogRespuesta.Cancelado.
   * @returns un Observable que se resuelve con CfeDialogRespuesta.Confirmado o CfeDialogRespuesta.Cancelado.
   */
  private modalConfirmarReprogramacionAudiencia(): Observable<CfeDialogRespuesta> {
    return this.modalDialogService.question(
      'Reprogramación de audiencia',
      '¿Está seguro de reprogramar la audiencia?',
      'Aceptar',
      'Cancelar'
    );
  }

  formatDateString = (date: Date | string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Extrae solo 'yyyy-MM-dd'
  };

  private convertirFechaLocal(fecha: string | Date): string {
    const fechaUTC = new Date(fecha);
    const offset = fechaUTC.getTimezoneOffset() * 60000; // Convertir minutos a milisegundos
    const fechaLocal = new Date(fechaUTC.getTime() - offset);

    return fechaLocal.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"
  }

  /**
   * Reprograma la notificación de audiencia según la información del formulario de reprogramación.
   * Llama al servicio de agenda multiple para reprogramar la notificación de audiencia.
   * Si la fecha y hora de agenda ya se encuentra registrada, muestra un dialogo para confirmar o cancelar la acción.
   * Si se confirma la acción, se reprograma la notificación de audiencia y se muestra un dialogo de confirmación.
   * Si se cancela la acción, no se reprograma la notificación de audiencia y no se muestra dialogo alguno.
   * @param datos datos del formulario de reprogramación
   */
  private reprogramarNotificacionAudiencia(datos: any) {
    const agenda: AgendaNotificacionInterface = {
      idRegistroTabla: this.audienciaSeleccionada!.idRegistroTabla,
      idAgendaFiscal: this.audienciaSeleccionada!.idAgendaFiscal,
      idCaso: this.audienciaSeleccionada!.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso!,
      fechaNotificacion: this.formatDateString(datos.fechaPresentacion),
      fechaHoraAudicencia: this.convertirFechaLocal(datos.fechaAudienciaNueva),
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
            this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
            this.flagregistrar = true;
            this.formRegistro.disable();
          }
        },
        error: (err) => {
          this.flagregistrar = false;
        },
      });
  }

  /**
   * Valida la etapa actual del caso y toma acciones en consecuencia.
   *
   * Si la etapa actual es una etapa de juzgamiento, se eliminan los validadores
   * de la fecha de audiencia y se obtienen las agendas fiscales anteriores del
   * acto trámite caso documento actual.
   */
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
        this.obtenerAgendasFiscales();
        this.getListDistritoJudicial();
      }
    } else {
      this.obtenerAgendaAnterior()
      this.agendaMultipleService
        .obtenerReprogramacionNotificacion(this.idActoTramiteCaso!)
        .subscribe({
          next: (resp: any) => {
            this.formRegistro.get('fechaPresentacion')?.setValue(resp.fechaNotificacion && resp.fechaNotificacion !== null ? new Date(resp.fechaNotificacion) : null);
            this.formRegistro.get('fechaAudienciaNueva')?.setValue(resp.fechaHoraAudicacionReprogramada && resp.fechaHoraAudicacionReprogramada !== null ? new Date(resp.fechaHoraAudicacionReprogramada) : null);
            this.formRegistro.get('tipoCitacion')?.setValue(resp.idTipoActividadAgenda);
            this.formRegistro.get('cboDistritoJudicial')?.setValue(resp.idDistritoPJ);
            this.formRegistro.get('cboJuzgado')?.setValue(resp.idJuzgadoPJ);
            this.formRegistro.get('txtObservacion')?.setValue(resp.observacion);
            this.formRegistro.get('urlReunion')?.setValue(resp.urlReunion);
          },
          error: (error: any) => {
            console.log(error);
          },
        });

      if (this.tramiteEstadoRecibido) {
        this.flagregistrar = true;
        this.formRegistro.disable();
      }

    }
  }

  /**
   * Verifica si la etapa actual del caso es una etapa de juzgamiento.
   *
   * @returns {boolean} Verdadero si la etapa actual es de juzgamiento, falso en caso contrario.
   */
  protected get esJuzgamiento(): boolean {
    const juzgamientoValues = ['10', '11', '12'];
    return juzgamientoValues.includes(this.caso.idEtapa);
  }

  /**
   * Obtiene las agendas fiscales anteriores del acto trámite caso documento
   * actual.
   *
   * @remarks
   * Esta función se encarga de obtener las agendas fiscales anteriores del
   * acto trámite caso documento actual, para luego ser mostradas en un
   * dropdown en el componente de reprogramación de audiencia.
   */
  private obtenerAgendasFiscales() {
    this.agendaMultipleService
      .listarAgendaAnteriores(this.idActoTramiteCaso!)
      .subscribe({
        next: (resp) => {
          this.listaAudiencias = resp;
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  private obtenerAgendaAnterior() {
    this.agendaMultipleService
      .obtenerAgendaAnterior(this.idCaso!)
      .subscribe({
        next: (resp) => {
          this.audienciaSeleccionada = resp;
          this.formRegistro.get('fechaAudiencia')?.setValue(resp.fechaHoraAudicencia && resp.fechaHoraAudicencia !== null ? new Date(resp.fechaHoraAudicencia) : null);
          this.formRegistro.get('fechaAudiencia')?.disable();
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  /**
   * Obtiene la lista de tipos de actividad de agenda y la almacena en la propiedad tipoActividadAgenda.
   * En caso de error, inicializa la propiedad en un array vacío.
   */
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

  /**
   * Selecciona la audiencia y setea los valores en el formulario de reprogramacion
   * @param $event valor seleccionado en el combo de audiencias
   */
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
}
