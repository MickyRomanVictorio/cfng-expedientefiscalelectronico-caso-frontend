import { NgClass } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import { GenericResponse } from '@core/interfaces/comunes/GenericResponse';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { AutoRechazaRequerimiento } from '@core/interfaces/provincial/tramites/comun/preparatoria/auto-rechaza-requerimiento/auto-rechaza-requerimiento.interface';
import { ResolucionAutoDeclaraInadmisibleRequerimientoService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/declara-inadmisible-requerimiento.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { getDateFromString } from '@core/utils/utils';
import { CmpLibModule } from 'dist/cmp-lib';
import {
  ESTADO_REGISTRO,
  IconAsset,
  RESPUESTA_MODAL,
} from 'dist/ngx-cfng-core-lib';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import { CalendarModule } from 'primeng/calendar';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-registrar-auto-declara-inadmisible-requerimiento',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
    CalendarModule,
    NgxCfngCoreModalDialogModule,
    InputTextareaModule,
  ],
  providers: [DialogService],
  templateUrl:
    './registrar-auto-declara-inadmisible-requerimiento.component.html',
  styleUrl: './registrar-auto-declara-inadmisible-requerimiento.component.scss',
})
export class RegistrarAutoDeclaraInadmisibleRequerimientoComponent {
  @Input() idCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() numeroCaso: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso: string = '';
  @Input() tramiteEnModoEdicion: boolean = false;
  @Input() idEstadoTramite: number = 0;
  @Input() validacionTramite!: ValidacionTramite;

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly dialogService = inject(DialogService);
  private readonly gestionCasoService = inject(GestionCasoService);
  private readonly autoDeclaraInadmisibleRequerimientoService = inject(ResolucionAutoDeclaraInadmisibleRequerimientoService);

  protected readonly iconAsset = inject(IconAsset);
  private readonly suscripciones: Subscription[] = [];
  protected longitudMaximaObservaciones: number = 200;
  protected fechaActual: Date = new Date();
  protected fechaIngreso: Date | null = null;

  protected formularioAutoDeclaraInadmisible: FormGroup = new FormGroup({
    idActoTramiteCaso: new FormControl(null, [Validators.required]),
    fechaNotificacion: new FormControl(null, [Validators.required]),
    observaciones: new FormControl(null, [
      Validators.maxLength(this.longitudMaximaObservaciones),
    ]),
  });

  ngOnInit(): void {
    const fechaIngresoStr = this.gestionCasoService.expedienteActual.fechaIngreso;
    this.fechaIngreso = getDateFromString(fechaIngresoStr);
    this.tieneActoTramiteCasoDocumento && this.obtenerDetalleActoTramiteCaso();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  get tieneActoTramiteCasoDocumento(): boolean {
    return Boolean(this.idActoTramiteCaso);
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  get cantidadCaracteresObservacion(): number {
    return this.formularioAutoDeclaraInadmisible.get('observaciones')?.value?.length ?? 0;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.validacionTramite.idEstadoRegistro === ESTADO_REGISTRO.PENDIENTE_COMPLETAR;
  }

  get formularioValido(): boolean {
    return this.formularioAutoDeclaraInadmisible.valid;
  }

  private obtenerDetalleActoTramiteCaso() {
    this.formularioAutoDeclaraInadmisible.get('idActoTramiteCaso')?.setValue(this.idActoTramiteCaso);
    this.obtenerAutoRechazaRequerimiento();
  }

  private deshabilitarFormulario(): void {
    this.formularioAutoDeclaraInadmisible.disable();
  }

  protected modalActualizarActoYTramite(): void {
    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      showHeader: false,
      data: {
        tipo: 2,
        idCaso: this.idCaso,
        idEtapa: this.idEtapa,
        idActoTramiteCaso: this.idActoTramiteCaso,
      },
    });
    ref.onClose.subscribe((confirm) => {
      if (confirm === RESPUESTA_MODAL.OK) this.recargarPagina();
    });
  }

  private recargarPagina(): void {
    window.location.reload();
  }

  protected confirmarRegistroTramite(): void {
    const dialog = this.modalDialogService.question(
      '',
      `A continuación, se procederá a <strong>crear el trámite</strong> de <strong>${this.tramiteSeleccionado?.nombreTramite}</strong>. ¿Está seguro de realizar la siguiente acción?`,
      'Aceptar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.registrarAutoDeclaraInadmisibleRequerimiento();
        }
      },
    });
  }

  private establecerValoresFormularioRecibido(
    data: AutoRechazaRequerimiento
  ): void {
    this.formularioAutoDeclaraInadmisible.patchValue({
      idActoTramiteCaso: data.idActoTramiteCaso,
      fechaNotificacion: data.fechaNotificacion,
      observaciones: data.observaciones,
    });
    !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
  }

  private obtenerAutoRechazaRequerimiento(): void {
    this.suscripciones.push(
      this.autoDeclaraInadmisibleRequerimientoService
        .obtenerAutoDeclaraInadmisibleRequerimiento(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: AutoRechazaRequerimiento) => {
            this.establecerValoresFormularioRecibido(resp);
          },
        })
    );
  }

  private registrarAutoDeclaraInadmisibleRequerimiento(): void {
    this.suscripciones.push(
      this.autoDeclaraInadmisibleRequerimientoService
        .registrarAutoDeclaraInadmisibleRequerimiento(this.formularioAutoDeclaraInadmisible.value)
        .subscribe({
          next: (resp: GenericResponse) => {
            this.tramiteEnModoEdicion = false;
            this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
            this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
            this.deshabilitarFormulario();
            this.modalDialogService.success(
              'REGISTRO CORRECTO',
              `Se registró correctamente la información de la <strong>${this.tramiteSeleccionado?.nombreTramite}.</strong>`,
              'Aceptar'
            );
          },
        })
    );
  }
}
