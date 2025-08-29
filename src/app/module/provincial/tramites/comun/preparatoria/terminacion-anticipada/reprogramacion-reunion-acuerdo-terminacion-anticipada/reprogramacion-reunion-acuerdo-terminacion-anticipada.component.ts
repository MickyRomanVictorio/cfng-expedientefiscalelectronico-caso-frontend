import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { SujetosTerminacionAnticipadaComponent } from '@core/components/modals/sujetos-terminacion-anticipada/sujetos-terminacion-anticipada.component';
import { urlValidator } from '@core/components/registrar-agenda-notificacion-reprogramar/utils/url-validator';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { CitacionReunionAcuerdoTerminacionAnticipadaService } from '@core/services/provincial/tramites/comun/preliminar/terminacion-anticipada/citacion-reunion-acuerdo-terminacion-anticipada..service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { TERMINACION_ANTICIPADA } from '@core/types/efe/provincial/tramites/comun/preparatoria/terminacion-anticipada.type';
import { convertStringToDate } from '@core/utils/date';
import { capitalizedFirstWord } from '@core/utils/string';
import { limpiarFormcontrol } from '@core/utils/utils';
import { CmpLibModule } from 'dist/cmp-lib';
import { ESTADO_REGISTRO, icono, ValidationModule } from 'dist/ngx-cfng-core-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { catchError, map, Observable, Subscription, tap, throwError } from 'rxjs';
import dayjs from 'dayjs';

@Component({
  selector: 'app-reprogramacion-reunion-acuerdo-terminacion-anticipada',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MensajeCompletarInformacionComponent,
    CalendarModule,
    FormsModule,
    CmpLibModule,
    DateMaskModule,
    ValidationModule,
    RadioButtonModule,
    InputTextModule,
    DropdownModule,
  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './reprogramacion-reunion-acuerdo-terminacion-anticipada.component.html',
  styleUrl: './reprogramacion-reunion-acuerdo-terminacion-anticipada.component.scss'
})
export class ReprogramacionReunionAcuerdoTerminacionAnticipadaComponent {

  public idCaso!: string

  public numeroCaso!: string

  public idActoTramiteCaso!: string

  public idEstadoTramite!: number

  public etapa!: string

  private readonly subscriptions: Subscription[] = []

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  protected readonly tramiteService = inject(TramiteService)

  protected readonly citacionReunionAcuerdoTerminacionAnticipadaService = inject(CitacionReunionAcuerdoTerminacionAnticipadaService)

  private readonly firmaIndividualService = inject(FirmaIndividualService)

  private readonly fb = inject(FormBuilder)

  private readonly dialogService = inject(DialogService)

  @Output() peticionParaEjecutar = new EventEmitter<() => Observable<any>>()

  protected formRegistro: FormGroup

  protected TERMINACION_ANTICIPADA = TERMINACION_ANTICIPADA

  public tramiteSeleccionado: TramiteProcesal | null = null

  protected sujetosProcesalesSeleccionadosIds: string[] = []

  private valoresGuardados!: any

  private valoresSujetosGuardados!: any

  public modoLecturaSujeto: boolean = false

  public seHanGuardadosDatos: boolean = false

  public listaCitasAgendadas: any = [];

  protected fechaCitacion: Date | null = null;

