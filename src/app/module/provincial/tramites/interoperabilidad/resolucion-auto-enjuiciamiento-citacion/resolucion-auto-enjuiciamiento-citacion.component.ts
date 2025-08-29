import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { capitalizedFirstWord, valid } from '@core/utils/string';
import { CmpLibModule } from 'dist/cmp-lib';
import { ESTADO_REGISTRO, icono, IconUtil, RESPUESTA_MODAL, ValidationModule } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { CalendarModule } from 'primeng/calendar';
import { map, Observable, of, Subscription } from 'rxjs';
import dayjs from 'dayjs';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { MaestroService } from '@core/services/shared/maestro.service';
import { SujetoProcesalService } from '@core/services/provincial/sujeto-procesal/sujeto-procesal.service';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ContadorFooterTextareaComponent } from '@core/components/reutilizable/contador-footer-textarea/contador-footer-textarea.component';
import { EnjuiciamientoCitacionService } from '@core/services/provincial/tramites/comun/juzgamiento/enjuiciamiento-citacion/auto-citacion-juicio.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { convertStringToDate } from '@core/utils/date';
import { GestionArchivosComponent } from './gestion-audios/gestion-archivos.component';
import { RegistroResolucionIncoacionService } from '@core/services/provincial/tramites/especiales/incoacion/registro-resolucion-incoacion.service';

@Component({
  selector: 'app-resolucion-auto-enjuiciamiento-citacion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MensajeInteroperabilidadPjComponent,
    CalendarModule,
    FormsModule,
    CmpLibModule,
    DateMaskModule,
    ValidationModule,
    MensajeCompletarInformacionComponent,
    CheckboxModule,
    DropdownModule,
    TabViewModule,
    InputTextModule,
    InputTextareaModule,
    TableModule,
    ContadorFooterTextareaComponent
  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './resolucion-auto-enjuiciamiento-citacion.component.html',
  styleUrl: './resolucion-auto-enjuiciamiento-citacion.component.scss'
})
export class ResolucionAutoEnjuiciamientoCitacionComponent {

  protected idCaso!: string

  protected idActoTramiteCaso!: string

  private idEstadoTramite!: number

  protected formRegistro: FormGroup

  public idEtapa!: string

  protected tramiteSeleccionado: TramiteProcesal | null = null

  private readonly subscriptions: Subscription[] = []

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly enjuiciamientoCitacionService = inject(EnjuiciamientoCitacionService);

  private readonly maestrosService = inject(MaestroService)

  private readonly fb = inject(FormBuilder)

  private readonly tramiteService = inject(TramiteService)

  private readonly sujetoProcesalService = inject(SujetoProcesalService)

  private readonly dialogService = inject(DialogService)

  private readonly gestionCasoService = inject(GestionCasoService)

  private readonly registroResolucionIncoacionService = inject(RegistroResolucionIncoacionService)

  protected iconUtil = inject(IconUtil)

  protected fechaActual: Date | null = null

  protected fechaHecho: Date | null = null

  protected listasujetosProcesale$: Observable<any> | null = null

  protected listadelito$: Observable<any> | null = null

  protected listaTipoResultado$: Observable<any> | null = null

  protected listaSujetosSeleccionados: any[] = []

  protected observacionesMaxLength: number = 3000

  protected sujetoSeleccionado = {}

  protected mediosProbatoriosRegistrados: boolean = false

