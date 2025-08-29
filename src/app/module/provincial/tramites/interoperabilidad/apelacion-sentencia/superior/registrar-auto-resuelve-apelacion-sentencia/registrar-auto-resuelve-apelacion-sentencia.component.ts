import {Component, ElementRef, inject, Input, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
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
import {DialogService, DynamicDialogConfig} from 'primeng/dynamicdialog';
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
import {
  ResolucionAutoResuelveAutoSuperiorService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-auto-superior.service";
import {
  ObservarComponent
} from "@modules/provincial/tramites/comun/preliminar/disposicion-emitir-pronunciamiento-elevacion-actuados/observar/observar.component";
import {TokenService} from "@services/shared/token.service";
import {
  DatosPronunciamiento
} from "@interfaces/provincial/tramites/elevacion-actuados/DisposicionResuelveElevacionActuados";
import {TipoElevacionCodigo} from "@constants/superior";
import {
  RespuestaSuperiorDetalleService
} from "@services/provincial/respuesta-superior/respuesta-superior-detalle.service";
import {Router} from "@angular/router";

@Component({
  standalone: true,
  selector: 'app-registrar-auto-resuelve-calificacion-sentencia-superior',
  templateUrl: './registrar-auto-resuelve-apelacion-sentencia.component.html',
  styleUrls: ['./registrar-auto-resuelve-apelacion-sentencia.component.scss'],
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
    ObservarComponent,

  ],
  providers: [DatePipe]
})

export class RegistrarAutoResuelveApelacionSentenciaComponent implements OnInit, OnDestroy {
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
  private readonly resolucionAutoService = inject(ResolucionAutoResuelveAutoSuperiorService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly tokenService = inject(TokenService);
  private readonly respuestaSuperiorDetalleService = inject(RespuestaSuperiorDetalleService);
  private readonly router = inject(Router);
  private readonly suscripciones: Subscription[] = [];

  protected readonly iconAsset = inject(IconAsset);
  protected readonly longitudMaximaObservaciones: number = 200;
  protected nuPestana: string = '';
  protected tramiteGuardado: boolean = false;
  protected esSoloLectura: boolean = false;
  protected flDevolverAProvincial: number = 0;
  protected flCheckModal: boolean = false;
  protected mostrarBotonDevolver: boolean = false;
  protected sujetosDevolver: string[] = [];
  protected nombreFiscaliaProvincial: string = '';

  protected codJerarquia: number = 0;
  protected ocultarBotones: boolean = false;
  protected verFormularioObservar = signal<boolean>(false);
  protected datosPronunciamiento: DatosPronunciamiento | null = null;
  @ViewChild('scrollInferior', { static: false }) scrollInferior!: ElementRef;

  protected formularioAutoResuelve: FormGroup = new FormGroup({
    idActoTramiteCaso: new FormControl(null, [Validators.required]),
    fechaNotificacion: new FormControl(null, [Validators.required]),
    codFiscaliaSuperior: new FormControl(null),
    observaciones: new FormControl(null, [Validators.maxLength(this.longitudMaximaObservaciones)])
  });

  ngOnInit(): void {
    this.codJerarquia = parseInt(this.tokenService.getDecoded().usuario.codJerarquia);
    this.inicializarFormulario();
    this.tieneActoTramiteCasoDocumento && this.cargarDatosTramite();
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

  private inicializarFormulario(): void {
    this.formularioAutoResuelve = this.formBuilder.group({
      fechaNotificacion: [null, Validators.required],
      codFiscaliaSuperior: [null],
      observaciones: ['', [Validators.maxLength(200)]],
    });
  }

  private cargarDatosTramite(): void {
    this.formularioAutoResuelve.get('idActoTramiteCaso')?.setValue(this.idActoTramiteCaso);
    this.cargarDatosResolucion();
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
    this.modalDialogService.question(
      '',
      `A continuación, se procederá a <strong>crear el trámite</strong> de <strong>${this.tramiteSeleccionado?.nombreTramite}</strong>. ¿Está seguro de realizar la siguiente acción?`,
      'Aceptar',
      'Cancelar'
    ).subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.validarYRegistrarTramite();
        }
      },
    });
  }

  private cargarDatosResolucion(): void {
    this.suscripciones.push(
      this.pestanaApelacionService
        .obtenerTramiteInteroperabilidad(this.idActoTramiteCaso)
        .subscribe({
          next: (data) => {
            this.formularioAutoResuelve.patchValue({
              idActoTramiteCaso: data.idActoTramiteCaso,
              fechaNotificacion: data.fechaNotificacion || null,
              nroExpediente: data.nroExpediente,
              observaciones: data.observaciones
            });
            !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
            this.flCheckModal = data.nuSujetosGuardado > 0;
            this.nombreFiscaliaProvincial = data.nombreFiscaliaProvincial;

            if (!this.datosPronunciamiento) {
              this.datosPronunciamiento = {
                idActoTramiteCaso: data.idActoTramiteCaso,
                tipoResultado: 0,
                consecuencias: 0,
                seOrdena: '',
                excluirFiscal: ''
              };
            }

            this.datosPronunciamiento.fiscalPronuncimiento = data.nombreFiscalSuperior;
            this.datosPronunciamiento.nombreFiscalia = data.nombreFiscaliaSuperior;
          },
          error: (error) => console.log(error)
        })
    );
  }

  private validarYRegistrarTramite(): void {
    this.suscripciones.push(
      this.pestanaApelacionService.validaDevolverPestanaSentencia(this.idActoTramiteCaso).subscribe({
        next: (resp: any) => {
          this.flDevolverAProvincial = resp && resp.length > 0 ? 1 : 0;
          if (this.flDevolverAProvincial === 1) {
            this.sujetosDevolver = resp;
          }
          this.registrarTramite();
        },
        error: (error) => {
          this.modalDialogService.error('ERROR EN EL SERVICIO', error.error.message, 'Aceptar');
        }
      })
    );
  }

  private registrarTramite(): void {
    const datosForm = this.formularioAutoResuelve.getRawValue();
    const request = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: datosForm.fechaNotificacion,
      nroExpediente: datosForm.nroExpediente,
      observaciones: datosForm.observaciones,
      flMantenerEstadoTramite: this.flDevolverAProvincial
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
            this.mostrarBotonDevolver = this.flDevolverAProvincial === 1;
            this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
            this.modalDialogService.success(
              'REGISTRO CORRECTO',
              `Se registró correctamente la información de la <strong>${this.tramiteSeleccionado?.nombreTramite}.</strong>`,
              'Aceptar'
            );
          }
        },
        error: (error) => {
          this.modalDialogService.error('ERROR EN EL SERVICIO', error.error.message, 'Aceptar');
        }
      })
    );
  }

  protected abrirModalSujetos(): void {
    const dataModal = {
      showHeader: false,
      data: {
        numeroCaso: this.numeroCaso,
        nuPestana: this.nuPestana,
        idActoTramiteCaso: this.idActoTramiteCaso,
        soloLectura: !this.tramiteEnModoEdicion,
        configuracion: {
          titulo: 'Seleccionar resultado de la resolución de apelación de sentencia',
          subtitulo: 'Seleccione los sujetos procesales a los que se le ha declarado nula, confirma y/o revoca la resolución de la sentencia en 1era instancia',
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
              mostrar_campo: 'flResultadoCalificacionApelacionMostrar',
              mostrar: true,
              editar: false
            }, {
              nombre_campo: 'idResultadoResuelveRecursoReposicion',
              mostrar_campo: 'flResultadoResuelveRecursoReposicionMostrar',
              mostrar: true,
              editar: false
            }, {
              nombre_campo: 'idResultadoResuelveApelacionSentencia',
              mostrar_campo: 'flResultadoResuelveApelacionSentenciaMostrar',
              mostrar: true,
              editar: true
            }
          ]
        }
      }
    };
    const ref = this.dialogService.open(SujetosApelacionSentencia, dataModal);
    ref.onClose.subscribe((data: any) => {
      if (data?.flCheckModal) {
        this.flCheckModal = data.flCheckModal;
      }
    });
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  protected devolverAlFiscalProvincial(): void {
    const mensaje = `Esta acción realiza la devolución de la pestaña de apelación a la ${this.nombreFiscaliaProvincial}. ` +
      'Por favor, no olvide que al realizar esta acción, solo la pestaña de apelación pasará a modo lectura y no podrá acceder. ' +
      'Tener en cuenta que el/los sujeto(s) procesal(es) a quien(es) se le(s) está emitiendo el pronunciamiento son los siguientes:' +
      this.generarListaSujetosHTML() +
      '<b>¿Está seguro de realizar este trámite?</b>';

    this.modalDialogService.warning('DEVOLVER PESTAÑA DE APELACIÓN AL FISCAL PROVINCIAL', mensaje, 'Aceptar', true, 'Cancelar')
      .subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.procesarDevolucionProvincial();
          }
        },
      });
  }

  private procesarDevolucionProvincial(): void {
    this.resolucionAutoService.devolverProvincial(this.idActoTramiteCaso).subscribe({
      next: (resp) => {
        if (resp.code === "0") {
          this.mostrarBotonDevolver = false;
          this.modalDialogService.info('La pestaña de apelación ha sido devuelta correctamente al Fiscal Provincial', '', 'Aceptar');
        } else {
          this.modalDialogService.error('Error al devolver la pestaña', '', 'Aceptar');
        }
      }
    });
  }

  private generarListaSujetosHTML(): string {
    return '<ul>' + this.sujetosDevolver?.map(sujeto => `<li>${sujeto}</li>`).join('') + '</ul>';
  }

  /** OBSERVACION DESDE PROVINCIAL **/
  protected cancelarObservacion(): void {
    this.verFormularioObservar.set(false);
    this.ocultarBotones = false;
  }

  protected enviarObservacion(datos: any): void {
    this.procesarObservacion(datos.observacion);
  }

  private procesarObservacion(observacion: string): void {
    this.resolucionAutoService
      .observarCaso({
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTipoElevacion: +TipoElevacionCodigo.ElevacionActuados,
        observacion,
        numeroCaso: this.numeroCaso
      })
      .subscribe({
        next: (_) => {
          this.modalDialogService
            .success('Disposición observada', 'Se ha observado la disposición.', 'Aceptar')
            .subscribe({
              next: (_) => {
                this.ocultarBotones = true;
                this.verFormularioObservar.set(false);
                this.respuestaSuperiorDetalleService.notificarAccionFinalizada("exito");
              },
            });
        },
        error: (_) => {
          this.modalDialogService.error('Error', 'No se pudo observar la disposición', 'Aceptar');
        },
      });
  }

  protected gestionarObservacion(esModal: boolean = false): void {
    if (esModal) {
      this.dialogService.open(ObservarComponent, {
        width: '600px',
        showHeader: false,
        data: { esSoloLectura: this.codJerarquia === 2 },
      } as DynamicDialogConfig<any>);
      return;
    }

    this.verFormularioObservar.set(true);
    this.ocultarBotones = true;

    setTimeout(() => {
      this.scrollInferior?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  protected confirmarRecibirTramite(): void {
    this.modalDialogService
      .warning('Confirmar acción', 'Por favor confirme la acción de recibir el trámite', 'Aceptar', true, 'Cancelar')
      .subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.procesarRecepcionTramite();
          }
        },
      });
  }

  private procesarRecepcionTramite(): void {
    this.resolucionAutoService
      .aceptarCaso({
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTipoElevacion: +TipoElevacionCodigo.ElevacionActuados,
        observacion: '',
        numeroCaso: this.numeroCaso
      })
      .subscribe({
        next: (_) => {
          this.modalDialogService
            .success('Disposición recibida', 'Se recibió correctamente la disposición', 'Aceptar')
            .subscribe({
              next: (_) => {
                this.ocultarBotones = true;
                this.respuestaSuperiorDetalleService.notificarAccionFinalizada("");
                this.router.navigate(['/app/administracion-casos/', this.idCaso, 'elevacion-respuestas']);
              },
            });
        },
        error: (_) => {
          this.modalDialogService.error('Error', 'No se pudo recibir la disposición', 'Aceptar');
        },
      });
  }

}
