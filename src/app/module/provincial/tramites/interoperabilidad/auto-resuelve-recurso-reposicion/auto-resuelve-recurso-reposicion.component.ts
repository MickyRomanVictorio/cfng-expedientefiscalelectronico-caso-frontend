import { Component, ElementRef, inject, Input, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { DatePipe, NgClass, NgIf } from '@angular/common';
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
import { Subscription, filter } from 'rxjs';
import { GuardarTramiteProcesalComponent } from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { GenericResponse } from '@core/interfaces/comunes/GenericResponse';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { AutoResuelveRecursoReposicionModalComponent } from '@modules/provincial/tramites/interoperabilidad/auto-resuelve-recurso-reposicion/auto-resuelve-recurso-reposicion-modal/auto-resuelve-recurso-reposicion-modal.component';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MaestroService } from '@services/shared/maestro.service';
import { AutoResuelveCalificacionSuperiorRequest } from '@interfaces/comunes/AutoResuelveCalificacionSuperiorRequest';
import { ResolucionAutoResuelveCalificacionSuperiorService } from '@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-calificacion-superior.service';
import { tourService } from '@utils/tour';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { RegistrarAutoResuelveCalificacionSuperiorModalPenasComponent } from '@modules/provincial/tramites/interoperabilidad/registrar-auto-resuelve-calificacion-superior/registrar-auto-resuelve-calificacion-superior-modal-penas/registrar-auto-resuelve-calificacion-superior-modal-penas.component';
import { RegistrarAutoResuelveCalificacionSuperiorModalRepCivilComponent } from '@modules/provincial/tramites/interoperabilidad/registrar-auto-resuelve-calificacion-superior/registrar-auto-resuelve-calificacion-superior-modal-rep-civil/registrar-auto-resuelve-calificacion-superior-modal-rep-civil.component';
import { PronunciamientoTramiteService } from '@services/superior/casos-elevados/pronunciamiento-tramite.service';
import { RegistrarAutoResuelveCalificacionSuperiorModalProcesoComponent } from '@modules/provincial/tramites/interoperabilidad/registrar-auto-resuelve-calificacion-superior/registrar-auto-resuelve-calificacion-superior-modal-proceso/registrar-auto-resuelve-calificacion-superior-modal-proceso.component';
import { ResolucionAutoResuelveRecursoReposicionService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-recurso-reposicion.service';
import { convertDateToDDMMYYYY, convertStringToDate, obtenerFechaDDMMYYYY } from '@core/utils/date';
import { ResolucionAutoResuelveAutoSuperiorService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-auto-superior.service';
import { ResolucionAutoResuelveRequerimientoService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service';
import { PestanaApelacionSujetoService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/pestana-apelacion-sujeto.service';
import { ObservarComponent } from '../../comun/preliminar/disposicion-emitir-pronunciamiento-elevacion-actuados/observar/observar.component';
import { TipoElevacionCodigo } from '@core/constants/superior';
import { RespuestaSuperiorDetalleService } from '@core/services/provincial/respuesta-superior/respuesta-superior-detalle.service';
import { Router } from '@angular/router';
import { AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import { CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum } from '@core/constants/constants';
import { DatosPronunciamiento } from '@core/interfaces/provincial/tramites/elevacion-actuados/DisposicionResuelveElevacionActuados';
import { TokenService } from '@core/services/shared/token.service';

@Component({
  standalone: true,
  selector: 'app-auto-resuelve-recurso-reposicion',
  templateUrl: './auto-resuelve-recurso-reposicion.component.html',
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
    ObservarComponent
  ],
  providers: [DatePipe],
})
export class AutoResuelveRecursoReposicionComponent
  implements OnInit, OnDestroy
{
  @Input() idCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() numeroCaso: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso: string = '';
  @Input() tramiteEnModoEdicion: boolean = false;
  @Input() idEstadoTramite: number = 0;


 
  private idActoTramiteCasoPadre: string = '';
  public nombreFiscaliaProvincial: string = '';
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly dialogService = inject(DialogService);
  private readonly gestionCasoService = inject(GestionCasoService);
  private readonly resolucionAutoResuelveCalificacionSuperiorService = inject(
    ResolucionAutoResuelveCalificacionSuperiorService
  );
  private readonly resolucionAutoResuelveRecursoReposicionService = inject(
    ResolucionAutoResuelveRecursoReposicionService
  );

 
  private resolucionAutoService=  inject(ResolucionAutoResuelveAutoSuperiorService) ;
                                        
  protected readonly maestroService = inject(MaestroService);
  private readonly datePipe = inject(DatePipe);
  private readonly tourService = inject(tourService);
  protected readonly iconUtil = inject(IconUtil);
  private readonly pronunciamientoTramiteService = inject(
    PronunciamientoTramiteService
  );

  protected selectedSujetosToSend: any = [];
  protected selectedSujetos: any = [];
  private sujetosTodos: any = [];
  protected selectedSujetosSalidaExterna: any = [];
  protected selectedSujetosPena: any = [];
  protected selectedSujetosProceso: any = [];

  protected readonly iconAsset = inject(IconAsset);
  private readonly suscripciones: Subscription[] = [];
  protected longitudMaximaObservaciones: number = 200;
  protected distritoJudicialList = [];
  protected juzgadosList = [];
  protected nuPestana: string = '';
  protected esTerminacionAnticipada: boolean = false;
  protected esApelacionProceso: boolean = false;
  soloLectura: boolean = false;//
  botonDevolverProvincial: boolean = false;
  protected codJerarquia: any;
  protected idJerarquia: number = 0;
  protected ocultarBotones: boolean = false;
 protected verFormularioObservar = signal<boolean>(false);
  @ViewChild('scrollInferior', { static: false }) scrollInferior!: ElementRef;
 protected datosPronunciamiento: DatosPronunciamiento | null = null;
 protected observacionProvincial: string = '';

  protected formularioAutoResuelve: FormGroup = new FormGroup({
    idActoTramiteCaso: new FormControl(null, [Validators.required]),
    fechaNotificacion: new FormControl(null, [Validators.required]),
    observaciones: new FormControl(null, [
      Validators.maxLength(this.longitudMaximaObservaciones),
    ]),
    fechaAudiencia: new FormControl(null, []),
    idTipoReunion: new FormControl(null, []),
    urlReunion: new FormControl(null, []),
    idDistritoJudicial: new FormControl(null, []),
    idEntidad: new FormControl(null, []),
    chkAgenda: new FormControl(null, []),
  });

constructor(   private pestanaApelacionSujetoService: PestanaApelacionSujetoService,
    private readonly respuestaSuperiorDetalleService: RespuestaSuperiorDetalleService,
     private readonly router: Router,
     private tokenService: TokenService
){
  const usuarioSession = this.tokenService.getDecoded();
  this.codJerarquia = usuarioSession.usuario.codJerarquia;
}

  ngOnInit(): void {
    this.getListDistritoJudicial();
   
  }

  changeAgendaAudiencia(event: CheckboxChangeEvent) {
    const campos = [
      'fechaAudiencia',
      'idTipoReunion',
      'idDistritoJudicial',
      'idEntidad',
    ];

    campos.forEach((campo) => {
      const control = this.formularioAutoResuelve.get(campo);
      if (control) {
        event.checked
          ? control.setValidators([Validators.required])
          : control.clearValidators();
        control.updateValueAndValidity();
      }
    });
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
    let validSujetos;
    if (this.esTerminacionAnticipada) {
      validSujetos =
        (this.selectedSujetosPena && this.selectedSujetosPena.length > 0) ||
        (this.selectedSujetosSalidaExterna &&
          this.selectedSujetosSalidaExterna.length > 0);
    } else if (this.esApelacionProceso) {
      validSujetos =
        this.selectedSujetosProceso && this.selectedSujetosProceso.length > 0;
    } else {
      validSujetos = this.selectedSujetos && this.selectedSujetos.length > 0;
    }
    return this.formularioAutoResuelve.valid && validSujetos;
  }

  private obtenerDetalleActoTramiteCaso() {
    this.formularioAutoResuelve
      .get('idActoTramiteCaso')
      ?.setValue(this.idActoTramiteCaso);
    this.obtenerAutoResuelveCalificacion();
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
          this.registrarAutoResuelveCalificacion();
        }
      },
    });
  }

  private establecerValoresFormularioRecibido(data: any): void {
    this.obtenerSujetosProcesales();
    const fechaNoti = convertDateToDDMMYYYY( data.fechaNotificacion,'DD/MM/YYYY');
    const fechaAudiencia = convertDateToDDMMYYYY( data.fechaAudiencia,'DD/MM/YYYY');
    this.formularioAutoResuelve.patchValue({
      idActoTramiteCaso: data.idActoTramiteCaso,
      fechaNotificacion: fechaNoti,
      observaciones: data.observaciones,
      fechaAudiencia: fechaAudiencia,
      idTipoReunion: data.idTipoReunion,
      urlReunion: data.urlReunion,
      idDistritoJudicial: Number(data.idDistritoJudicial??0),
      idEntidad: data.idEntidad,
      chkAgenda: data.flAgenda === '1',
    });
    this.nuPestana = data.nuPestana;
    this.esTerminacionAnticipada = false;// data.esTerminacionAnticipada;
    this.esApelacionProceso =false;// data.esApelacionProceso;
    !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
  }

  protected getListDistritoJudicial(): void {
    this.suscripciones.push(
      this.maestroService.getDistritoJudicial().subscribe({
        next: (resp) => {
          if (resp && resp.code === 200) {
            this.distritoJudicialList = resp.data;
            this.tieneActoTramiteCasoDocumento && this.obtenerDetalleActoTramiteCaso();
          }
        },
      })
    );
  }

  protected listarJuzgadosPazLetrado(idDistritoJudicial: number) {
    this.suscripciones.push(
      this.maestroService
        .getJuzgadosPorDistritoJudicial(idDistritoJudicial)
        .subscribe({
          next: (resp) => {
            this.juzgadosList = resp.data;
          },
        })
    );
  }

  private obtenerAutoResuelveCalificacion(): void {
    this.suscripciones.push(
      this.resolucionAutoResuelveRecursoReposicionService
        .obtenerTramite(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            if (Number(resp.idDistritoJudicial)??0 > 0) {
              this.listarJuzgadosPazLetrado(resp.idDistritoJudicial);
              }
            this.nombreFiscaliaProvincial = resp.nombreFiscaliaProvincial;
            this.establecerValoresFormularioRecibido(resp);
          
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              'No se puede obtener los datos',
              'Aceptar'
            );
          },
        })
    );
  }

  unirRespuestasSujetos() {
    this.selectedSujetosToSend = [];
    this.selectedSujetos.forEach((sujeto: any) => {
      this.selectedSujetosToSend.push({
        idSujetoCaso: sujeto.idSujetoCaso,
        idTipoParteSujeto: sujeto.idTipoParteSujeto,
        idTipoRespuestaReposicion: sujeto.idTipoRespuestaReposicion,
      });
    });
    this.selectedSujetosPena.forEach((sujeto: any) => {
      this.selectedSujetosToSend.push({
        idSujetoCaso: sujeto.idSujetoCaso,
        idTipoParteSujeto: sujeto.idTipoParteSujeto,
        idTipoRespuestaReposicion: sujeto.idTipoRespuestaReposicion,
      });
    });
    this.selectedSujetosSalidaExterna.forEach((sujeto: any) => {
      this.selectedSujetosToSend.push({
        idSujetoCaso: sujeto.idSujetoCaso,
        idTipoParteSujeto: sujeto.idTipoParteSujeto,
        idTipoRespuestaReposicion: sujeto.idTipoRespuestaReposicion,
      });
    });
    this.selectedSujetosProceso.forEach((sujeto: any) => {
      this.selectedSujetosToSend.push({
        idSujetoCaso: sujeto.idSujetoCaso,
        idTipoParteSujeto: sujeto.idTipoParteSujeto,
        idTipoRespuestaReposicion: sujeto.idTipoRespuestaReposicion,
      });
    });
  }

  private registrarAutoResuelveCalificacion(): void {
    this.unirRespuestasSujetos();

    let datosForm = this.formularioAutoResuelve.getRawValue();
    let request: AutoResuelveCalificacionSuperiorRequest = {
      ...datosForm,
      idActoTramiteCaso: this.idActoTramiteCaso,
      flAgenda: datosForm.chkAgenda ? '1' : '0',
      observaciones: datosForm.observaciones,
      idTipoReunion: datosForm.idTipoReunion,

      fechaNotificacion: convertStringToDate(datosForm.fechaNotificacion,'DD/MM/YYYY'),
      fechaAudiencia: datosForm.fechaAudiencia? convertStringToDate(datosForm.fechaAudiencia,'DD/MM/YYYY'):null,

      urlReunion: datosForm.urlReunion,
      idDistritoJudicial: datosForm.idDistritoJudicial,
      idEntidad: datosForm.idEntidad,
      listSujetos: this.selectedSujetosToSend,
    };
    this.suscripciones.push(
      this.resolucionAutoResuelveRecursoReposicionService
        .registrarTramite(request)
        .subscribe({
          next: (resp: any) => {
            this.tramiteEnModoEdicion = false;
            this.botonDevolverProvincial = this.calcularMostrarBotonDevolverProvincial()
        
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
              'ERROR EN EL SERVICIO',
              error.error.message,
              'Aceptar'
            );
          },
        })
    );
  }

  public openModalSujetos(tipoModal: number): void {
    let dataModal = {
      showHeader: false,
      data: {
        numeroCaso: this.numeroCaso,
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTramite: '',
        idActoProcesal: '',
        listSujetosProcesales: this.selectedSujetos,
        soloLectura: !this.tramiteEnModoEdicion,
        nuPestana: this.nuPestana,
      },
    };
    let ref: any;
    switch (tipoModal) {
   
      case 1:
        dataModal.data.listSujetosProcesales = this.selectedSujetos;
        ref = this.dialogService.open(
          AutoResuelveRecursoReposicionModalComponent,
          dataModal
        );
        ref.onClose.subscribe((data: any) => {
          this.selectedSujetos = data;
        });
        break;
      case 2:
        dataModal.data.listSujetosProcesales = this.selectedSujetosPena;
        ref = this.dialogService.open(
          RegistrarAutoResuelveCalificacionSuperiorModalPenasComponent,
          dataModal
        );
        ref.onClose.subscribe((data: any) => {
          this.selectedSujetosPena = data;
        });
        break;
      case 3:
        dataModal.data.listSujetosProcesales =
          this.selectedSujetosSalidaExterna;
        ref = this.dialogService.open(
          RegistrarAutoResuelveCalificacionSuperiorModalRepCivilComponent,
          dataModal
        );
        ref.onClose.subscribe((data: any) => {
          this.selectedSujetosSalidaExterna = data;
        });
        break;
      case 4:
        dataModal.data.listSujetosProcesales = this.selectedSujetosProceso;
        ref = this.dialogService.open(
          RegistrarAutoResuelveCalificacionSuperiorModalProcesoComponent,
          dataModal
        );
        ref.onClose.subscribe((data: any) => {
          this.selectedSujetosProceso = data;
        });
        break;
    }
  }

  getIdActoTramitePadre() {
    this.pronunciamientoTramiteService
      .obtenerTramitePadre(this.idActoTramiteCaso)
      .subscribe({
        next: (rs) => {
          this.idActoTramiteCasoPadre = rs.data;
        },
      });
  }

  protected startTour(): void {
    setTimeout(() => {
      this.tourService.startTour(this.stepsComponente);
    }, 500);
  }

  private obtenerSujetosProcesales(): void {
    this.selectedSujetos = [];
    this.suscripciones.push(
      this.pestanaApelacionSujetoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 1)
        .subscribe({
          next: (resp) => {
            this.sujetosTodos = resp;
            this.selectedSujetos = resp.filter(
              (sujeto: any) => sujeto.idTipoRespuestaReposicion !== 0
            );
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

 protected eventoObservarTramite(esModal: boolean = false): void {
    if(esModal===true){
      const _ = this.dialogService.open(ObservarComponent, {
        width: '600px',
        showHeader: false,
        data: {
          //datosPronunciamiento: this.datosPronunciamiento,
          esSoloLectura: this.idJerarquia === 2,
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
  protected eventoObservarCancelar(): void {
    this.verFormularioObservar.set(false);
    this.ocultarBotones = false;
  }
  protected eventoObservarEnviar(datos: any): void {
    this.observarTramite(datos.observacion);
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
    private calcularMostrarBotonDevolverProvincial(): boolean {
        const m1= this.sujetosTodos.some((sujeto: any) => sujeto.idTipoRespuestaInstancia2 == 1480);//EXISTE ALGUNO ADMISIBLE
        const m2=   this.selectedSujetos.some((sujeto: any) => sujeto.idTipoRespuestaReposicion == 1485)  ; // EXISTE ALGUNO FUNDADO
return !m1  && !m2;
    }
  public devolverAlFiscalProvincial(): void {
    let ref = this.modalDialogService.warning(
      'DEVOLVER PESTAÑA DE APELACIÓN AL FISCAL PROVINCIAL',
      `Esta acción realiza la devolución de la pestaña de apelación a la ${this.nombreFiscaliaProvincial}. ` +
        'Por favor, no olvide que al realizar esta acción, solo la pestaña de apelación pasará a modo lectura y no podrá acceder. ' +
        'Tener en cuenta que el/los sujeto(s) procesal(es) a quien(es) se le(s) está emitiendo el pronunciamiento son los siguientes:' +
        ' <br/>' +
        this.selectedSujetos
          .map((sujeto: any) => sujeto.nombreCompleto)
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
              if(resp.code === "0"){
                this.botonDevolverProvincial = false;
                
              this.modalDialogService.info('La pestaña de apelación ha sido devuelta correctamente al Fiscal Provincial', '', 'Aceptar');
              }else{
                this.modalDialogService.error('Error al devolver la pestaña', '', 'Aceptar');
              }
            }
          });


        }
      },
    });
  }
  private stepsComponente = [
    {
      attachTo: { element: '.tour-f-1', on: 'bottom' },
      title: '1. Fecha de notificación',
      text: 'Debe ingresar la fecha de notificación de la resolución de manera obligatoria',
    },
    {
      attachTo: { element: '.tour-f-2', on: 'bottom' },
      title: '2. Resultado',
      text: 'Al hacer clic se desplegara una ventana donde debera indicar el resultado de la calificacion por cada sujeto procesal',
    },
    {
      attachTo: { element: '.tour-f-3', on: 'bottom' },
      title: '3. Agenda',
      text: 'Al hacer clic se mostraran campos adicionales donde podrá indicar datos para agendar una audiencia',
    },
    {
      attachTo: { element: '.tour-f-4', on: 'top' },
      title: '4. Observaciones',
      text: 'Puede escribir en este campo cualquier observacion, este campo es opcional',
    },
    {
      attachTo: { element: '.tour-f-5', on: 'bottom' },
      title: '5. Tramite incorrecto',
      text: 'En caso el documento ingresado corresponda a otro tramite podrá realizar la corrección en esta opción',
    },
    {
      attachTo: { element: '.tour-f-6', on: 'bottom' },
      title: '6. Guardar',
      text: 'Cuando haya completado todos los campos obligatorios se le habilitara la opción de guarda formulario con lo cual el tramite pasara a estado recibido',
    },
  ];
}
