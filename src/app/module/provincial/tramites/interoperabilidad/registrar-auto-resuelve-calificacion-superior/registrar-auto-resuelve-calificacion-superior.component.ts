import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import {DatePipe, NgClass, NgIf} from '@angular/common';
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
import {
  RegistrarAutoResuelveCalificacionSuperiorModalComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-resuelve-calificacion-superior/registrar-auto-resuelve-calificacion-superior-modal/registrar-auto-resuelve-calificacion-superior-modal.component";
import {CheckboxChangeEvent, CheckboxModule} from "primeng/checkbox";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {MaestroService} from "@services/shared/maestro.service";
import {AutoResuelveCalificacionSuperiorRequest} from "@interfaces/comunes/AutoResuelveCalificacionSuperiorRequest";
import {
  ResolucionAutoResuelveCalificacionSuperiorService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-calificacion-superior.service";
import { tourService } from '@utils/tour';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import {
  RegistrarAutoResuelveCalificacionSuperiorModalPenasComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-resuelve-calificacion-superior/registrar-auto-resuelve-calificacion-superior-modal-penas/registrar-auto-resuelve-calificacion-superior-modal-penas.component";
import {
  RegistrarAutoResuelveCalificacionSuperiorModalRepCivilComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-resuelve-calificacion-superior/registrar-auto-resuelve-calificacion-superior-modal-rep-civil/registrar-auto-resuelve-calificacion-superior-modal-rep-civil.component";
import {PronunciamientoTramiteService} from "@services/superior/casos-elevados/pronunciamiento-tramite.service";
import {
  RegistrarAutoResuelveCalificacionSuperiorModalProcesoComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-resuelve-calificacion-superior/registrar-auto-resuelve-calificacion-superior-modal-proceso/registrar-auto-resuelve-calificacion-superior-modal-proceso.component";
import {convertStringToDate} from "@utils/date";

@Component({
  standalone: true,
  selector: 'app-registrar-auto-resuelve-calificacion-superior',
  templateUrl: './registrar-auto-resuelve-calificacion-superior.component.html',
  styleUrls: ['./registrar-auto-resuelve-calificacion-superior.component.scss'],
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
  ],
  providers: [DatePipe]
})

export class RegistrarAutoResuelveCalificacionSuperiorComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() numeroCaso: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso: string = '';
  @Input() tramiteEnModoEdicion: boolean = false;
  @Input() idEstadoTramite: number = 0;

  private idActoTramiteCasoPadre: string = '';

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly dialogService = inject(DialogService);
  private readonly gestionCasoService = inject(GestionCasoService);
  private readonly resolucionAutoResuelveCalificacionSuperiorService = inject(ResolucionAutoResuelveCalificacionSuperiorService);
  protected readonly maestroService = inject(MaestroService);
  private readonly datePipe = inject(DatePipe)
  private readonly tourService = inject(tourService)
  protected readonly iconUtil = inject(IconUtil)
  private readonly pronunciamientoTramiteService = inject(PronunciamientoTramiteService);

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

  protected formularioAutoResuelve: FormGroup = new FormGroup({
    idActoTramiteCaso: new FormControl(null, [Validators.required]),
    fechaNotificacion: new FormControl(null, [Validators.required]),
    observaciones: new FormControl(null, [Validators.maxLength(this.longitudMaximaObservaciones)]),
    fechaAudiencia: new FormControl(null, []),
    idTipoReunion: new FormControl(null, []),
    urlReunion: new FormControl(null, []),
    idDistritoJudicial: new FormControl(null, []),
    idEntidad: new FormControl(null, []),
    chkAgenda: new FormControl(null, []),
  });

  ngOnInit(): void {
    this.getListDistritoJudicial();
    this.tieneActoTramiteCasoDocumento && this.obtenerDetalleActoTramiteCaso();
  }

  changeAgendaAudiencia(event: CheckboxChangeEvent) {
    const campos = ['fechaAudiencia', 'idTipoReunion', 'idDistritoJudicial', 'idEntidad'];

    campos.forEach(campo => {
      const control = this.formularioAutoResuelve.get(campo);
      if (control) {
        event.checked ? control.setValidators([Validators.required]) : control.clearValidators();
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
    if(this.esTerminacionAnticipada){
      validSujetos = (this.selectedSujetosPena && this.selectedSujetosPena.length > 0) || (this.selectedSujetosSalidaExterna && this.selectedSujetosSalidaExterna.length > 0);
    }else if(this.esApelacionProceso){
      validSujetos = this.selectedSujetosProceso && this.selectedSujetosProceso.length > 0;
    } else{
      validSujetos = this.selectedSujetos && this.selectedSujetos.length > 0;
    }
    return this.formularioAutoResuelve.valid && validSujetos;
  }

  private obtenerDetalleActoTramiteCaso() {
    this.formularioAutoResuelve.get('idActoTramiteCaso')?.setValue(this.idActoTramiteCaso);
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
    this.formularioAutoResuelve.patchValue({
      idActoTramiteCaso: data.idActoTramiteCaso,
      fechaNotificacion: data.fechaNotificacion ? new Date(data.fechaNotificacion.split('T')[0]) : null,
      observaciones: data.observaciones,
      fechaAudiencia: data.fechaAudiencia ? new Date(data.fechaAudiencia.split('T')[0]) : null,
      idTipoReunion: data.idTipoReunion,
      urlReunion: data.urlReunion,
      chkAgenda: data.flAgenda === '1'
    });

    if (data.idDistritoJudicial) {
      this.formularioAutoResuelve.get('idDistritoJudicial')?.setValue(parseInt(data.idDistritoJudicial));
      this.maestroService
        .getJuzgadosPorDistritoJudicial(data.idDistritoJudicial)
        .subscribe({
          next: (resp) => {
            this.juzgadosList = resp.data;
            this.formularioAutoResuelve.get('idEntidad')?.setValue(data.idEntidad);
          },
        });
    }

    this.nuPestana = data.nuPestana;
    this.esTerminacionAnticipada = data.esTerminacionAnticipada;
    this.esApelacionProceso = data.esApelacionProceso;
    !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
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

  protected listarJuzgadosPazLetrado(idDistritoJudicial: number) {
    this.suscripciones.push(
      this.maestroService
        .getJuzgadosPorDistritoJudicial(idDistritoJudicial)
        .subscribe({
          next: (resp) => {
            this.juzgadosList = resp.data;
          },
        })
    )
  }

  private obtenerAutoResuelveCalificacion(): void {
    this.suscripciones.push(
      this.resolucionAutoResuelveCalificacionSuperiorService.obtenerTramite(this.idActoTramiteCaso)
      .subscribe({
        next: (resp) => {
          this.establecerValoresFormularioRecibido(resp);
        },
        error: () => {
          this.modalDialogService.error('Error', 'No se puede obtener los datos', 'Aceptar');
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
        idTipoRespuestaInstancia2: sujeto.idTipoRespuestaInstancia2
      });
    });
    this.selectedSujetosPena.forEach((sujeto: any) => {
      this.selectedSujetosToSend.push({
        idSujetoCaso: sujeto.idSujetoCaso,
        idTipoParteSujeto: sujeto.idTipoParteSujeto,
        idTipoRespuestaInstancia2: sujeto.idTipoRespuestaInstancia2
      });
    });
    this.selectedSujetosSalidaExterna.forEach((sujeto: any) => {
      this.selectedSujetosToSend.push({
        idSujetoCaso: sujeto.idSujetoCaso,
        idTipoParteSujeto: sujeto.idTipoParteSujeto,
        idTipoRespuestaInstancia2: sujeto.idTipoRespuestaInstancia2
      });
    });
    this.selectedSujetosProceso.forEach((sujeto: any) => {
      this.selectedSujetosToSend.push({
        idSujetoCaso: sujeto.idSujetoCaso,
        idTipoParteSujeto: sujeto.idTipoParteSujeto,
        idTipoRespuestaInstancia2: sujeto.idTipoRespuestaInstancia2
      });
    });
  }

  private registrarAutoResuelveCalificacion(): void {
    this.unirRespuestasSujetos();

    let datosForm = this.formularioAutoResuelve.getRawValue();
    let request: AutoResuelveCalificacionSuperiorRequest = {
      ...datosForm,
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: convertStringToDate(datosForm.fechaNotificacion),
      fechaAudiencia: convertStringToDate(datosForm.fechaAudiencia),
      flAgenda: datosForm.chkAgenda ? '1' : '0',
      listSujetos: this.selectedSujetosToSend
    };

    this.suscripciones.push(
      this.resolucionAutoResuelveCalificacionSuperiorService.registrarTramite(request).subscribe({
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

  public openModalSujetos(tipoModal: number): void {
    let dataModal = {
      showHeader: false,
      data: {
        numeroCaso: this.numeroCaso,
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTramite: "",
        idActoProcesal: "",
        listSujetosProcesales: this.selectedSujetos,
        soloLectura: !this.tramiteEnModoEdicion,
        nuPestana: this.nuPestana
      },
    };
    let ref: any;
    switch (tipoModal) {
      case 1:
        dataModal.data.listSujetosProcesales = this.selectedSujetos;
        ref = this.dialogService.open(RegistrarAutoResuelveCalificacionSuperiorModalComponent, dataModal);
        ref.onClose.subscribe((data: any) => {
          this.selectedSujetos = data || this.selectedSujetos
        });
        break;
      case 2:
        dataModal.data.listSujetosProcesales = this.selectedSujetosPena;
        ref = this.dialogService.open(RegistrarAutoResuelveCalificacionSuperiorModalPenasComponent, dataModal);
        ref.onClose.subscribe((data: any) => {
          this.selectedSujetosPena = data || this.selectedSujetosPena
        });
        break;
      case 3:
        dataModal.data.listSujetosProcesales = this.selectedSujetosSalidaExterna;
        ref = this.dialogService.open(RegistrarAutoResuelveCalificacionSuperiorModalRepCivilComponent, dataModal);
        ref.onClose.subscribe((data: any) => {
          this.selectedSujetosSalidaExterna = data || this.selectedSujetosSalidaExterna
        });
        break;
      case 4:
        dataModal.data.listSujetosProcesales = this.selectedSujetosProceso;
        ref = this.dialogService.open(RegistrarAutoResuelveCalificacionSuperiorModalProcesoComponent, dataModal);
        ref.onClose.subscribe((data: any) => {
          this.selectedSujetosProceso = data || this.selectedSujetosProceso
        });
        break;
    }
  }

  getIdActoTramitePadre (){
    this.pronunciamientoTramiteService.obtenerTramitePadre(this.idActoTramiteCaso).subscribe({
      next: (rs) => {
        this.idActoTramiteCasoPadre = rs.data;
      }
    });
  }

  protected startTour(): void {
    setTimeout(() => {
      this.tourService.startTour(this.stepsComponente);
    }, 500);
  }

  private stepsComponente = [
    {
      attachTo: {element: '.tour-f-1', on: 'bottom'},
      title: '1. Fecha de notificación',
      text: 'Debe ingresar la fecha de notificación de la resolución de manera obligatoria'
    },
    {
      attachTo: {element: '.tour-f-2', on: 'bottom'},
      title: '2. Resultado',
      text: 'Al hacer clic se desplegara una ventana donde debera indicar el resultado de la calificacion por cada sujeto procesal'
    },
    {
      attachTo: {element: '.tour-f-3', on: 'bottom'},
      title: '3. Agenda',
      text: 'Al hacer clic se mostraran campos adicionales donde podrá indicar datos para agendar una audiencia'
    },
    {
      attachTo: {element: '.tour-f-4', on: 'top'},
      title: '4. Observaciones',
      text: 'Puede escribir en este campo cualquier observacion, este campo es opcional'
    },
    {
      attachTo: {element: '.tour-f-5', on: 'bottom'},
      title: '5. Tramite incorrecto',
      text: 'En caso el documento ingresado corresponda a otro tramite podrá realizar la corrección en esta opción'
    },
    {
      attachTo: {element: '.tour-f-6', on: 'bottom'},
      title: '6. Guardar',
      text: 'Cuando haya completado todos los campos obligatorios se le habilitara la opción de guarda formulario con lo cual el tramite pasara a estado recibido'
    }
  ];

}
