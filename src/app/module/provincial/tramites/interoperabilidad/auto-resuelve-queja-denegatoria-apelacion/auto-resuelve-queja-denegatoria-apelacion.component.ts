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
import { RegistrarAutoQuejaDenegatoriaModalComponent } from './registrar-auto-queja-denegatoria-modal/registrar-auto-queja-denegatoria-modal.component';
import { AutoResuelveQuejaDenegatoriapelacionService } from '@core/services/provincial/cuadernos-incidentales/auto-resuelve-queja-denegatoria-apelacion/auto-resuelve-queja-denegatoria-apelacion.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import {
  AutoResuelveQuejaDenegatoriaApelacionCompartidoComponent
} from '@modules/provincial/tramites/interoperabilidad/compartidos/auto-resuelve-queja-denegatoria-apelacion-compartido/auto-resuelve-queja-denegatoria-apelacion-compartido.component';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';

@Component({
  selector: 'app-auto-resuelve-queja-denegatoria-apelacion',
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
export class AutoResuelveQuejaDenegatoriaApelacionComponent implements OnInit {
  @Input() idCaso: string = '';
  @Input() idActoTramiteCaso: string = '';
  @Input() idEstadoTramite!: number;
  @Input() numeroCaso: string = '';
  @Input() idActoTramiteProcesalEnlace: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null; //
  @Input() idDocumento: string[] = []; //
  @Input() tramiteEnModoEdicion: boolean = false;

  private idsSujeto: string[] = ['000172'];
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
  private nivelApelacion: string = 'sujeto'; 

  constructor(
    private readonly dialogService: DialogService,
    private readonly formBuilder: FormBuilder,
    private readonly autoResuelveCalificacionApelacionService: AutoResuelveCalificacionApelacionService,
    private readonly autoResuelveQuejaDenegatoriapelacionService:AutoResuelveQuejaDenegatoriapelacionService,
    private readonly mensajeService: MensajeNotificacionService,
    private readonly gestionCasoService :GestionCasoService,
      private readonly tramiteService: TramiteService
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
        this.autoResuelveQuejaDenegatoriapelacionService
          .registrarResolucion(data)
          .subscribe({
            next: (resp) => {
              if (resp.code === '0') {
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
      this.autoResuelveCalificacionApelacionService
        .obtenerDatosResolucion(this.idActoTramiteCaso)
        .subscribe({
          next: (data) => {
            const fechaNoti = data.fechaNotificacion
              ? data.fechaNotificacion.split('T')[0]
              : null;
            this.formulario.patchValue({
              fechaNotificacion: fechaNoti,
              nroExpediente: data.numeroExpediente,
              codFiscaliaSuperior: data.codFiscaliaSuperior,
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
      RegistrarAutoQuejaDenegatoriaModalComponent,
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
      if(data) {
      this.flCheckModal = data.flCheckModal;
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
  protected get idActo(): string {
    return this.tramiteService.validacionTramite.idActoSeleccionado;
  }

  protected get esSujeto(): boolean {
    return this.nivelApelacion === 'sujeto' || this.idsSujeto.includes(this.idActo);
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
