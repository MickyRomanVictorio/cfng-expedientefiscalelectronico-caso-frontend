import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {DatePipe, NgClass} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
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
import {ESTADO_REGISTRO, IconAsset, IconUtil, RESPUESTA_MODAL,} from 'dist/ngx-cfng-core-lib';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {CalendarModule} from 'primeng/calendar';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {RadioButtonModule} from 'primeng/radiobutton';
import {Subscription} from 'rxjs';
import {
  GuardarTramiteProcesalComponent
} from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import {DialogService, DynamicDialogConfig} from 'primeng/dynamicdialog';
import {GenericResponse} from '@core/interfaces/comunes/GenericResponse';
import {GestionCasoService} from '@core/services/shared/gestion-caso.service';
import {CheckboxModule} from "primeng/checkbox";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {MaestroService} from "@services/shared/maestro.service";
import {tourService} from '@utils/tour';
import {PronunciamientoTramiteService} from "@services/superior/casos-elevados/pronunciamiento-tramite.service";
import {
  AutoResuelveCalificacionApelacionService
} from "@services/provincial/cuadernos-incidentales/auto-resuelve-calificacion-apelacion/auto-resuelve-calificacion-apelacion.service";
import {ExpedienteMaskModule} from '@core/directives/expediente-mask.module';
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
import { id } from 'date-fns/locale';

