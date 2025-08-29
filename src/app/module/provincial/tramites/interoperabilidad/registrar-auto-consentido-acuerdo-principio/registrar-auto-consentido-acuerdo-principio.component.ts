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
} from 'dist/ngx-cfng-core-modal/dialog';
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
import { AutoConsentidoAcuerdoPrincipio } from '@core/interfaces/provincial/tramites/comun/preparatoria/auto-consentido-acuerdo-principio/auto-consentido-acuerdo-principio.interface';
import { ResolucionAutoConsentidoAcuerdoPrincipioService } from '@core/services/provincial/tramites/comun/preparatoria/resolucion-auto-consentido-acuerdo-principio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrar-auto-consentido-acuerdo-principio',
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
  templateUrl: './registrar-auto-consentido-acuerdo-principio.component.html',
  styleUrl: './registrar-auto-consentido-acuerdo-principio.component.scss'
})
export class RegistrarAutoConsentidoAcuerdoPrincipioComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() numeroCaso: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso: string = '';
  @Input() tramiteEnModoEdicion: boolean = false;
  @Input() idEstadoTramite: number = 0;

  private readonly router = inject(Router);
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly dialogService = inject(DialogService);
  private readonly gestionCasoService = inject(GestionCasoService);
  private readonly autoConsentidoAcuerdoPrincipioService = inject(
    ResolucionAutoConsentidoAcuerdoPrincipioService
  );
  protected readonly iconAsset = inject(IconAsset);
  private readonly suscripciones: Subscription[] = [];
  protected longitudMaximaObservaciones: number = 200;

  protected formularioAutoReparatorio: FormGroup = new FormGroup({
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
    return this.formularioAutoReparatorio.get('observaciones')?.value?.length ?? 0;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion;
  }

  get formularioValido(): boolean {
    return this.formularioAutoReparatorio.valid;
  }

  private obtenerDetalleActoTramiteCaso() {
    this.formularioAutoReparatorio.get('idActoTramiteCaso')?.setValue(this.idActoTramiteCaso);
    this.obtenerAutoAcuerdoReparatorio();
  }

  private deshabilitarFormulario(): void {
    this.formularioAutoReparatorio.disable();
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
          this.registrarAutoAcuerdoReparatorio();
        }
      },
    });
  }

  private establecerValoresFormularioRecibido(data: AutoConsentidoAcuerdoPrincipio): void {
    this.formularioAutoReparatorio.patchValue({
      idActoTramiteCaso: data.idActoTramiteCaso,
      fechaNotificacion: data.fechaNotificacion,
      observaciones: data.observaciones
    });
    !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
  }

  private obtenerAutoAcuerdoReparatorio(): void {
    this.suscripciones.push(
      this.autoConsentidoAcuerdoPrincipioService
        .obtenerAutoConsentidoAcuerdoPrincipio(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: AutoConsentidoAcuerdoPrincipio) => {
            this.establecerValoresFormularioRecibido(resp);
          },
        })
    );
  }

  private registrarAutoAcuerdoReparatorio(): void {
    this.suscripciones.push(
      this.autoConsentidoAcuerdoPrincipioService
        .registrarAutoConsentidoAcuerdoPrincipio(this.formularioAutoReparatorio.value)
        .subscribe({
          next: (resp: GenericResponse) => {
            this.tramiteEnModoEdicion = false;
            this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
            this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
            this.deshabilitarFormulario();
            this.modalRegistroCompletado(resp);
          },
        })
    );
  }

  private modalRegistroCompletado(data : GenericResponse): void {
    const modal = this.modalDialogService.success(
      'REGISTRO CORRECTO',
      `Se registró correctamente la información de la <strong>${this.tramiteSeleccionado?.nombreTramite}.</strong>`,
      'Aceptar'
    );
    modal.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if ( data.code == 1 ) {
          const ruta = `app/administracion-casos/consultar-casos-fiscales/concluidos/caso/${this.idCaso}/acto-procesal`;
          this.router.navigate([`${ruta}`]);
        }
      },
    });
  }
}
