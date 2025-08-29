import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { capitalizedFirstWord } from '@core/utils/string';
import { CmpLibModule } from 'dist/cmp-lib';
import { ESTADO_REGISTRO, icono, RESPUESTA_MODAL, ValidationModule } from 'dist/ngx-cfng-core-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { CalendarModule } from 'primeng/calendar';
import { Subscription } from 'rxjs';
import dayjs from 'dayjs';
import { DialogService } from 'primeng/dynamicdialog';
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { DeclaraConsentidoRequerimiento } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/declara-consentido-requerimiento';
import { AutoResuelveRequest } from '@core/interfaces/comunes/AutoResuelveRequerimientoRequest';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { convertStringToDate } from '@core/utils/date';

@Component({
  selector: 'app-resolucion-auto-declara-consentido-proceso',
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
    MensajeCompletarInformacionComponent
  ],
  providers: [NgxCfngCoreModalDialogService, DatePipe],
  templateUrl: './resolucion-auto-declara-consentido-proceso.component.html',
  styleUrl: './resolucion-auto-declara-consentido-proceso.component.scss',
})
export class ResolucionAutoDeclaraConsentidoProcesoComponent {

  private readonly subscriptions: Subscription[] = []

  private readonly tramiteService = inject(TramiteService)

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly dialogService = inject(DialogService)

  protected readonly resolucionAutoService = inject(DeclaraConsentidoRequerimiento)

  protected readonly gestionCasoService = inject(GestionCasoService)

  private readonly fb = inject(FormBuilder)

  protected readonly datePipe = inject(DatePipe);

  protected formRegistro: FormGroup

  protected idCaso!: string

  protected idEtapa!: string

  protected tramiteSeleccionado: TramiteProcesal | null = null

  protected idEstadoTramite!: number

  protected tramiteEnModoEdicion!: boolean

  protected idActoTramiteCaso!: string

  protected fechaActual: Date | null = null

  protected flagGuardar: boolean = true

  constructor(
  ) {
    this.formRegistro = this.fb.group({
      fechaNotificacion: ['', [Validators.required]],
      observaciones: ['', [Validators.maxLength(200)]],
    })
  }
  ngOnInit(): void {
    this.fechaActual = dayjs().startOf('day').toDate();
    this.obtenerDatosGuardadosTramite();
    if (this.tramiteEnModoVisor || this.tramiteEstadoRecibido) {
      this.formRegistro.disable()
      this.flagGuardar = false
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
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
  protected obtenerDatosGuardadosTramite(): void {
    this.subscriptions.push(
      this.resolucionAutoService
        .obtenerAutoRequerimiento(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.formRegistro.get('fechaNotificacion')?.setValue(convertStringToDate(resp.fechaNotificacion))
            this.formRegistro.get('observaciones')?.setValue(resp.observacion ?? '')
          },
          error: () => {
            this.modalDialogService.error("Error", `Se ha producido un error al intentar obtener la información del trámite`, 'Aceptar')
          }
        })
    );
  }
  protected guardarTramite() {
    let datosForm = this.formRegistro.getRawValue();
    let request: AutoResuelveRequest = {
      operacion: 0,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: this.datePipe.transform(datosForm.fechaNotificacion, 'dd/MM/yyyy')!,
      observacion: datosForm.observaciones,
      listSujetos: []
    }
     this.subscriptions.push(
      this.resolucionAutoService.registrarTramite(request).subscribe({
        next: resp => {
          this.formRegistro.disable()
          this.flagGuardar = false
          this.modalDialogService.success(
            'Datos guardado correctamente',
            'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
            'Aceptar'
          );
          this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
        },
        error: () => {
          this.modalDialogService.error(
            'Se ha producido un error al intentar guardar la información del trámite',
            'Aceptar'
          );
        }
      })
    );
  }

  protected icono(name: string): string {
    return icono(name);
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
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
    return this.tramiteService.tramiteEnModoVisor

  }
}