@Component({
  standalone: true,
  selector: 'app-registrar-auto-resuelve-calificacion-sentencia',
  templateUrl: './registrar-auto-resuelve-calificacion-sentencia.component.html',
  styleUrls: ['./registrar-auto-resuelve-calificacion-sentencia.component.scss'],
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

export class RegistrarAutoResuelveCalificacionSentenciaComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() numeroCaso: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso: string = '';
  @Input() tramiteEnModoEdicion: boolean = false;
  @Input() idEstadoTramite: number = 0;
private idCasoPadre: string = '';

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly dialogService = inject(DialogService);
  private readonly gestionCasoService = inject(GestionCasoService);
  private readonly resolucionAutoResuelveCalificacionSentenciaService = inject(ResolucionAutoResuelveCalificacionSentenciaService);
  private readonly autoResuelveCalificacionApelacionService = inject(AutoResuelveCalificacionApelacionService);
  protected readonly maestroService = inject(MaestroService);
  protected readonly iconUtil = inject(IconUtil);
  private readonly formBuilder = inject(FormBuilder);
  private readonly consultaCasosSharedService = inject(ConsultaCasosSharedService);

  protected selectedSujetos: any = [];
  protected sujetosApelantes: any[] = [];
  protected mostrarFiscaliaSuperiorAElevar: boolean = false;

  protected readonly iconAsset = inject(IconAsset);
  private readonly suscripciones: Subscription[] = [];
  protected longitudMaximaObservaciones: number = 200;
  protected distritoJudicialList = [];
  protected juzgadosList = [];
  protected nuPestana: string = '';
  protected esTerminacionAnticipada: boolean = true;
  protected esApelacionProceso: boolean = true;
  protected flElevacionSuperior: boolean = false;
  protected fiscalias: any[] = [];
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
  public mostrarBotonElevar: boolean = false; // Controla si se muestra el botón de elevar
  public esPestanaElevada: boolean = false; // Controla si ya se elevó
  protected flCheckModal: boolean = false;
  private sujetosElevar: any = [];

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
    this.getFiscalSuperiorAElevar();
    this.agregarQuitarValidador();
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
    const fiscaliaValida = !this.flElevacionSuperior || !!this.formularioAutoResuelve.get('codFiscaliaSuperior')?.value;
    return !!this.formularioAutoResuelve.get('fechaNotificacion')?.valid &&
      !!this.formularioAutoResuelve.get('nroExpediente')?.valid &&
      this.flCheckModal &&
      fiscaliaValida;
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

  protected async eventoElevarIncidenteAFiscalSuperior() {
    await this.validarElevar();
    const nombreFiscalSuperior = this.fiscalias.find(
      (e) => e.id === this.formularioAutoResuelve.get('codFiscaliaSuperior')!.value
    )?.nombre;
    const nombreSujetosProcesales: string = this.generateListHTML();
    const descripcion = `Esta acción realiza la elevación del cuaderno incidental a la ${nombreFiscalSuperior} junto con una nueva pestaña de apelación que ha sido creada con el número de expediente: ${this.numeroCaso} en la sección de: "Apelaciones". Por favor, no olvide que al realizar esta acción, solo la nueva pestaña de apelación pasará a modo lectura y no podrá acceder a él hasta que le sea devuelto. Tener en cuenta que el/los sujeto(s) procesal(es) a quien(es) se le(s) concedió la apelación es/son: ${nombreSujetosProcesales}.
    \n<b>'¿Está seguro de realizar este trámite?'</b>`;
    const refModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `ELEVAR EL CUADERNO INCIDENTAL A FISCAL SUPERIOR`,
        description: descripcion,
        confirmButtonText: 'Aceptar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          const data: any = {
            idCaso: this.idCaso,
            idActoTramiteCaso: this.idActoTramiteCaso,
            fechaNotificacion: this.formularioAutoResuelve.get('fechaNotificacion')!.value,
            numeroExpediente: this.formularioAutoResuelve.get('nroExpediente')!.value,
            codFiscaliaSuperior: this.formularioAutoResuelve.get('codFiscaliaSuperior')!.value,
            observaciones: this.formularioAutoResuelve.get('observaciones')!.value
          };
          this.suscripciones.push(
            this.resolucionAutoResuelveCalificacionSentenciaService
              .registrarElevacion(data)
              .subscribe({
                next: (resp) => {
                  if (resp.code === '0') {
                    this.esPestanaElevada = true;
                    this.consultaCasosSharedService.showTab(true);
                    this.modalDialogService.success(
                      'REGISTRO CORRECTO',
                      `El cuaderno incidental fue elevado correctamente junto con la nueva pestaña de apelación con el número de expediente: ${this.numeroCaso}, recuerde que no tendrá acceso hasta que sea devuelto.`,
                      'Aceptar'
                    );
                  }
                },
                error: (error) => {
                  console.log(error);
                },
              })
          );
        }
      },
    });
  }

  private generateListHTML(): string {
    let html = '<ul>';
    console.log(this.sujetosElevar);
    this.sujetosElevar?.forEach((item: string) => {
      html += `<li>${item}</li>`;
    });
    html += '</ul>';
    return html;
  }

  private validarElevar(): Promise<void> {
    return new Promise((resolve) => {
      this.suscripciones.push(
        this.resolucionAutoResuelveCalificacionSentenciaService.validaElevar(this.idActoTramiteCaso).subscribe({
          next: (data: any) => {
            this.sujetosElevar = data;
            resolve();
          }
        })
      );
    });
  }

  private obtenerDatosResolucion() {
    this.suscripciones.push(
      this.resolucionAutoResuelveCalificacionSentenciaService
        .obtenerTramite(this.idActoTramiteCaso)
        .subscribe({
          next: (data) => {
            console.log("xxxxxxxx",data);
            this.idCasoPadre = data.idCasoPadre;
            this.formularioAutoResuelve.patchValue({
              idActoTramiteCaso: data.idActoTramiteCaso,
              fechaNotificacion: data.fechaNotificacion ? data.fechaNotificacion : null,
              nroExpediente: data.nroExpediente,
              codFiscaliaSuperior: data.codFiscaliaSuperior,
              observaciones: data.observaciones
            });
            !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
            this.flCheckModal = data.nuSujetosGuardado > 0;
            this.flElevacionSuperior = data.nuSujetosConcede > 0;
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  private eventoRegistrarResolucion(): void {
    let datosForm = this.formularioAutoResuelve.getRawValue();
    let request: AutoResuelveCalificacionSentenciaRequest = {
      listSujetos: [],
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: datosForm.fechaNotificacion,
      nroExpediente: datosForm.nroExpediente,
      codFiscaliaSuperior: datosForm.codFiscaliaSuperior,
      observaciones: datosForm.observaciones
    };

    this.suscripciones.push(
      this.resolucionAutoResuelveCalificacionSentenciaService.registrarTramite(request).subscribe({
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

  public openModalSujetos(tipoModal: number): void {
    let dataModal = {
      showHeader: false,
      data: {
        numeroCaso: this.numeroCaso,
        idCaso: this.idCaso,
        idCasoPadre: this.idCasoPadre,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTramite: "",
        idActoProcesal: "",
        listSujetosProcesales: this.selectedSujetos,
        soloLectura: !this.tramiteEnModoEdicion,
        nuPestana: this.nuPestana
      },
    };
    let ref: any;
    dataModal.data.listSujetosProcesales = this.selectedSujetos;
    ref = this.dialogService.open(RegistrarAutoResuelveCalificacionSentenciaModalComponent, dataModal);
    ref.onClose.subscribe((data: any) => {
      if (data) {
        this.flCheckModal = data.flCheckModal;
        this.flElevacionSuperior = data.flElevacionSuperior;
        this.actualizarFiscaliaSuperiorAElevar();
        this.agregarQuitarValidador();
      }
    });
  }

  private getFiscalSuperiorAElevar(): void {
    this.suscripciones.push(
      this.autoResuelveCalificacionApelacionService
        .listarFiscaliasSuperiores(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.fiscalias = resp;
          },
          error: () => {
            this.fiscalias = [];
          },
        })
    );
  }

  protected actualizarFiscaliaSuperiorAElevar(): void {
    const anterior = this.mostrarFiscaliaSuperiorAElevar;
    this.mostrarFiscaliaSuperiorAElevar = this.sujetosApelantes.some(s => s.idResultadoCalificacionApelacion === ID_N_RSP_APELACION.CONCEDE);

    if (anterior && !this.mostrarFiscaliaSuperiorAElevar) {
      this.formularioAutoResuelve.get('codFiscaliaSuperior')?.setValue(null);
    }
  }

  agregarQuitarValidador() {
    const control = this.formularioAutoResuelve.get('codFiscaliaSuperior');
    if (control) {
      control.setValidators(this.flElevacionSuperior ? [Validators.required] : null);
      control.reset(null);
      control.updateValueAndValidity();
      this.formularioAutoResuelve.updateValueAndValidity();
    }
  }

}
