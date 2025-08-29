import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {DatePipe, NgClass} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {TramiteProcesal} from '@core/interfaces/comunes/tramiteProcesal';
import {
  MensajeCompletarInformacionComponent
} from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import {
  MensajeInteroperabilidadPjComponent
} from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import {ESTADO_REGISTRO, IconAsset, RESPUESTA_MODAL,} from 'dist/ngx-cfng-core-lib';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {CalendarModule} from 'primeng/calendar';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {RadioButtonModule} from 'primeng/radiobutton';
import {Subscription} from 'rxjs';
import {
  GuardarTramiteProcesalComponent
} from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import {DialogService} from 'primeng/dynamicdialog';
import {GenericResponse} from '@core/interfaces/comunes/GenericResponse';
import {GestionCasoService} from '@core/services/shared/gestion-caso.service';
import {AutoResuelveRequest} from '@core/interfaces/comunes/AutoResuelveRequerimientoRequest';
import {
  ResolucionAutoResuelveRequerimientoService
} from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service';
import {
  RegistrarAutoResuelveRequerimientoModalComponent
} from '@modules/provincial/tramites/interoperabilidad/registrar-auto-resuelve-requerimiento/registrar-auto-resuelve-requerimiento-modal/registrar-auto-resuelve-requerimiento-modal.component';
import {TramiteService} from "@services/provincial/tramites/tramite.service";

@Component({
  standalone: true,
  selector: 'app-registrar-auto-resuelve-requerimiento',
  templateUrl: './registrar-auto-resuelve-requerimiento.component.html',
  styleUrls: ['./registrar-auto-resuelve-requerimiento.component.scss'],
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
  providers: [DatePipe]
})

export class RegistrarAutoResuelveRequerimientoComponent implements OnInit, OnDestroy {

  /**
   * Refactorizando código realizado por Ronald Melecio
   *  */

  @Input() idCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() numeroCaso: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso: string = '';
  @Input() tramiteEnModoEdicion: boolean = false;
  @Input() idEstadoTramite: number = 0;

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly dialogService = inject(DialogService);
  private readonly tramiteService = inject(TramiteService);
  private readonly gestionCasoService = inject(GestionCasoService);
  private readonly autoResuelveRequerimientoService = inject(
    ResolucionAutoResuelveRequerimientoService
  );
  private readonly datePipe = inject(DatePipe)
  protected selectedSujetos: any = [];

  protected readonly iconAsset = inject(IconAsset);
  private readonly suscripciones: Subscription[] = [];
  protected longitudMaximaObservaciones: number = 200;
  protected cantidadSujetosTramite: number = 0;

  protected formularioAutoResuelve: FormGroup = new FormGroup({
    idActoTramiteCaso: new FormControl(null, [Validators.required]),
    fechaNotificacion: new FormControl(null, [Validators.required]),
    observaciones: new FormControl(null, [Validators.maxLength(this.longitudMaximaObservaciones)])
  });

  private valoresIniciales: any;

  ngOnInit(): void {
    this.tieneActoTramiteCasoDocumento && this.obtenerDetalleActoTramiteCaso();

    this.tramiteService.habilitarGuardar = true;
    this.formularioAutoResuelve.valueChanges.subscribe(values =>
      this.tramiteService.formularioEditado = this.valoresIniciales ?
        JSON.stringify(this.valoresIniciales) !== JSON.stringify(values) : false
    );
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
    return this.formularioAutoResuelve.get('observaciones')?.value?.length ?? 0;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion;
  }

  get formularioValido(): boolean {
    return this.formularioAutoResuelve.valid && this.selectedSujetos && this.selectedSujetos.length > 0;
  }

  private obtenerDetalleActoTramiteCaso() {
    this.formularioAutoResuelve.get('idActoTramiteCaso')?.setValue(this.idActoTramiteCaso);
    this.obtenerAutoResuelveRequerimiento();
  }

  private deshabilitarFormulario(): void {
    this.formularioAutoResuelve.disable();
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
          this.registrarAutoResuelveRequerimiento();
        }
      },
    });
  }

  private establecerValoresFormularioRecibido(data: any): void {
    this.formularioAutoResuelve.patchValue({
      idActoTramiteCaso: data.idActoTramiteCaso,
      fechaNotificacion: data.fechaNotificacion,
      observaciones: data.observaciones
    });
    this.valoresIniciales = this.formularioAutoResuelve.getRawValue();
    this.tramiteService.formularioEditado = false;
    !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
  }

  private obtenerAutoResuelveRequerimiento(): void {
    this.suscripciones.push(
      this.autoResuelveRequerimientoService.obtenerTramite(this.idActoTramiteCaso)
      .subscribe({
        next: (resp) => {
          this.establecerValoresFormularioRecibido(resp);
          this.cantidadSujetosTramite = resp.cantidadSujetosTramite
        },
        error: () => {
          this.modalDialogService.error('Error', 'No se puede obtener los datos', 'Aceptar');
        },
      })
    );

  }

  private registrarAutoResuelveRequerimiento(): void {
    let datosForm = this.formularioAutoResuelve.getRawValue();
    let request: AutoResuelveRequest = {
      operacion: 0,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: datosForm.fechaNotificacion,
      observacion: datosForm.observaciones,
      listSujetos: this.selectedSujetos
    }

    this.suscripciones.push(
      this.autoResuelveRequerimientoService.registrarTramite(request).subscribe({
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
        error: (error) => {
          this.modalDialogService.error(
            'ERROR EN EL SERVICIO', error.error.message,'Aceptar'
          );
        }
      })
    );
  }

  public openModalSujetos(): void {
    const ref = this.dialogService.open(RegistrarAutoResuelveRequerimientoModalComponent, {
      showHeader: false,
      closeOnEscape: false,
      contentStyle: { padding: '0px', 'border-radius': '15px' },
      data: {
        numeroCuadernoCaso: this.numeroCaso,
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTramite: "",
        idEstadoTramite: this.idEstadoTramite,
        listSujetosProcesales: this.selectedSujetos,
        soloLectura: !this.tramiteEnModoEdicion
      },
    });

    ref.onClose.subscribe((data) => {
      this.selectedSujetos = data
      this.cantidadSujetosTramite = this.selectedSujetos.length ?? this.cantidadSujetosTramite;
      this.tramiteService.formularioEditado = true;
    });
  }

  /**
   * FALTA FUNCIONALIDAD POR FALTA DE LOS FLUJOS COMENTADOS LINEAS ABAJO
   * ●	Hipervínculo: "Ver detalle de la audiencia": Solo se mostrará si el cuaderno incidental tiene agenda de audiencias. Permite redireccionar al CUS.PRO.AGE.001 - Ver Agenda diaria.
    Este campo no debe mostrarse cuando se ha invocado a la presente funcionalidad desde el CUS.PRO.REU.014.6 - Registrar aplicación del principio de oportunidad en etapa Intermedia
   */

}
