import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {DatePipe, NgClass} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {TramiteProcesal} from '@interfaces/comunes/tramiteProcesal';
import {
  MensajeCompletarInformacionComponent
} from '@components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import {
  MensajeInteroperabilidadPjComponent
} from '@components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import {ESTADO_REGISTRO, IconAsset, IconUtil, RESPUESTA_MODAL,} from 'ngx-cfng-core-lib';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {CalendarModule} from 'primeng/calendar';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {RadioButtonModule} from 'primeng/radiobutton';
import {Subscription} from 'rxjs';
import {
  GuardarTramiteProcesalComponent
} from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import {DialogService, DynamicDialogConfig} from 'primeng/dynamicdialog';
import {GenericResponse} from '@interfaces/comunes/GenericResponse';
import {GestionCasoService} from '@services/shared/gestion-caso.service';
import {CheckboxModule} from "primeng/checkbox";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {MaestroService} from "@services/shared/maestro.service";
import {tourService} from '@utils/tour';
import {PronunciamientoTramiteService} from "@services/superior/casos-elevados/pronunciamiento-tramite.service";
import {
  AutoResuelveCalificacionApelacionService
} from "@services/provincial/cuadernos-incidentales/auto-resuelve-calificacion-apelacion/auto-resuelve-calificacion-apelacion.service";
import {ExpedienteMaskModule} from '@directives/expediente-mask.module';
import {
  ResolucionAutoResuelveCalificacionSentenciaService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-calificacion-sentencia.service";
import {
  RegistrarAutoResuelveCalificacionSentenciaModalComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-resuelve-calificacion-sentencia/registrar-auto-resuelve-calificacion-sentencia-modal/registrar-auto-resuelve-calificacion-sentencia-modal.component";
import {AutoResuelveCalificacionSentenciaRequest} from "@interfaces/comunes/AutoResuelveCalificacionSentenciaRequest";
import {ID_N_RSP_APELACION} from "@core/types/efe/provincial/tramites/especial/respuesta-apelacion.type";
import {AlertaModalComponent} from "@components/modals/alerta-modal/alerta-modal.component";
import {AlertaData} from "@interfaces/comunes/alert";
import {ConsultaCasosSharedService} from "@services/provincial/consulta-casos/consulta-casos-shared.service";
import {
  RegistrarAutoConcedeApelacionSentenciaPorQuejaModalComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-concede-apelacion-sentencia-por-queja/modal-sujetos/registrar-concede-apelacion-sentencia-por-queja-modal.component";
import {
  ResolucionAutoConcedeApelacionSentenciaPorQuejaService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/concede-apelacion-sentencia-por-queja.service";
import {
  ResolucionAutoCorreTrasladoApelacionSentenciaService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/corre-traslado-apelacion-sentencia.service";

@Component({
  standalone: true,
  selector: 'app-registrar-corre-traslado-apelacion-sentencia',
  templateUrl: './registrar-corre-traslado-apelacion-sentencia.component.html',
  styleUrls: ['./registrar-corre-traslado-apelacion-sentencia.component.scss'],
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
    CheckboxModule,
    InputTextModule,
    DropdownModule,
    ExpedienteMaskModule,

  ],
  providers: [DatePipe]
})

export class RegistrarCorreTrasladoApelacionSentenciaComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() numeroCaso: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso: string = '';
  @Input() tramiteEnModoEdicion: boolean = false;
  @Input() idEstadoTramite: number = 0;

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly dialogService = inject(DialogService);
  private readonly gestionCasoService = inject(GestionCasoService);
  private readonly resolucionAutoCorreTrasladoApelacionSentenciaService = inject(ResolucionAutoCorreTrasladoApelacionSentenciaService);
  protected readonly maestroService = inject(MaestroService);
  protected readonly iconUtil = inject(IconUtil);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly iconAsset = inject(IconAsset);
  private readonly suscripciones: Subscription[] = [];
  protected longitudMaximaObservaciones: number = 200;
  protected distritoJudicialList = [];
  protected juzgadosList = [];
  protected nuPestana: string = '';

  protected formularioAutoResuelve: FormGroup = new FormGroup({
    idActoTramiteCaso: new FormControl(null, [Validators.required]),
    fechaNotificacion: new FormControl(null, [Validators.required]),
    nroExpediente: new FormControl(null, [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(27),
      Validators.pattern(/^\d{5}-\d{4}-\d-\d{4}-[A-Z]{2}-[A-Z]{2}-\d{2}$/)
    ]),
    codFiscaliaSuperior: new FormControl(null),
    observaciones: new FormControl(null, [Validators.maxLength(this.longitudMaximaObservaciones)])
  });

  public tramiteGuardado: boolean = false; // Controla si el guardado fue exitoso
  protected esSoloLectura: boolean = false; // Controla si el guardado fue exitoso

  ngOnInit(): void {
    this.formularioAutoResuelve = this.formBuilder.group({
      fechaNotificacion: [null, Validators.required],
      nroExpediente: new FormControl(null, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(27),
        Validators.pattern(/^[0-9]{5}-[0-9]{4}-[0-9]-[0-9]{4}-[A-Z]{2}-[A-Z]{2}-[0-9]{2}$/)
      ]),
      codFiscaliaSuperior: [null],
      observaciones: ['', [Validators.maxLength(200)]],
    });
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
    return this.formularioAutoResuelve.get('observaciones')?.value?.length ?? 0;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion;
  }

  get formularioValido(): boolean {
    return !!this.formularioAutoResuelve.get('fechaNotificacion')?.valid &&
      !!this.formularioAutoResuelve.get('nroExpediente')?.valid;
  }

  private obtenerDetalleActoTramiteCaso() {
    this.formularioAutoResuelve.get('idActoTramiteCaso')?.setValue(this.idActoTramiteCaso);
    this.obtenerDatosResolucion();
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
          this.eventoRegistrarResolucion();
        }
      },
    });
  }

  private obtenerDatosResolucion() {
    this.suscripciones.push(
      this.resolucionAutoCorreTrasladoApelacionSentenciaService
        .obtenerTramite(this.idActoTramiteCaso)
        .subscribe({
          next: (data) => {
            this.formularioAutoResuelve.patchValue({
              idActoTramiteCaso: data.idActoTramiteCaso,
              fechaNotificacion: data.fechaNotificacion ? data.fechaNotificacion : null,
              nroExpediente: data.nroExpediente,
              observaciones: data.observaciones
            });
            !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  private eventoRegistrarResolucion(): void {
    let datosForm = this.formularioAutoResuelve.getRawValue();
    let request: any = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: datosForm.fechaNotificacion,
      nroExpediente: datosForm.nroExpediente,
      observaciones: datosForm.observaciones
    };

    this.suscripciones.push(
      this.resolucionAutoCorreTrasladoApelacionSentenciaService.registrarTramite(request).subscribe({
        next: (resp: GenericResponse) => {
          if (resp.code == 0) {
            this.deshabilitarFormulario();
            this.tramiteEnModoEdicion = false;
            this.esSoloLectura = true;
            this.tramiteGuardado = true;
            this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
            this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
            this.modalDialogService.success(
              'REGISTRO CORRECTO',
              `Se registró correctamente la información de la <strong>${this.tramiteSeleccionado?.nombreTramite}.</strong>`,
              'Aceptar'
            );
          }
        },
        error: (error) => {
          this.modalDialogService.error(
            'ERROR EN EL SERVICIO', error.error.message,'Aceptar'
          );
        }
      })
    );
  }

}
