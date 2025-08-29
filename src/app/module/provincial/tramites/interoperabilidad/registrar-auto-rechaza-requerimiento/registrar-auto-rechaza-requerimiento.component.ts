import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import {
  ESTADO_REGISTRO,
  IconAsset,
  RESPUESTA_MODAL,
} from 'dist/ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subscription } from 'rxjs';
import { GuardarTramiteProcesalComponent } from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { DialogService } from 'primeng/dynamicdialog';
import { GenericResponse } from '@core/interfaces/comunes/GenericResponse';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { AutoRechazaRequerimiento } from '@core/interfaces/provincial/tramites/comun/preparatoria/auto-rechaza-requerimiento/auto-rechaza-requerimiento.interface';
import { ResolucionAutoRechazaRequerimientoService } from '@core/services/provincial/tramites/comun/preparatoria/resolucion-auto-rechaza-requerimiento.service';
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite';

@Component({
  selector: 'app-registrar-auto-rechaza-requerimiento',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    CmpLibModule,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
    CalendarModule,
    NgxCfngCoreModalDialogModule,
    InputTextareaModule,
  ],
  providers: [DialogService],
  templateUrl: './registrar-auto-rechaza-requerimiento.component.html',
  styleUrl: './registrar-auto-rechaza-requerimiento.component.scss'
})
export class RegistrarAutoRechazaRequerimientoComponent implements OnInit, OnDestroy
{
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
  private readonly autoRechazaRequerimientoService = inject(
    ResolucionAutoRechazaRequerimientoService
  );

  protected readonly iconAsset = inject(IconAsset);
  private readonly suscripciones: Subscription[] = [];
  protected longitudMaximaObservaciones: number = 200;

  protected formularioAutoRechaza: FormGroup = new FormGroup({
    idActoTramiteCaso: new FormControl(null, [Validators.required]),
    fechaNotificacion: new FormControl(null, [Validators.required]),
    observaciones: new FormControl(null, [Validators.maxLength(this.longitudMaximaObservaciones)])
  });

  ngOnInit(): void {
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
    return this.formularioAutoRechaza.get('observaciones')?.value?.length ?? 0;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.validacionTramite.idEstadoRegistro === ESTADO_REGISTRO.PENDIENTE_COMPLETAR;
  }

  get formularioValido(): boolean {
    return this.formularioAutoRechaza.valid;
  }

  private obtenerDetalleActoTramiteCaso() {
    this.formularioAutoRechaza.get('idActoTramiteCaso')?.setValue(this.idActoTramiteCaso);
    this.obtenerAutoRechazaRequerimiento();
  }

  private deshabilitarFormulario(): void {
    this.formularioAutoRechaza.disable();
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
          this.registrarAutoRechazaRequerimiento();
        }
      },
    });
  }

  private establecerValoresFormularioRecibido(data: AutoRechazaRequerimiento): void {
    this.formularioAutoRechaza.patchValue({
      idActoTramiteCaso: data.idActoTramiteCaso,
      fechaNotificacion: data.fechaNotificacion,
      observaciones: data.observaciones
    });
    !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
  }

  private obtenerAutoRechazaRequerimiento(): void {
    this.suscripciones.push(
      this.autoRechazaRequerimientoService
        .obtenerAutoRechazaRequerimiento(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: AutoRechazaRequerimiento) => {
            this.establecerValoresFormularioRecibido(resp);
          },
        })
    );
  }

  private registrarAutoRechazaRequerimiento(): void {
    this.suscripciones.push(
      this.autoRechazaRequerimientoService
        .registrarAutoRechazaRequerimiento(this.formularioAutoRechaza.value)
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
