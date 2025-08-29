import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { CmpLibModule } from 'dist/cmp-lib';
import { ESTADO_REGISTRO, icono, RESPUESTA_MODAL, ValidationModule } from 'dist/ngx-cfng-core-lib';
import { CalendarModule } from 'primeng/calendar';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { convertStringToDate } from '@core/utils/date';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { capitalizedFirstWord } from '@core/utils/string';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { DESARROLLO_JUICIO_ORAL } from '@core/types/efe/provincial/tramites/especial/desarrollo-juicio-oral';
import { RadioButtonModule } from 'primeng/radiobutton';
import { limpiarFormcontrol } from '@core/utils/utils';
import { urlValidator } from '@core/components/registrar-agenda-notificacion-reprogramar/utils/url-validator';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MaestroService } from '@core/services/shared/maestro.service';
import { ContadorFooterTextareaComponent } from '@core/components/reutilizable/contador-footer-textarea/contador-footer-textarea.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { EncabezadoModalComponent } from '@core/components/modals/encabezado-modal/encabezado-modal.component';
import { DialogModule } from 'primeng/dialog';
import { HechosCasoComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/hechos-caso/hechos-caso.component';
import { DelitosYPartesModalComponent } from '@core/components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { RegistroResolucionIncoacionService } from '@core/services/provincial/tramites/especiales/incoacion/registro-resolucion-incoacion.service';
import { GestionAudiosComponent } from '@core/components/modals/gestion-audios/gestion-audios.component';
import { RegistroDesarrolloJuicioOralService } from '@core/services/provincial/tramites/interoperabilidad/registro-desarrollo-juicio-oral.service';
import dayjs from 'dayjs';

@Component({
  selector: 'app-registrar-desarrollo-juicio-oral',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,
    FormsModule,
    CmpLibModule,
    DateMaskModule,
    ValidationModule,
    MensajeCompletarInformacionComponent,
    MensajeInteroperabilidadPjComponent,
    RadioButtonModule,
    InputTextModule,
    DropdownModule,
    ContadorFooterTextareaComponent,
    MultiSelectModule,
    EncabezadoModalComponent,
    DialogModule,
    HechosCasoComponent,
    ValidationModule
  ],
  templateUrl: './registrar-desarrollo-juicio-oral.component.html',
  styleUrl: './registrar-desarrollo-juicio-oral.component.scss'
})
export class RegistrarDesarrolloJuicioOralComponent {

  public idCaso!: string

  public numeroCaso!: string

  public idActoTramiteCaso!: string

  public idEtapa!: string

  public etapa!: string

  protected tramiteEnModoEdicion!: boolean

  private readonly subscriptions: Subscription[] = []

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly registroDesarrolloJuicioOralService = inject(RegistroDesarrolloJuicioOralService)

  protected registroResolucionIncoacionService = inject(RegistroResolucionIncoacionService)

  private readonly maestroService = inject(MaestroService)

  private readonly fb = inject(FormBuilder)

  private readonly dialogService = inject(DialogService)

  private readonly gestionCasoService = inject(GestionCasoService)

  private readonly tramiteService = inject(TramiteService)

  private idEstadoTramite!: number

  protected formRegistro: any

  protected DESARROLLO_JUICIO_ORAL = DESARROLLO_JUICIO_ORAL

  public tramiteSeleccionado: TramiteProcesal | null = null

  protected listaDistritoJudicial: any = []

  protected listaJuzgado: any = []

  protected listaActuaciones: any = [];

  protected longitudMaximaObservaciones: number = 200

  protected mostrarModalHechosCasos: boolean = false

  protected mostrarModalDelitosyPartes: boolean = false

  protected audiosAudienciaCorrectos: boolean = false

  protected ocultarBotonGestionVideos: boolean = true

  protected fechaActual: Date | null = null

  protected fechaMinfinSesion: Date | null = null;

