import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AcuerdoReparatorioInfo,
} from '@core/interfaces/comunes/casosFiscales';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { AgendaNotificacion } from '@interfaces/provincial/tramites/comun/calificacion/agenda-notificacion/agenda-notificacion.interface';
import { DateMaskModule } from '@directives/date-mask.module';
import { DigitOnlyModule } from '@directives/digit-only.module';
import { PerfilActivoService } from '@services/generales/perfil-activo.service';
import { MaestroService } from '@services/shared/maestro.service';
import { capitalizedFirstWord } from '@utils/string';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { GuardarTramiteProcesalComponent } from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { AgendaNotificacionService } from '@services/provincial/tramites/comun/preparatoria/agenda-notificacion.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { MensajeCompletarInformacionComponent } from '../mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { AgendaMultipleService } from '@core/services/provincial/tramites/agenda-multiple.service';
import { AgendaNotificacionInterface } from '@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface';
import { convertirDateHoraString, convertStringToDate } from '@core/utils/date';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { RESPUESTA_MODAL, ValidationModule } from 'dist/ngx-cfng-core-lib';
import {
  MensajeInteroperabilidadPjComponent
} from '@components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { ESTADO_REGISTRO } from 'ngx-cfng-core-lib';
import { urlValidator } from '../registrar-agenda-notificacion-reprogramar/utils/url-validator';
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import { getDateFromString, limpiarFormcontrol } from '@core/utils/utils';
import { MensajeGenericoComponent } from '../mensajes/mensaje-generico/mensaje-generico.component';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

@Component({
  standalone: true,
  selector: 'app-registrar-agenda-notificacion',
  templateUrl: './registrar-agenda-notificacion.component.html',
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
    TableModule,
    CalendarModule,
    SelectButtonModule,
    ButtonModule,
    MensajeCompletarInformacionComponent,
    ValidationModule,
    MensajeInteroperabilidadPjComponent,
    MensajeGenericoComponent
  ],
  providers: [
    DialogService,
    DatePipe,
    DynamicDialogRef,
    DynamicDialogConfig,
    NgxCfngCoreModalDialogService,
  ],
})
export class RegistrarAgendaNotificacionesComponent implements OnInit, OnDestroy {

  @Input() idCaso: string = '';
  @Input() idEstadoTramite = 0;
  @Input() idActoTramiteCaso = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() validacionTramite!: ValidacionTramite;

  protected refModal!: DynamicDialogRef;
  protected acuerdoReparatorioInfo: AcuerdoReparatorioInfo | null = null;
  protected distritoJudicialList = [];
  protected juzgadosList = [];
  protected idTipoActividadVirtual: number = 1223;
  protected idTipoActividadPresencial: number = 1222;
  protected formRegistro: FormGroup;
  protected visibleMensajeValidacion: boolean = false;
  public textoValidacion: string | null = null;
  protected ocultarBotonGuardar: boolean = false;

  maxDate: Date = new Date();

  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>()

  private readonly suscripciones: Subscription[] = []
  private informacionCasoInicial: string = '';
  protected estaIncompleto: string = '1'
  protected fechaIngreso: Date | null = null;
  constructor(
    protected ref: DynamicDialogRef,
    protected config: DynamicDialogConfig,
    private readonly dialogService: DialogService,
    protected readonly maestroService: MaestroService,
    protected perfilActivoService: PerfilActivoService,
    private readonly agendaNotificacionService: AgendaNotificacionService,
    protected gestionCasoService: GestionCasoService,
    protected readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly agendaMultipleService: AgendaMultipleService,
    protected readonly tramiteService: TramiteService,

  ) {
    this.formRegistro = new FormGroup(
      {
        fechaPresentacion: new FormControl(null, [Validators.required]),
        fechaAudiencia: new FormControl(null, [Validators.required]),
        tipoCitacion: new FormControl(null, [Validators.required]),
        cboDistritoJudicial: new FormControl(null, [Validators.required]),
        cboJuzgado: new FormControl(null, [Validators.required]),
        txtObservacion: new FormControl(null),
        urlReunion: new FormControl(null),
      },

    );
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((e) => e.unsubscribe());
  }