  constructor(
  ) {
    this.formRegistro = this.fb.group({
      citasAgendadas: ['', [Validators.required]],
      fechaHoraReunion: ['', [Validators.required]],
      tipoCitacion: ['', [Validators.required]],
      urlReunion: ['', [Validators.maxLength(100)]],
      lugar: ['', [Validators.required, Validators.maxLength(100)]],
      observaciones: ['', [Validators.maxLength(200)]],
    });
  }
  ngOnInit(): void {

    this.listarCitasAgendadas();

    this.obtenerDatosGuardadosTramite()

    this.peticionParaEjecutar.emit(() => this.guardarFormulario())

    if (this.tramiteEnModoVisor || this.tramiteEstadoFirmado) {
      this.formRegistro.disable()
      this.habilitarFirmar(false)
      this.modoLecturaSujeto = true
    }

    this.formRegistro.valueChanges.subscribe(() => {
      this.activarGuardarTramite()
    });

    this.subscriptions.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.formRegistro.disable()
            this.modoLecturaSujeto = true
          }
        }
      )
    )
  }

  protected listarCitasAgendadas(): void {
    this.subscriptions.push(
      this.citacionReunionAcuerdoTerminacionAnticipadaService
        .listarCitasAgendadas(this.idCaso)
        .subscribe({
          next: (resp: any) => {
            this.listaCitasAgendadas = resp;
            if (this.listaCitasAgendadas.length == 1) {
              this.formRegistro.get('citasAgendadas')?.setValue(this.listaCitasAgendadas[0].idAgendaFiscal)
              this.cambiarFechaMinimaReprogramacion(this.listaCitasAgendadas[0].fecha)
            }
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              'Se ha producido un error al listar las citas agendadas',
              'Aceptar'
            );
          },
        })
    );
  }


  protected obtenerDatosGuardadosTramite(): void {
    this.subscriptions.push(
      this.citacionReunionAcuerdoTerminacionAnticipadaService
        .obtenerDatosCitacion(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: any) => {
            if (resp) {
              console.log(resp)
              this.formRegistro.get('citasAgendadas')?.setValue(resp.idAgendaFiscalPadre ?? '')
              this.formRegistro.get('fechaHoraReunion')?.setValue(convertStringToDate(resp.fechaReunion))
              this.formRegistro.get('lugar')?.setValue(resp.lugar ?? '')
              this.formRegistro.get('observaciones')?.setValue(resp.observacion ?? '')
              this.formRegistro.get('tipoCitacion')?.setValue(resp.idTipoActividadAgenda ?? '')
              this.cambiarTipoCitacion({ value: resp.idTipoActividadAgenda })
              this.formRegistro.get('urlReunion')?.setValue(resp.urlReunion ?? '')
              this.sujetosProcesalesSeleccionadosIds = resp.sujetos as string[]
              //VALIDAR CAMBIOS GENERADOS
              this.valoresGuardados = this.formRegistro.getRawValue()
              this.valoresSujetosGuardados = resp.sujetos as string[]
              this.formularioEditado(false)
              this.habilitarGuardar(false)
              this.seHanGuardadosDatos = true;
            }
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              'Se ha producido un error al obtener los datos guardados del trámite',
              'Aceptar'
            );
          },
        })
    );

  }

  protected abrirModalAgregarEditarSujeto() {
    const ref = this.dialogService.open(SujetosTerminacionAnticipadaComponent, {
      showHeader: false,
      data:
      {
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        numeroCaso: this.numeroCaso,
        etapa: this.etapa,
        sujetosProcesalesSeleccionadosIds: this.sujetosProcesalesSeleccionadosIds,
        modoLectura: this.modoLecturaSujeto,
        idTramite: this.idTramite
      },
      contentStyle: { padding: '0', 'border-radius': '15px' }
    });

    ref.onClose.subscribe((data: any) => {
      if (Array.isArray(data) && data.length > 0) {
        this.sujetosProcesalesSeleccionadosIds = data;
        this.activarGuardarTramite()
      }
    });
  }

  protected cambiarTipoCitacion(event: any): void {
    const citacion = event.value;
    limpiarFormcontrol(this.formRegistro.get('urlReunion'), []);
    if (citacion === this.TERMINACION_ANTICIPADA.CITACION_PRESENCIAL) {
      this.formRegistro.get('urlReunion')?.setValue('')
    }
    else {
      limpiarFormcontrol(this.formRegistro.get('urlReunion'), [Validators.required, Validators.maxLength(100), urlValidator()]);
    }
  }

  protected guardarFormulario(): Observable<any> {
    if (this.formRegistro.invalid || this.sujetosProcesalesSeleccionadosIds.length == 0) {
      this.formRegistro.markAllAsTouched();
      return throwError(() => new Error('Error de validación de campos'));
    }

    const form = this.formRegistro.getRawValue();
    const request = {
      idAgendaFiscal: form.citasAgendadas,
      idActoTramiteCaso: this.idActoTramiteCaso,
      idCaso: this.idCaso,
      observacion: form.observaciones,
      urlReunion: form.urlReunion,
      idTipoActividadAgenda: form.tipoCitacion,
      fechaReunion: form.fechaHoraReunion,
      lugar: form.lugar,
      sujetos: this.sujetosProcesalesSeleccionadosIds
    };

    return this.citacionReunionAcuerdoTerminacionAnticipadaService.registrarEditarProgramacionCitacion(request).pipe(
      tap(() => {
        this.formularioEditado(false)
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

  protected cambiarCitaAgendada(idAgendaFiscal: string) {
    const cita = this.listaCitasAgendadas.find((cita: any) => cita.idAgendaFiscal === idAgendaFiscal);
    this.cambiarFechaMinimaReprogramacion(cita.fecha)
  }

  protected validarCambiosForm(): boolean {
    return JSON.stringify(this.valoresGuardados) !== JSON.stringify(this.formRegistro.getRawValue());
  }
  protected validarCambiosSujetos(): boolean {
    return JSON.stringify(this.valoresSujetosGuardados) !== JSON.stringify(this.sujetosProcesalesSeleccionadosIds);
  }

  protected cambiarFechaMinimaReprogramacion(fecha: string): void {
    this.fechaCitacion = dayjs(convertStringToDate(fecha, "DD/MM/YYYY HH:mm")).toDate()
  }

  protected validarSeleccionProgramacion() {
    const fecha = this.formRegistro.get('fechaHoraReunion')?.value;
    if (!fecha) return;
    const fechaSeleccionada = dayjs(fecha);
    const fechaCitacion = this.fechaCitacion
    const fechaMaxima = dayjs().subtract(1, 'minute');

    const esPosteriorACitacion = fechaSeleccionada.isAfter(fechaCitacion);
    const esMayorOIgualQueActual = fechaSeleccionada.isAfter(fechaMaxima) || fechaSeleccionada.isSame(fechaMaxima);

    if (!(esPosteriorACitacion && esMayorOIgualQueActual)) {
      this.modalDialogService.warning(
        'Advertencia',
        'La fecha y hora ingresadas deben ser posteriores a la fecha de citación y no menores a la fecha actual',
        'Aceptar'
      );
      this.formRegistro.get('fechaHoraReunion')!.setValue('');
    }
  }

  protected activarGuardarTramite(): void {

    if (this.seHanGuardadosDatos) {
      if (this.validarCambiosForm() || this.validarCambiosSujetos()) {
        this.formularioEditado(true);
        this.habilitarGuardar(true)
      }
    }
    else if (this.formRegistro.valid && this.sujetosProcesalesSeleccionadosIds.length > 0) {
      this.formularioEditado(true);
      this.habilitarGuardar(true)
    }
    else {
      this.formularioEditado(true)
      this.habilitarGuardar(false)
    }
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor
  }

  protected habilitarFirmar(valor: boolean) {
    this.tramiteService.habilitarFirmar = valor
  }

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }
  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }
  protected get idTramite(): string {
    return this.tramiteSeleccionado?.idTramite!
  }

  protected counterReportChar(): number {
    return this.formRegistro.get('observaciones')!.value !== null
      ? this.formRegistro.get('observaciones')!.value.length
      : 0;
  }
  protected icono(name: string): string {
    return icono(name);
  }

  protected get tramiteEstadoFirmado(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO
  }
}