  ngOnInit(): void {
    if (!this.tramiteNoDespachadoMesa) {
      this.fechaActual = dayjs().startOf('day').toDate()
      this.inicializarFormulario()
      this.listarDistritoJudicial()
      this.listarActuaciones()
      this.obtenerDatosGuardadosTramite()
      if (this.tramiteEstadoRecibido) {
        this.formRegistro.disable()
      }
    }

  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  protected obtenerDatosGuardadosTramite(): void {
    this.subscriptions.push(
      this.registroDesarrolloJuicioOralService
        .obtenerDatosTramite(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: any) => {
            if (resp) {
              this.formRegistro.get('distritoJudicial')?.setValue(resp.distrito ?? '')
              this.listarJuzgados(resp.distrito, resp.juzgado)
              this.formRegistro.get('observaciones')?.setValue(resp.observacion ?? '')
              this.formRegistro.get('tipoCitacion')?.setValue(resp.idTipoActividadAgenda ?? '')
              this.cambiarTipoCitacion({ value: resp.idTipoActividadAgenda })
              this.formRegistro.get('urlReunion')?.setValue(resp.urlReunion ?? '')
              this.formRegistro.get('actuaciones')?.setValue(resp.actuaciones as string[])
              const fechaInicio = dayjs(resp.fechaInicio).startOf('day');
              if (fechaInicio.isBefore(dayjs().startOf('day'))) {
                this.fechaActual = fechaInicio.toDate();
              }
              setTimeout(() => {
                this.formRegistro.get('fechaInicio')?.setValue(convertStringToDate(resp.fechaInicio))
                this.cambiarFechaInicio()
                this.formRegistro.get('fechaFin')?.setValue(convertStringToDate(resp.fechaFin))
              }, 100)
            }
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              'Se ha producido un error al obtener los datos guardados del trámite',
              'Aceptar'
            );
          }
        })
    );

  }

  protected listarDistritoJudicial(): void {
    this.maestroService.getDistritoJudicial().subscribe({
      next: (resp) => {
        if (resp && resp.code === 200) {
          this.listaDistritoJudicial = resp.data;
        }
      },
    });
  }
  protected listarActuaciones(): void {
    this.maestroService.listaActuaciones().subscribe({
      next: (resp) => {
        if (resp && resp.code === 200) {
          this.listaActuaciones = resp.data;
        }
      },
    });
  }
  protected listarJuzgados(idDistritoJudicial: number, idJuzgado: string | null = null) {
    this.formRegistro.get('juzgado')?.setValue('');
    this.maestroService
      .getJuzgadosPorDistritoJudicial(idDistritoJudicial)
      .subscribe({
        next: (resp) => {
          this.listaJuzgado = resp.data
          if (idJuzgado) {
            this.formRegistro.get('juzgado')?.setValue(idJuzgado)
          }
        },
        error: () => { },
      });
  }

  protected cambiarTipoCitacion(event: any): void {
    const citacion = event.value;
    limpiarFormcontrol(this.formRegistro.get('urlReunion'), []);
    if (citacion === DESARROLLO_JUICIO_ORAL.CITACION_PRESENCIAL) {
      this.formRegistro.get('urlReunion')?.setValue('')
    }
    else {
      limpiarFormcontrol(this.formRegistro.get('urlReunion'), [Validators.required, Validators.maxLength(100), urlValidator()]);
    }
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
  protected guardarTramite(): void {
    if (this.formRegistro.invalid) {
      this.formRegistro.markAllAsTouched();
      return;
    }
    let mensaje: string = `¿Está seguro de registrar el trámite de <b>${this.nombreTramite().toLowerCase()}</b>.?`;
    let saltarEtapa: boolean = false;
    if (this.esActuacion(DESARROLLO_JUICIO_ORAL.ALEGATOS_CLAUSURA)) {
      mensaje = `La sesión incluye el actuado de <b>ALEGATOS DE CLAUSURA</b>, esta confirmación concluye la sub etapa <b>2 DESARROLLO DE JUICIO ORAL</b> e inicia la sub etapa <b>3 SENTENCIA</b>.<br> ¿Está seguro de registrar el trámite de <b>${this.nombreTramite().toLowerCase()}</b>?`;
      saltarEtapa = true;
    }
    const dialog = this.modalDialogService.question(
      'Confirmar',
      `${mensaje}`,
      'Aceptar',
      'Cancelar'
    )
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.guardarRegistroDesarrolloJuicioOral(saltarEtapa)
        }
      }
    })
  }
  protected guardarRegistroDesarrolloJuicioOral(saltarEtapa: boolean): void {
    const datos = this.formRegistro.getRawValue()
    const request = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      idCaso: this.idCaso,
      fechaInicio: datos.fechaInicio,
      fechaFin: datos.fechaFin,
      idTipoActividadAgenda: datos.tipoCitacion,
      urlReunion: datos.urlReunion,
      distrito: datos.distritoJudicial,
      juzgado: datos.juzgado,
      observacion: datos.observaciones,
      actuaciones: datos.actuaciones,
      saltarEtapa: saltarEtapa
    };
    this.subscriptions.push(
      this.registroDesarrolloJuicioOralService.registrarEditarTramite(
        request
      ).subscribe({
        next: () => {
          this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO
          this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
          this.formRegistro.disable()
          this.modalDialogService.success('', `Se registró correctamente el trámite <b>"${this.nombreTramite()}</b>".`, 'Aceptar')
        },
        error: () => {
          this.modalDialogService.error(
            'Error',
            'Se ha producido un error al guardar los los datos del trámite',
            'Aceptar'
          );
        }
      })
    )
  }
  protected cambiarFechaInicio(): void {
    const fecha = dayjs(this.formRegistro.get('fechaInicio')?.value)
      .add(1, 'minute')
      .second(0);
    if (fecha) {
      this.fechaMinfinSesion = dayjs(fecha).second(0).toDate()
      this.formRegistro.get('fechaFin')!.setValue('');
    }
  }
  protected validarFechaFinSesion(): void {
    const fechaIni = dayjs(this.formRegistro.get('fechaInicio')?.value).second(0)
    const fechaFin = dayjs(this.formRegistro.get('fechaFin')?.value).second(0)
    const esPosteriorAFechaInicio = fechaIni.isAfter(fechaFin);
    console.log(esPosteriorAFechaInicio)
    if (esPosteriorAFechaInicio) {
      this.modalDialogService.warning(
        'Advertencia',
        'La fecha y hora ingresadas deben ser posteriores a la fecha de citación y no menores a la fecha actual',
        'Aceptar'
      );
      this.formRegistro.get('fechaFin')!.setValue('');
    }
  }
  protected mostrarBotonesDelitosHechos(): boolean {
    const valores = this.formRegistro.get('actuaciones')?.value ?? [];
    return [
      DESARROLLO_JUICIO_ORAL.ACUSACION_COMPLEMENTARIA,
      DESARROLLO_JUICIO_ORAL.DESVINCULACION_JURIDICA
    ].some(actuacion => valores.includes(actuacion));
  }

  protected esActuacion(tipo: string): boolean {
    const valores = this.formRegistro.get('actuaciones')?.value ?? [];
    return valores.includes(tipo);
  }
  protected abrirModalHechosCaso(): void {
    this.mostrarModalHechosCasos = true
  }

  protected cerrarModalHechosCaso = () => {
    this.mostrarModalHechosCasos = false
  }

  protected abrirModalDelitosyPartes(): void {
    this.dialogService.open(DelitosYPartesModalComponent, {
      showHeader: false,
      data: {
        numeroCaso: this.numeroCaso
      }
    });
  }

  protected abrirModalVideosAudiencia(): void {
    const ref = this.dialogService.open(GestionAudiosComponent, {
      showHeader: false,
      width: '80%',
      contentStyle: { padding: '0' },
      data: {
        idCaso: this.idCaso,
        tituloModal: 'Audios de la audiencia',
        idActoTramiteCaso: this.idActoTramiteCaso,
        modoLectura: this.tramiteEstadoRecibido
      },
    });

    ref.onClose.subscribe(() => {
      this.obtenerValidacionAudiosAudiencia();
    });
  }
  protected obtenerValidacionAudiosAudiencia() {
    this.audiosAudienciaCorrectos = false;
    this.subscriptions.push(
      this.registroResolucionIncoacionService
        .validarAudiosDeAudiencia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            if (resp.data !== null && resp.data === '1') {
              this.audiosAudienciaCorrectos = true;
            }
          }
        })
    );
  }

  private inicializarFormulario(): void {
    this.formRegistro = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      tipoCitacion: ['', [Validators.required]],
      distritoJudicial: ['', [Validators.required]],
      juzgado: ['', [Validators.required]],
      actuaciones: [[], Validators.required],
      urlReunion: ['', [Validators.maxLength(100)]],
      observaciones: ['', [Validators.maxLength(this.longitudMaximaObservaciones)]],
    })
  }

  protected icono(name: string): string {
    return icono(name);
  }

  protected get tramiteNoDespachadoMesa(): boolean {
    return !this.tieneActoTramiteCasoDocumento && !this.tramiteEstadoRecibido
  }

  protected get tieneActoTramiteCasoDocumento(): boolean {
    return !(this.idActoTramiteCaso == null || this.idActoTramiteCaso == '')
  }

  protected get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
  }

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }

}
