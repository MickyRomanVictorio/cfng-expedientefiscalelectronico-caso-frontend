import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { NgClass } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ESTADO_REGISTRO, RESPUESTA_MODAL, IconAsset } from 'dist/ngx-cfng-core-lib';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { TramiteProcesal } from '@interfaces/comunes/tramiteProcesal';
import { Subscription } from 'rxjs';
import {
  GuardarTramiteProcesalComponent
} from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { DialogService } from 'primeng/dynamicdialog';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { GenericResponse } from '@interfaces/comunes/GenericResponse';
import { GestionCasoService } from '@services/shared/gestion-caso.service';
import {
  ResolucionAutoCommunicaDetencionService
} from '@services/provincial/tramites/interoperabilidad/resolucion-auto/comunica-detencion.service';
import {
  RegistrarResultadosPrisionPreventivaComponent
} from '@modules/provincial/tramites/interoperabilidad/registrar-resultados-prision-preventiva/registrar-resultados-prision-preventiva.component';
import { convertStringToDate } from '@utils/date';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';


@Component({
  selector: 'app-registrar-auto-comunica-detencion-prision-preventiva',
  standalone: true,
  imports: [
    Button,
    CalendarModule,
    FormsModule,
    InputTextareaModule,
    MensajeCompletarInformacionComponent,
    MensajeInteroperabilidadPjComponent,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './registrar-auto-comunica-detencion-prision-preventiva.component.html',
  styleUrl: './registrar-auto-comunica-detencion-prision-preventiva.component.scss'
})
export class RegistrarAutoComunicaDetencionPrisionPreventivaComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso: string = '';
  @Input() tramiteEnModoEdicion: boolean = false;
  @Input() idEstadoTramite: number = 0;

  protected readonly iconAsset = inject(IconAsset);
  private readonly suscripciones: Subscription[] = [];
  protected maxLongObs: number = 200;
  protected fechaActual: Date = new Date();
  protected fechaHecho: Date | null = null;
  protected idActoTramiteCasoResuelve!: string;
  protected formularioAutoCommunica: FormGroup = new FormGroup({});

  constructor(private readonly fb: FormBuilder,
              private readonly dialogService: DialogService,
              private readonly casoService: Casos,
              private readonly gestionCasoService: GestionCasoService,
              private readonly modalDialogService: NgxCfngCoreModalDialogService,
              private readonly resolucionAutoCommunicaDetencionService: ResolucionAutoCommunicaDetencionService) {
    this.formularioAutoCommunica = this.fb.group({
      idActoTramiteCaso: new FormControl(null, [Validators.required]),
      fechaNotificacion: new FormControl(null, [Validators.required]),
      observaciones: new FormControl(null, [Validators.maxLength(this.maxLongObs)])
    });
  }

  ngOnInit(): void {
    this.infoCasoPadre();
    this.tieneActoTramiteCasoDocumento && this.obtenerDetalleActoTramiteCaso();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  get tieneActoTramiteCasoDocumento(): boolean {
    return Boolean(this.idActoTramiteCaso);
  }

  get idCasoPadre(): string {
    return this.gestionCasoService.casoActual.idCasoPadre ?? '';
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion;
  }

  get formularioValido(): boolean {
    return this.formularioAutoCommunica.valid;
  }

  get longitudObservacion(): number {
    return this.formularioAutoCommunica.get('observaciones')?.value?.length ?? 0;
  }

  private deshabilitarFormulario(): void {
    this.formularioAutoCommunica.disable();
  }

  private obtenerDetalleActoTramiteCaso() {
    this.formularioAutoCommunica.get('idActoTramiteCaso')?.setValue(this.idActoTramiteCaso);
    this.obtenerAutoCommunica();
  }

  private infoCasoPadre(): void {
    this.suscripciones.push(
      this.casoService.obtenerCasoFiscal(this.idCasoPadre).subscribe({
        next: (resp) => {
          this.fechaHecho = convertStringToDate(resp.fechaHecho, 'DD/MM/YYYY');
        }
      })
    );
  }

  private obtenerAutoCommunica(): void {
    this.suscripciones.push(
      this.resolucionAutoCommunicaDetencionService
        .obtenerComunicaDetencion(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.idActoTramiteCasoResuelve = resp.idActoTramiteCasoResuelve;
            this.formularioAutoCommunica.patchValue({
              fechaNotificacion: resp.fechaNotificacion,
              observaciones: resp.observaciones,
              idActoTramiteCaso: resp.idActoTramiteCaso
            })
          },
        })
    );
  }

  protected modalResultadosPrisionPreventiva(): void {
    const ref = this.dialogService.open(RegistrarResultadosPrisionPreventivaComponent, {
      showHeader: false,
      width: '70rem',
      closeOnEscape: false,
      data: {
        idCaso: this.idCaso,
        idCasoPadre: this.gestionCasoService.casoActual.idCasoPadre,
        idActoTramiteCaso: this.idActoTramiteCasoResuelve,
        numeroCaso: this.numeroCaso,
        tramiteEnModoEdicion: this.tramiteEnModoEdicion,
        actualizar: true,
        prolongacion: false,
        reo: true,
      },
    });
    ref.onClose.subscribe((confirm) => {
      this.formularioAutoCommunica.get('resultadoComunicaDetencion')?.setValue( confirm.existeResultadosRegistrados )
    });
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
          this.registrarAutoComunica();
        }
      },
    });
  }

  private registrarAutoComunica(): void {
    this.suscripciones.push(
      this.resolucionAutoCommunicaDetencionService
        .registroComunicaDetencion(this.formularioAutoCommunica.value)
        .subscribe({
          next: (resp: GenericResponse) => {
            this.deshabilitarFormulario();
            this.tramiteEnModoEdicion = false;
            this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
            this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
            this.modalDialogService.success(
              'REGISTRO CORRECTO',
              `Se registró correctamente la información de la <strong>${this.tramiteSeleccionado?.nombreTramite}.</strong>`,
              'Aceptar'
            );
          },
        })
    );
  }
}
