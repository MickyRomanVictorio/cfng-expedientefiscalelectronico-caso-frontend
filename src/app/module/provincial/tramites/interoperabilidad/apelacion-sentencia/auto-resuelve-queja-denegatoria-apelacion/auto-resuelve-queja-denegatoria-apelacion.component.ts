import { NgClass, NgIf } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GuardarTramiteProcesalComponent } from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { DateMaskModule } from '@directives/date-mask.module';

import { AutoResuelveCalificacionApelacionService } from '@services/provincial/cuadernos-incidentales/auto-resuelve-calificacion-apelacion/auto-resuelve-calificacion-apelacion.service';
import { MensajeNotificacionService } from '@services/shared/mensaje.service';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { Subscription } from 'rxjs';
import { MensajeInteroperabilidadPjComponent } from '@components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { MensajeCompletarInformacionComponent } from '@components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { TramiteProcesal } from '@interfaces/comunes/tramiteProcesal';
import { ESTADO_REGISTRO, IconAsset, RESPUESTA_MODAL } from 'ngx-cfng-core-lib';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import { SentenciaQuejaAutoModalComponent } from './registrar-auto-queja-denegatoria-modal/registrar-auto-queja-denegatoria-modal.component';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { RecursoApelacionSentenciaService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/recurso-apelacion-sentencia.service';
import {
  AutoResuelveQuejaDenegatoriaApelacionCompartidoComponent
} from '@modules/provincial/tramites/interoperabilidad/compartidos/auto-resuelve-queja-denegatoria-apelacion-compartido/auto-resuelve-queja-denegatoria-apelacion-compartido.component';

@Component({
  selector: 'app-resuelve-queja-denegatoria-apelacion-sentencia',
  standalone: true,
  templateUrl: './auto-resuelve-queja-denegatoria-apelacion.component.html',
  imports: [
    MessagesModule,
    CalendarModule,
    DateMaskModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    InputMaskModule,
    DropdownModule,
    InputTextareaModule,
    NgIf,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
    NgxCfngCoreModalDialogModule,
    NgClass,
    AutoResuelveQuejaDenegatoriaApelacionCompartidoComponent,
  ],
  providers: [DialogService, MensajeNotificacionService],
  styleUrls: ['./auto-resuelve-queja-denegatoria-apelacion.component.scss'],
})
export class AppResuelveQuejaDenegatoriaApelacionSentenciaComponent implements OnInit {
  @Input() idCaso: string = '';
  @Input() idActoTramiteCaso: string = '';
  @Input() idEstadoTramite!: number;
  @Input() numeroCaso: string = '';
  @Input() idActoTramiteProcesalEnlace: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null; //
  @Input() idDocumento: string[] = []; //
  @Input() tramiteEnModoEdicion: boolean = false;

  protected razon = new FormControl('', [Validators.required]);
  protected refModal!: DynamicDialogRef;
  private readonly subscriptions: Subscription[] = [];
  protected fiscalias: any[] = [];
  protected maxlengthObservaciones: number = 200;
  protected formulario!: FormGroup;
  protected sujetosProcesales: any[] = [];
  protected tramiteGuardado: boolean = false;
  protected selectedSujetos: any = [];
  protected longitudMaximaObservaciones: number = 200;
  protected esPestanaElevada: boolean = false;
  protected esSoloLectura: boolean = false;
protected flCheckModal: boolean = false;
  protected readonly iconAsset = inject(IconAsset);
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);

  constructor(
    private readonly dialogService: DialogService,
    private readonly formBuilder: FormBuilder,
    private readonly mensajeService: MensajeNotificacionService,
    private readonly gestionCasoService :GestionCasoService,
     private readonly recursoApelacionSentencia: RecursoApelacionSentenciaService
  ) {}

  ngOnInit() {
    this.formulario = this.formBuilder.group({
      fechaNotificacion: [null, Validators.required],
      observaciones: ['', [Validators.maxLength(this.maxlengthObservaciones)]],
    });
    this.obtenerDatosResolucion();
  }

  protected eventoRegistrarResolucion() {
    if (this.formularioValido) {
      const data: any = {
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        fechaNotificacion: this.formulario.get('fechaNotificacion')!.value,
        observaciones: this.formulario.get('observaciones')!.value,
        listSujetos: this.selectedSujetos,
      };
      this.subscriptions.push(
        this.recursoApelacionSentencia
          .registrarTramiteRespuestaQueja(data)
          .subscribe({
            next: (resp) => {
              if (resp.codigo === 0) {
                this.formulario.disable();
                this.esSoloLectura = true;
                this.tramiteGuardado = true;
                this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
                this.mensajeService.verMensajeNotificacion(
                  'REGISTRO CORRECTAMENTE',
                  `Se registró correctamente la información de la <strong>${this.tramiteSeleccionado?.nombreTramite}.</strong>`,
                  'success'
                );
              }
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
    } else {
      this.markAllAsTouched();
    }
  }



  protected openModalSelectTramite() {
    this.dialogService.open(GuardarTramiteProcesalComponent, {
      width: '800px',
      showHeader: false,
      data: {
        tipo: 1,
        idCaso: this.idCaso,
        idEtapa: this.idEtapa,
        idActoProcesal: 0,
      },
    } as DynamicDialogConfig);
  }

  private markAllAsTouched() {
    Object.keys(this.formulario.controls).forEach((controlName) => {
      this.formulario.get(controlName)!.markAsTouched();
    });
  }



  private obtenerDatosResolucion() {
    this.subscriptions.push(
      this.recursoApelacionSentencia
        .obtenerTramiteRespuestaQueja(this.idActoTramiteCaso)
        .subscribe({
          next: (data) => {
            const fechaNoti = data.fechaNotificacion
              ? data.fechaNotificacion.split('T')[0]
              : null;
            this.formulario.patchValue({
              fechaNotificacion: fechaNoti,
              observaciones: data.observaciones,
            });
            this.flCheckModal = data.flCheckModal;
            !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  private deshabilitarFormulario(): void {
    this.formulario.disable();
  }



  get tieneActoTramiteCasoDocumento(): boolean {
    return Boolean(this.idActoTramiteCaso);
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  public openModalSujetos(): void {
    const ref = this.dialogService.open(
      SentenciaQuejaAutoModalComponent,
      {
        showHeader: false,
        data: {
          numeroCaso: this.numeroCaso,
          idCaso: this.idCaso,
          idActoTramiteCaso: this.idActoTramiteCaso,
          idTramite: '',
          idActoProcesal: '',
          listSujetosProcesales: this.selectedSujetos,
          soloLectura: !this.tramiteEnModoEdicion || this.esSoloLectura,
        },
      }
    );

    ref.onClose.subscribe((data) => {
      if(data && data.button === 'aceptar') {
        this.flCheckModal = data.data;
      }
    });
  }

  get cantidadCaracteresObservacion(): number {
    return this.formulario.get('observaciones')?.value?.length ?? 0;
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

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion;
  }

  get formularioValido(): boolean {
    return (
      this.formulario.valid &&
      this.flCheckModal
    );
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



}
