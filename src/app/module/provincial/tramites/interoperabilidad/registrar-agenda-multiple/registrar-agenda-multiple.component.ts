import { Component, Input, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ESTADO_REGISTRO, IconUtil, StringUtil, RESPUESTA_MODAL } from 'ngx-cfng-core-lib';
import { AgendaNotificacionInterface } from '@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface';
import { DialogService } from 'primeng/dynamicdialog';
import { GuardarTramiteProcesalComponent } from "@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component";
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { AgendaMultipleComponent } from './agenda-multiple/agenda-multiple.component';
import { AgendaMultipleService } from '@core/services/provincial/tramites/agenda-multiple.service';
import { Subscription } from 'rxjs';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';

@Component({
  selector: 'app-registrar-agenda-multiple',
  standalone: true,
  imports: [
    ButtonModule,
    CmpLibModule,
    AgendaMultipleComponent,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
    NgxCfngCoreModalDialogModule
  ],
  templateUrl: './registrar-agenda-multiple.component.html',
  styleUrl: './registrar-agenda-multiple.component.scss'
})
export class RegistrarAgendaMultipleComponent implements OnInit {
  protected idCaso!: string  
  protected idActoTramiteCaso!: string
  public idEtapa!: string
  public tramiteEnModoEdicion: boolean = false;
  protected cerrarLabel: boolean = false;
  protected agendasMultiples: AgendaNotificacionInterface[] = [];
  private readonly suscriptions: Subscription[] = [];
  private idEstadoRegistro: number = 0;
  protected esVisibleBoton: boolean = true;
  protected fechaNotificacion: string | null = null;
  protected esEditableRecibido: boolean = false;
  protected mostrarFechaNotificacion: boolean = true;
  constructor(
    protected iconUtil: IconUtil,
    protected stringUtil: StringUtil,
    private readonly dialogService: DialogService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly agendaMultipleService: AgendaMultipleService,
    private readonly casoService: Casos,
  ) {
  }

  ngOnInit(): void {
    if (this.tieneActoTramiteCasoDocumento) this.obtenerDetalleActoTramiteCaso();
  }

  get formularioValido(): boolean {
    return this.agendasMultiples.length > 0 && this.fechaNotificacion !== null;
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoRegistro === ESTADO_REGISTRO.RECIBIDO;
  }

  get esPosibleEditarPorEstado(): boolean {
    return !this.tramiteEstadoRecibido;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion ? this.tramiteEnModoEdicion : this.esPosibleEditarPorEstado
  }

  private obtenerDetalleActoTramiteCaso() {
    this.casoService.actoTramiteDetalleCaso(this.idActoTramiteCaso)
      .subscribe({
        next: (resp: any) => {
          this.idEstadoRegistro = resp.idEstadoTramite;
          if (this.tramiteEstadoRecibido) this.listarAgendaMultiple();
        }
      })
  }

  protected validarGuardadoAgendasNotificacion(): void {
    if (this.fechaNotificacion === undefined || this.fechaNotificacion === null) {
      this.modalDialogService.warning('Fecha de notificación', 'Seleccione una fecha de notificación', 'Aceptar');
    } else {
      this.guardarAgendasNotificacion();
    }
  }

  private guardarAgendasNotificacion(): void {
    this.agendasMultiples.forEach(agenda => {
      agenda.idCaso = this.idCaso;
      agenda.idActoTramiteCaso = this.idActoTramiteCaso;
      agenda.fechaNotificacion = this.fechaNotificacion!;
    });

    this.suscriptions.push(
      this.agendaMultipleService.guardarAgendaMultiple(this.agendasMultiples)
        .subscribe({
          next: resp => {
            this.modalDialogService.success('Registrado correctamente', 'Se registró correctamente la información de la <br> <strong>Agenda múltiple de notificación de audiencia.</strong>', 'Aceptar');
            this.tramiteEnModoEdicion = false;
            this.esVisibleBoton = false;
            this.idEstadoRegistro = ESTADO_REGISTRO.RECIBIDO;
          },
          error: err => {
            this.modalDialogService.error('Error en la operación', 'Ocurrió un error en la operación', 'Aceptar');
          }
        })
    )
  }

  private listarAgendaMultiple(): void {
    this.suscriptions.push(
      this.agendaMultipleService.listarAgendaMultiple(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: AgendaNotificacionInterface[]) => {
            this.agendasMultiples = resp;
            this.esEditableRecibido = true;
          }
        })
    )
  }

  protected modalActualizarActoYTramite(): void {
    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      showHeader: false,
      data: {
        tipo: 2,
        idCaso: this.idCaso,
        idEtapa: this.idEtapa,
        idActoTramiteCaso: this.idActoTramiteCaso,
      }
    });
    ref.onClose.subscribe((confirm) => {
      if (confirm === RESPUESTA_MODAL.OK) window.location.reload();
    });
  }

  protected alCambiarFechaNotificacion(event: any): void {
    this.fechaNotificacion = event;
  }
  protected alValidarListaAgenda(event: any): void {
    console.log(event)
  }
  protected get tieneActoTramiteCasoDocumento(): boolean {
    return !(this.idActoTramiteCaso == null || this.idActoTramiteCaso == '')
  }

  protected get tramiteNoDespachadoMesa(): boolean {
    return !this.tieneActoTramiteCasoDocumento && !this.tramiteEstadoRecibido
  }

}