  constructor(
  ) {
    this.formRegistro = this.fb.group({
      fechaNotificacion: ['', [Validators.required]],
      sujetoProcesal: ['', [Validators.required]],
      conAudio: [false],
      conVideo: [false],
      sujetoProcesalDescripcion: [{ value: '', disabled: true }, [Validators.required]],
      delito: ['', [Validators.required]],
      resultado: ['', [Validators.required]],
      observacionesResultado: ['', [Validators.maxLength(this.observacionesMaxLength)]],
      observaciones: ['', [Validators.maxLength(this.observacionesMaxLength)]],
    });
  }
  ngOnInit(): void {
    if (!this.tramiteNoDespachadoMesa) {
      this.fechaActual = dayjs().startOf('day').toDate()
      this.fechaHecho = dayjs(this.gestionCasoService.casoActual.fechaHecho, 'DD/MM/YYYY')
        .subtract(1, 'day')
        .toDate()
      this.listasujetosProcesale$ = this.enjuiciamientoCitacionService.obtenerListaSujetosProcesales(this.idCaso)
        .pipe(map(r => r.data))

      this.listaTipoResultado$ = this.maestrosService.getCatalogo('ID_N_TIPO_REQUERIMIENTO')
        .pipe(map(r => r.data))

      this.obtenerDatosGuardadosTramite();

      if (this.tramiteModoLectura) {
        this.formRegistro.disable()
      }

      this.obtenerValidacionMediosProbatorios()
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected obtenerDatosGuardadosTramite() {
    this.subscriptions.push(
      this.enjuiciamientoCitacionService.obtenerEnjuiciamientoCitacion(this.idActoTramiteCaso).subscribe(
        {
          next: (resp) => {
            if (resp.fecha) {
              this.listaSujetosSeleccionados = resp.sujetoCitacionLista;
              this.formRegistro.get('fechaNotificacion')?.setValue(convertStringToDate(resp.fecha));
              this.formRegistro.get('conAudio')?.setValue(resp.audio);
              this.formRegistro.get('conVideo')?.setValue(resp.video);
              this.formRegistro.get('observaciones')?.setValue(resp.observacion);
            }
          },
          error: () => {
            this.modalDialogService.error("Error", `Se ha producido un error al intentar obtener la información del trámite`, 'Aceptar')
          }
        }
      )
    )


  }

  protected seleccionarSujetoProcesal($event: DropdownChangeEvent) {
    this.formRegistro.get('sujetoProcesalDescripcion')?.setValue($event.value.nombre)

    this.formRegistro.get('delito',)?.enable()

    this.formRegistro.get('resultado')?.enable()

    this.listadelito$ = this.sujetoProcesalService.obtenerDelitosPorSujeto($event.value.idSujetoCaso)

    this.listadelito$?.subscribe((delitos: any[]) => {
      const delitosFiltrados = delitos.filter((delito) => {
        const exists = this.listaSujetosSeleccionados.some(
          (item: any) =>
            item.sujetoProcesal?.idSujetoCaso === $event.value.idSujetoCaso &&
            item.delito?.id === delito?.id
        );
        return !exists;
      });
      this.listadelito$ = of(delitosFiltrados);
    });

    this.sujetoSeleccionado = { ... this.sujetoSeleccionado, sujetoProcesal: $event.value };
  }


  protected seleccionarDelito($event: DropdownChangeEvent) {
    this.sujetoSeleccionado = { ... this.sujetoSeleccionado, delito: $event.value };
  }
  protected seleccionarResultado($event: DropdownChangeEvent) {
    this.sujetoSeleccionado = { ... this.sujetoSeleccionado, requerimiento: $event.value };
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

  protected agregarSujetoProcesal(): void {
    const datos = this.formRegistro.getRawValue()
    const existe = this.listaSujetosSeleccionados.find((item: any) => item.sujetoProcesal.idSujetoCaso == datos.sujetoProcesal.idSujetoCaso && item.delito.id == datos.delito.id);
    if (existe) {
      this.modalDialogService.info(
        '',
        'El registro ya existe',
        'Cerrar'
      );
      return;
    }
    const sujetoSeleccionado = {
      ...this.sujetoSeleccionado,
      observacionResultado: this.formRegistro.value.observacionesResultado
    } as any;

    this.listaSujetosSeleccionados.push(sujetoSeleccionado)
    this.resetearAgregarSujeto()
  }

  protected resetearAgregarSujeto() {
    const campos = [
      'sujetoProcesal',
      'sujetoProcesalDescripcion',
      'delito',
      'resultado',
      'observacionesResultado'
    ];

    campos.forEach(campo => {
      const control = this.formRegistro.get(campo);
      if (control) {
        control.setValue('');
        control.markAsPristine();
        control.markAsUntouched();
        control.updateValueAndValidity();
      }
    });
    this.sujetoSeleccionado = {}
    this.listadelito$ = null
  }

  protected eliminarSujeto(i: any) {
    const dialog = this.modalDialogService.question(
      '',
      `A continuación, se procederá a <strong>eliminar</strong> el registro, de la grilla <strong>Sujetos procesales con resultado</strong> ¿Está seguro de realizar la siguiente acción?`,
      'Aceptar',
      'Cancelar'
    );

    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.listaSujetosSeleccionados.splice(i, 1)
          this.resetearAgregarSujeto()
          this.modalDialogService.success(
            '',
            'Se eliminó correctamente',
            'Cerrar'
          );
        }
      }
    });
  }

  protected guardarTramite(): void {
    const dialog = this.modalDialogService.question(
      '',
      `A continuación, se procederá a crear el trámite de <b>${this.nombreTramite()}.</b>. ¿Está seguro de realizar la siguiente acción`,
      'Aceptar',
      'Cancelar'
    )
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          const datos = this.formRegistro.getRawValue()
          const request = {
            sujetoCitacionLista: [...this.listaSujetosSeleccionados],
            fecha: datos.fechaNotificacion,
            audio: datos.conAudio,
            video: datos.conVideo,
            observacion: datos.observaciones,
            idCaso: this.idCaso,
            idActoTramiteCaso: this.idActoTramiteCaso
          }

          this.subscriptions.push(
            this.enjuiciamientoCitacionService.registrarEnjuiciamientoCitacion(request).subscribe({
              next: () => {
                this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
                this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO
                this.formRegistro.disable();
                this.modalDialogService.success('REGISTRO CORRECTO', `Se registró correctamente la información de la ${this.nombreTramite()}`, 'Aceptar');
              },
              error: () => {
                this.modalDialogService.error("Error", `Se ha producido un error al intentar guardar la información del trámite`, 'Aceptar')
              }
            })

          )

        }
      }
    })
  }
  protected agregarMediosProbatorios() {
    const ref = this.dialogService.open(GestionArchivosComponent, {
      showHeader: false,
      width: '55%',
      contentStyle: { padding: '0' },
      data: {
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        modoLectura: this.tramiteModoLectura
      },
    });

    ref.onClose.subscribe(() => {
      this.obtenerValidacionMediosProbatorios()
    });
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
  protected get idTramite(): string {
    return this.tramiteSeleccionado?.idTramite!
  }
  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }
  protected get multimediaSeleccionado(): boolean {
    return ['conAudio', 'conVideo'].some(
      campo => this.formRegistro.get(campo)?.value
    );
  }
  protected validarObservacion(input: string): boolean {
    return valid(this.formRegistro.get(input)?.value)
  }

  protected get validarAgregarSujetoDelito(): boolean {
    const campos = [
      'sujetoProcesalDescripcion',
      'delito',
      'resultado',
      'observacionesResultado'
    ];

    return campos.some(campo => this.formRegistro.get(campo)?.invalid);
  }
  protected get tramiteModoLectura() {
    return this.tramiteEnModoVisor || this.tramiteEstadoRecibido;
  }
  protected get habilitarBotonGuardarTramite() {
    return this.formRegistro.get("fechaNotificacion")?.valid && this.listaSujetosSeleccionados.length > 0;
  }
  protected obtenerValidacionMediosProbatorios() {
    this.mediosProbatoriosRegistrados = false;
    this.subscriptions.push(
      this.registroResolucionIncoacionService
        .validarAudiosDeAudiencia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            if (resp.data !== null && resp.data === '1') {
              this.mediosProbatoriosRegistrados = true;
            }
          }
        })
    );
  }
}