  ngOnInit() {
    this.getListDistritoJudicial()
    this.obtenerFormulario()
    // this.habilitarGuardar(true)
    this.fechaIngreso = getDateFromString(this.gestionCasoService.expedienteActual.fechaIngresoDenuncia);

    this.formRegistro.get('tipoCitacion')?.valueChanges.subscribe((valor) => {
      this.cambiarTipoCitacion(valor);
    });

    if(this.tramiteEstadoRecibido || this.tramiteEnModoVisor){
       this.ocultarBotonGuardar = true;
    }

  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor
  }
  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor
  }

  protected cambiarTipoCitacion(valor: number) {
    limpiarFormcontrol(this.formRegistro.get('urlReunion'), []);
    if (valor === this.idTipoActividadPresencial) {
      this.formRegistro.get('urlReunion')?.setValue(null);
    }
    else {
      limpiarFormcontrol(this.formRegistro.get('urlReunion'), [Validators.required, Validators.maxLength(100), urlValidator()]);
    }
  }

  protected get formularioValido(): boolean {

    return this.formRegistro.valid;
  }

  protected elFormularioHaCambiado(): boolean {
    return this.informacionCasoInicial !== JSON.stringify(this.formRegistro)
  }



  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }

  get servicioNoActivo(): boolean {
    return !this.tieneActoTramiteCasoDocumento && !this.tramiteEstadoRecibido;
  }

  get tieneActoTramiteCasoDocumento(): boolean {
    return !(this.idActoTramiteCaso == null || this.idActoTramiteCaso == '');
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.validacionTramite.idEstadoRegistro === ESTADO_REGISTRO.PENDIENTE_COMPLETAR && this.ocultarBotonGuardar;
  }

  protected obtenerFormulario(): void {
    this.suscripciones.push(
      this.agendaMultipleService.listarAgendaMultiple(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: AgendaNotificacionInterface[]) => {
            if (resp.length > 0) {
              this.formRegistro.patchValue({
                fechaPresentacion: this.convertStringToDate(resp[0].fechaNotificacion),
                fechaAudiencia: convertirDateHoraString(resp[0].fechaHoraAudicencia),
                tipoCitacion: resp[0].idTipoActividadAgenda,
                cboDistritoJudicial: resp[0].idDistritoPJ,
                cboJuzgado: resp[0].idJuzgadoPJ,
                txtObservacion: resp[0].observacion,
                urlReunion: resp[0].urlReunion,
              })
            }
            if (resp[0].idEstadoRegistro === 963) {
              this.deshabilitarFormulario()
            }
          },
          error: error => {
            this.modalDialogService.error("Error", `Se ha producido un error al intentar listar los sujetos procesales`, 'Ok');
          }
        })
    )
  }
  private convertStringToDate(dateString: string | null): Date | null {
    return dateString ? dayjs(dateString, 'DD/MM/YYYY').toDate() : null;
  }
  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }
  private deshabilitarFormulario(): void {
    this.formRegistro.disable();
  }
  protected registrarAgenda(): void {
    this.visibleMensajeValidacion = false;
    const datos = this.formRegistro.getRawValue();

    if (this.formRegistro.invalid) {
      this.formRegistro.markAllAsTouched();
      return;
    }

    if (!this.validarFechaNotificacionAudiencia(datos.fechaPresentacion, datos.fechaAudiencia)) {
      this.visibleMensajeValidacion = true;
      this.textoValidacion = 'La fecha y hora de audiencia debe ser mayor o igual a la fecha de notificación';
      return;
    }

    let agenda: AgendaNotificacion = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      observacion: datos.txtObservacion,
      urlReunion: datos.urlReunion,
      idDistritoJudicial: datos.cboDistritoJudicial,
      idJuzgado: Number(datos.cboJuzgado),
      idTipoActividadAgenda: datos.tipoCitacion,
      fechaNotificacion: datos.fechaPresentacion,
      fechaAudiencia: datos.fechaAudiencia
    };

    this.suscripciones.push(
      this.agendaNotificacionService
        .registrarAgendaNotificacion(agenda)
        .subscribe({
          next: resp => {
            if (resp.code === '0') {
              this.ocultarBotonGuardar = true;
              this.formRegistro.disable()
              this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
              this.modalDialogService.success(
                'Datos guardado correctamente',
                'Se guardaron correctamente los datos para el trámite: <b>' + this.nombreTramite() + '</b>.',
                'Aceptar'
              );
            }
          },
          error: error => {
            this.modalDialogService.error(
              'Error',
              'No se pudo guardar la información para el trámite: <b>' + this.nombreTramite() + '</b>.',
              'Aceptar'
            );
          },
        })
    );
  }
  validarFechaNotificacionAudiencia(fechaInicio: any, fechaFin: any): boolean {
    return dayjs(fechaInicio).isSameOrBefore(dayjs(fechaFin));
  }

  protected counterReportChar(): number {
    return this.formRegistro.get('txtObservacion')!.value !== null
      ? this.formRegistro.get('txtObservacion')!.value.length
      : 0;
  }

  protected getListDistritoJudicial(): void {
    this.suscripciones.push(
      this.maestroService.getDistritoJudicial().subscribe({
        next: (resp) => {
          if (resp && resp.code === 200) {
            this.distritoJudicialList = resp.data;
          }
        },
      })
    );
  }

  protected listarJuzgadosPazLetrado(idDistritoJudicial: number) {
    this.suscripciones.push(
      this.maestroService
        .getJuzgadosPorDistritoJudicial(idDistritoJudicial)
        .subscribe({
          next: (resp) => {
            this.juzgadosList = resp.data;
          },
        })
    )
  }

  protected openModalSelectTramite(): void {
    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      width: '800px',
      showHeader: false,
      data: {
        tipo: 2,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idEtapa: this.idEtapa,
      },
    } as DynamicDialogConfig);
    ref.onClose.subscribe((confirm) => {
      if (confirm === RESPUESTA_MODAL.OK) window.location.reload();
    });
  }


}
