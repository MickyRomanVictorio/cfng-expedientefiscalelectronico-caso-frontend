import {Component, ElementRef, inject, Input, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
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
import {GestionCasoService} from '@core/services/shared/gestion-caso.service';
import {CheckboxModule} from "primeng/checkbox";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {MaestroService} from "@services/shared/maestro.service";
import {
  RegistrarAutoDesistimientoApelacionModalModalComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-desistimiento-apelacion/registrar-auto-desistimiento-apelacion-modal/registrar-auto-desistimiento-apelacion-modal-modal.component";
import {
  ResolucionAutoResuelveDesistimientoService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-desistimiento.service";
import {BotonSujetos} from "@interfaces/comunes/ApelacionAuto";
import {AutoResuelveDesistimientoRequest} from "@interfaces/comunes/AutoResuelveDesistimiento";
import {
  RegistrarAutoResuelveCalificacionSuperiorModalRepCivilComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-resuelve-calificacion-superior/registrar-auto-resuelve-calificacion-superior-modal-rep-civil/registrar-auto-resuelve-calificacion-superior-modal-rep-civil.component";
import {
  RegistrarAutoResuelveCalificacionSuperiorModalPenasComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-resuelve-calificacion-superior/registrar-auto-resuelve-calificacion-superior-modal-penas/registrar-auto-resuelve-calificacion-superior-modal-penas.component";
import {
  RegistrarAutoResuelveCalificacionSuperiorModalProcesoComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-resuelve-calificacion-superior/registrar-auto-resuelve-calificacion-superior-modal-proceso/registrar-auto-resuelve-calificacion-superior-modal-proceso.component";
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
import {AlertaGeneralRequestDTO} from "@interfaces/comunes/alerta";
import {
  CodigoAlertaTramiteEnum,
  CodigoDestinoAlertaTramiteEnum,
  TipoOrigenAlertaTramiteEnum
} from "@constants/constants";
import {Router} from "@angular/router";
import {
  RespuestaSuperiorDetalleService
} from "@services/provincial/respuesta-superior/respuesta-superior-detalle.service";

@Component({
  standalone: true,
  selector: 'app-registrar-auto-desistimiento-apelacion',
  templateUrl: './registrar-auto-desistimiento-apelacion.component.html',
  styleUrls: ['./registrar-auto-desistimiento-apelacion.component.scss'],
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
    NgIf,
    NgForOf,
    ObservarComponent,
  ],
  providers: [DatePipe]
})

export class RegistrarAutoDesistimientoApelacionComponent implements OnInit, OnDestroy {
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
  private readonly resolucionAutoResuelveDesistimientoService = inject(ResolucionAutoResuelveDesistimientoService);
  protected readonly maestroService = inject(MaestroService);
  protected readonly iconUtil = inject(IconUtil)
  private readonly resolucionAutoService = inject(ResolucionAutoResuelveAutoSuperiorService);

  protected totalSujetosEditadosRequerimiento: number = 0;
  protected totalSujetosEditadosPena: number = 0;
  protected totalSujetosEditadosRepCivil: number = 0;
  protected totalSujetosEditadosProceso: number = 0;

  protected selectedSujetosToSend: any = [];
  protected selectedSujetos: any = [];
  protected selectedSujetosSalidaExterna: any = [];
  protected selectedSujetosPena: any = [];
  protected selectedSujetosProceso: any = [];

  protected readonly iconAsset = inject(IconAsset);
  private readonly suscripciones: Subscription[] = [];
  protected longitudMaximaObservaciones: number = 200;
  protected distritoJudicialList = [];
  protected juzgadosList = [];
  protected nuPestana: string = '';
  protected esTerminacionAnticipada: boolean = true;
  protected esApelacionProceso: boolean = true;
  private readonly router = inject(Router);
  private readonly respuestaSuperiorDetalleService = inject(RespuestaSuperiorDetalleService);

  protected botones: BotonSujetos[] = [];
  protected datosPronunciamiento!: DatosPronunciamiento;
  protected observacionProvincial: string = '';
  protected verFormularioObservar = signal<boolean>(false);
  protected idJerarquia: number = 0;
  @ViewChild('scrollInferior', { static: false }) scrollInferior!: ElementRef;

  private tokenService = inject(TokenService);

  protected formularioAutoResuelve: FormGroup = new FormGroup({
    idActoTramiteCaso: new FormControl(null, [Validators.required]),
    fechaNotificacion: new FormControl(null, [Validators.required]),
    observaciones: new FormControl(null, [Validators.maxLength(this.longitudMaximaObservaciones)]),
  });
  protected mostrarBotonDevolver: boolean = false;
  protected sujetosDevolver: string[] = [];
  protected ocultarBotones: boolean = false;
  public nombreFiscaliaProvincial: string = '';

  ngOnInit(): void {
    this.idJerarquia = parseInt(this.tokenService.getDecoded().usuario.codJerarquia);
    this.getListDistritoJudicial();
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
    let validSujetos = (this.totalSujetosEditadosRequerimiento + this.totalSujetosEditadosPena + this.totalSujetosEditadosRepCivil + this.totalSujetosEditadosProceso) > 0;
    return this.formularioAutoResuelve.valid && validSujetos;
  }

  private obtenerDetalleActoTramiteCaso() {
    this.formularioAutoResuelve.get('idActoTramiteCaso')?.setValue(this.idActoTramiteCaso);
    this.obtenerAutoResuelveDesistimiento();
    this.validarDevolver();
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
          this.guardarFormulario();
        }
      },
    });
  }

  protected getListDistritoJudicial(): void {
    this.suscripciones.push(
      this.maestroService.getDistritoJudicial().subscribe({
        next: (resp) => {
          if (resp && resp.code === 200) {
            this.distritoJudicialList = resp.data;
          }
        },
      })
    );
  }

  private obtenerAutoResuelveDesistimiento(): void {
    this.suscripciones.push(
      this.resolucionAutoResuelveDesistimientoService.obtenerTramite(this.idActoTramiteCaso)
      .subscribe({
        next: (data: AutoResuelveDesistimientoRequest) => {
          this.formularioAutoResuelve.patchValue({
            idActoTramiteCaso: data.idActoTramiteCaso,
            fechaNotificacion: data.fechaNotificacion,
            observaciones: data.observaciones,
          });
          this.nuPestana = data.nuPestana || "";
          this.mostrarBotonDevolver = data.esDevolverCaso;
          this.observacionProvincial = data.observacionProvincial;
          this.nombreFiscaliaProvincial = data.nombreFiscaliaProvincial;

          this.datosPronunciamiento = {
            idActoTramiteCaso: this.idActoTramiteCaso,
            tipoResultado: 0,
            consecuencias: 0,
            seOrdena: '',
            excluirFiscal: '',
            nombreFiscalia: data.nombreFiscalia,
            fiscalPronuncimiento: data.fiscalPronunciamiento,
            idJerarquia: this.idJerarquia,
            observacionProvincial: data.observacionProvincial
          };

          this.botones = [
            { id: 1, texto: 'Seleccionar resultado', mostrar: data.esApelacionRequerimiento, completo: false },
            { id: 2, texto: 'Penas', mostrar: data.esApelacionReparacionCivil, completo: false },
            { id: 3, texto: 'Rep. Civil', mostrar: data.esApelacionPena, completo: false },
            { id: 4, texto: 'Proceso', mostrar: data.esApelacionProcesoInmediato, completo: false },
            { id: 5, texto: 'Terminacion Anticipada', mostrar: data.esApelacionTerminacionAnticipada, completo: false }
          ];
          !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
        },
        error: () => {
          this.modalDialogService.error('Error', 'No se puede obtener los datos', 'Aceptar');
        },
      })
    );
  }

  private validarDevolver(): void {
    this.suscripciones.push(
      this.resolucionAutoResuelveDesistimientoService.validaDevolver(this.idActoTramiteCaso).subscribe({
        next: (data) => {
          this.sujetosDevolver = data;
          if(data.length > 0){
            this.mostrarBotonDevolver = true;
          } else{
            this.mostrarBotonDevolver = false;
          }
        }
      })
    );
  }

  unirRespuestasSujetos() {
    const allSujetos = [
      ...this.selectedSujetos,
      ...this.selectedSujetosPena,
      ...this.selectedSujetosSalidaExterna,
      ...this.selectedSujetosProceso,
    ];

    this.selectedSujetosToSend = allSujetos.map((sujeto: any) => ({
      idSujetoCaso: sujeto.idSujetoCaso,
      idTipoParteSujeto: sujeto.idTipoParteSujeto,
      idTipoRespuestaDesistimiento: sujeto.idTipoRespuestaDesistimiento,
    }));
  }

  private guardarFormulario(): void {
    let datosForm = this.formularioAutoResuelve.getRawValue();
    let request: AutoResuelveDesistimientoRequest = {
      ...datosForm,
      idActoTramiteCaso: this.idActoTramiteCaso
    };

    this.suscripciones.push(
      this.resolucionAutoResuelveDesistimientoService.registrarTramite(request).subscribe({
        next: () => {
          this.resolucionAutoResuelveDesistimientoService.validaDevolver(this.idActoTramiteCaso).subscribe({
            next: (data) => {
              if(data.length === 0){
                this.bloquearFormulario();
              } else{
                this.mostrarBotonDevolver = true;
                this.sujetosDevolver = data;
              }

              this.modalDialogService.success(
                'REGISTRO CORRECTO',
                `Se registró correctamente la información de la <strong>${this.tramiteSeleccionado?.nombreTramite}.</strong>`,
                'Aceptar'
              );
            }
          });
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
        nuPestana: this.nuPestana,
        idActoTramiteCaso: this.idActoTramiteCaso,
        soloLectura: !this.tramiteEnModoEdicion
      },
    };

    let ref: any;
    switch (tipoModal) {
      case 1:
        ref = this.dialogService.open(RegistrarAutoDesistimientoApelacionModalModalComponent, dataModal);
        ref.onClose.subscribe((data: any) => {
          this.totalSujetosEditadosRequerimiento = data;
          const boton = this.botones.find((b: { id: number; }) => b.id === tipoModal);
          if (boton) boton.completo = this.totalSujetosEditadosRequerimiento > 0;
          this.mostrarBotonDevolver = false;
        });
        break;
      case 2:
        ref = this.dialogService.open(RegistrarAutoResuelveCalificacionSuperiorModalPenasComponent, dataModal);
        ref.onClose.subscribe((data: any) => {
          this.totalSujetosEditadosPena = data;
          const boton = this.botones.find((b: { id: number; }) => b.id === tipoModal);
          if (boton) boton.completo = this.totalSujetosEditadosPena > 0;
          this.mostrarBotonDevolver = false;
        });
        break;
      case 3:
        ref = this.dialogService.open(RegistrarAutoResuelveCalificacionSuperiorModalRepCivilComponent, dataModal);
        ref.onClose.subscribe((data: any) => {
          this.totalSujetosEditadosRepCivil = data;
          const boton = this.botones.find((b: { id: number; }) => b.id === tipoModal);
          if (boton) boton.completo = this.totalSujetosEditadosRepCivil > 0;
          this.mostrarBotonDevolver = false;
        });
        break;
      case 4:
        ref = this.dialogService.open(RegistrarAutoResuelveCalificacionSuperiorModalProcesoComponent, dataModal);
        ref.onClose.subscribe((data: any) => {
          this.totalSujetosEditadosProceso = data;
          const boton = this.botones.find((b: { id: number; }) => b.id === tipoModal);
          if (boton) boton.completo = this.totalSujetosEditadosProceso > 0;
          this.mostrarBotonDevolver = false;
        });
        break;
    }
  }

  devolverAlFiscalProvincial() {
    console.log('this.sujetosDevolver',this.sujetosDevolver);
    let ref = this.modalDialogService.warning(
      'DEVOLVER PESTAÑA DE APELACIÓN AL FISCAL PROVINCIAL',
      `Esta acción realiza la devolución de la pestaña de apelación a la ${this.nombreFiscaliaProvincial}. ` +
      'Por favor, no olvide que al realizar esta acción, solo la pestaña de apelación pasará a modo lectura y no podrá acceder. ' +
      'Tener en cuenta que el/los sujeto(s) procesal(es) a quien(es) se le(s) está emitiendo el pronunciamiento son los siguientes:' +
      ' <br/>' +
      this.sujetosDevolver
        .map((sujeto: any) => sujeto)
        .join(', ') +
      ' <br/>' +
      '¿Está seguro de realizar este trámite?”',
      'Aceptar',
      true,
      'Cancelar'
    );
    ref.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.resolucionAutoService.devolverProvincial(this.idActoTramiteCaso).subscribe({
            next: (resp) => {
              if (resp.code === "0") {
                this.bloquearFormulario();
                this.modalDialogService.info('La pestaña de apelación ha sido devuelta correctamente al Fiscal Provincial', '', 'Aceptar');
              } else {
                this.modalDialogService.error('Error al devolver la pestaña', '', 'Aceptar');
              }
            }
          });
        }
      },
    });
  }

  bloquearFormulario(){
    this.tramiteEnModoEdicion = false;
    this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
    this.deshabilitarFormulario();
    this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
    this.mostrarBotonDevolver = false;
  }

  /** OBSERVAR PROVINCIAL **/
  protected eventoObservarTramite(esModal: boolean = false): void {
    if(esModal===true){
      const _ = this.dialogService.open(ObservarComponent, {
        width: '600px',
        showHeader: false,
        data: {
          esSoloLectura: this.idJerarquia === 2,
          datosPronunciamiento: this.datosPronunciamiento
        },
      } as DynamicDialogConfig<any>);
      return;
    }

    this.verFormularioObservar.set(true);
    this.ocultarBotones = true;

    setTimeout(() => {
      this.scrollInferior?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  protected eventoRecibirTramite() {
    this.modalDialogService
      .warning(
        'Confirmar acción',
        'Por favor confirme la acción de recibir el trámite',
        'Aceptar',
        true,
        'Cancelar'
      )
      .subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.recibirTramite();
          }
        },
      });
  }

  protected eventoObservarCancelar(): void {
    this.verFormularioObservar.set(false);
    this.ocultarBotones = false;
  }
  protected eventoObservarEnviar(datos: any): void {
    this.observarTramite(datos.observacion);
  }

  private recibirTramite(): void {
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
            .success(
              'Disposición recibida',
              'Se recibió correctamente la disposición',
              'Aceptar'
            )
            .subscribe({
              next: (_) => {
                this.ocultarBotones = true;
                this.respuestaSuperiorDetalleService.notificarAccionFinalizada("");
                this.router.navigate([
                  '/app/administracion-casos/',
                  this.idCaso,
                  'elevacion-respuestas',
                ]).then(() => {
                  window.location.reload();//Forzar la actualización para forzar la actualización menú lateral
                });
              },
            });
        },
        error: (_) => {
          this.modalDialogService.error(
            'Error',
            'No se pudo recibir la disposición',
            'Aceptar'
          );
        },
      });
  }

  private observarTramite(observacion: string): void {
    this.resolucionAutoService
      .observarCaso({
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTipoElevacion: +TipoElevacionCodigo.ElevacionActuados,
        observacion: observacion,
        numeroCaso: this.numeroCaso
      })
      .subscribe({
        next: (_) => {
          this.modalDialogService
            .success(
              'Disposición observada',
              'Se ha observado la disposición.',
              'Aceptar'
            )
            .subscribe({
              next: (_) => {
                this.ocultarBotones = true;
                const request: AlertaGeneralRequestDTO = {
                  idCaso: this.idCaso,
                  numeroCaso: this.numeroCaso,
                  idActoTramiteCaso: this.idActoTramiteCaso,
                  codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_CC3,
                  idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
                  destino: CodigoDestinoAlertaTramiteEnum.SUP_USUARIO_SUPERIOR,
                };
                //this.registrarAlertas(request);

                this.ocultarBotones = true;
                this.verFormularioObservar.set(false);
                this.respuestaSuperiorDetalleService.notificarAccionFinalizada("exito");
                //
              },
            });
        },
        error: (_) => {
          this.modalDialogService.error(
            'Error',
            'No se pudo recibir la disposición',
            'Aceptar'
          );
        },
      });
  }

}
