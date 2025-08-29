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
import {ESTADO_REGISTRO, IconAsset, RESPUESTA_MODAL,} from 'ngx-cfng-core-lib';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {CalendarModule} from 'primeng/calendar';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {RadioButtonModule} from 'primeng/radiobutton';
import {Subscription} from 'rxjs';
import {
  GuardarTramiteProcesalComponent
} from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import {DialogService} from 'primeng/dynamicdialog';
import {GenericResponse} from '@interfaces/comunes/GenericResponse';
import {GestionCasoService} from '@services/shared/gestion-caso.service';
import {CheckboxModule} from "primeng/checkbox";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {ExpedienteMaskModule} from '@directives/expediente-mask.module';
import {
  PestanaApelacionService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/pestana-apelacion.service";
import {SujetosApelacionSentencia} from "@components/modals/sujetos-apelacion-sentencia/sujetos-apelacion-sentencia";

@Component({
  standalone: true,
  selector: 'app-registrar-auto-resuelve-calificacion-sentencia-superior',
  templateUrl: './registrar-auto-resuelve-calificacion-sentencia-superior.component.html',
  styleUrls: ['./registrar-auto-resuelve-calificacion-sentencia-superior.component.scss'],
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

export class RegistrarAutoResuelveCalificacionSentenciaSuperiorComponent implements OnInit, OnDestroy {
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
  private readonly pestanaApelacionService = inject(PestanaApelacionService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly suscripciones: Subscription[] = [];

  protected readonly iconAsset = inject(IconAsset);
  protected readonly longitudMaximaObservaciones: number = 200;
  protected nuPestana: string = '';
  protected tramiteGuardado: boolean = false;
  protected esSoloLectura: boolean = false;
  protected flCheckModal: boolean = false;

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
      this.flCheckModal;
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
      if (confirm === RESPUESTA_MODAL.OK) window.location.reload();
    });
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
      this.pestanaApelacionService
        .obtenerTramiteInteroperabilidad(this.idActoTramiteCaso)
        .subscribe({
          next: (data) => {
            this.formularioAutoResuelve.patchValue({
              idActoTramiteCaso: data.idActoTramiteCaso,
              fechaNotificacion: data.fechaNotificacion ? data.fechaNotificacion : null,
              nroExpediente: data.nroExpediente,
              observaciones: data.observaciones
            });
            !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
            this.flCheckModal = data.nuSujetosGuardado > 0;
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
      this.pestanaApelacionService.registrarTramiteInteroperabilidad(request).subscribe({
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

  public openModalSujetos(): void {
    let dataModal = {
      showHeader: false,
      data: {
        numeroCaso: this.numeroCaso,
        nuPestana: this.nuPestana,
        idActoTramiteCaso: this.idActoTramiteCaso,
        soloLectura: !this.tramiteEnModoEdicion,
        configuracion: {
          titulo: 'Seleccionar resultado de la calificación de la apelación de sentencia y dispone plazo para presentar medios probatorios',
          subtitulo: 'Seleccione los sujetos procesales a los que se le ha declarado admisible y/o inadmisible auto que resuelve la calificación de la apelación de sentencia y dispone plazo para presentar medios probatorios',
          mensaje_informativo: {
            mostrar: false,
            descripcion: null,
            campo_prerequisito: null,
            valor_prerequisito: 0
          },
          posicion_petitorio: 'bajo_texto',
          columnas: [
            {
              nombre_campo: 'idResultadoCalificacionApelacionSuperior',
              mostrar_campo: 'flResultadoCalificacionApelacionSuperior',
              mostrar: true,
              editar: true
            }
          ]
        }
      }
    };
    let ref = this.dialogService.open(SujetosApelacionSentencia, dataModal);
    ref.onClose.subscribe((data: any) => {
      if (data && data.flCheckModal) {
        this.flCheckModal = data.flCheckModal;
      }
    });
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

}
