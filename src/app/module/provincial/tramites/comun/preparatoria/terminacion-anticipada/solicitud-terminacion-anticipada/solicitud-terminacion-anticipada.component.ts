import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajeGenericoComponent } from '@core/components/mensajes/mensaje-generico/mensaje-generico.component';
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { SujetosTerminacionAnticipadaComponent } from '@core/components/modals/sujetos-terminacion-anticipada/sujetos-terminacion-anticipada.component';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { CmpLibModule } from 'dist/cmp-lib';
import { ESTADO_REGISTRO, icono, RESPUESTA_MODAL, ValidationModule } from 'dist/ngx-cfng-core-lib';
import { CalendarModule } from 'primeng/calendar';
import { DialogService } from 'primeng/dynamicdialog';
import { SolicitudTerminacionAnticipadaService } from '@core/services/provincial/tramites/comun/preliminar/terminacion-anticipada/solicitud-terminacion-anticipada.service';
import { Subscription } from 'rxjs';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { convertStringToDate } from '@core/utils/date';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import dayjs from 'dayjs';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { capitalizedFirstWord } from '@core/utils/string';

@Component({
  selector: 'app-solicitud-terminacion-anticipada',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MensajeGenericoComponent,
    CalendarModule,
    FormsModule,
    CmpLibModule,
    DateMaskModule,
    ValidationModule,
    MensajeCompletarInformacionComponent
  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './solicitud-terminacion-anticipada.component.html',
  styleUrl: './solicitud-terminacion-anticipada.component.scss'
})
export class SolicitudTerminacionAnticipadaComponent {
  
  public idCaso!: string

  public numeroCaso!: string

  public idActoTramiteCaso!: string

  public idEtapa!: string

  public etapa!: string

  private readonly subscriptions: Subscription[] = []

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly fb = inject(FormBuilder)

  private readonly solicitudTerminacionAnticipadaService = inject(SolicitudTerminacionAnticipadaService)

  private readonly dialogService = inject(DialogService)

  private readonly gestionCasoService = inject(GestionCasoService)

  private readonly tramiteService = inject(TramiteService)

  private readonly idEstadoTramite!: number

  protected formRegistro: FormGroup

  protected fechaActual: Date | null = null

  protected sujetosProcesalesSeleccionadosIds: string[] = []

  protected flagGuardar: boolean = true

  public tramiteSeleccionado: TramiteProcesal | null = null;
  

  constructor(
  ) {
    this.formRegistro = this.fb.group({
      fechaNotificacion: ['', [Validators.required]],
      observaciones: ['', [Validators.maxLength(200)]],
    });
  }
  ngOnInit(): void {
    this.fechaActual = dayjs().startOf('day').toDate()
    this.obtenerDatosGuardadosTramite();
    if(this.tramiteEnModoVisor || this.tramiteEstadoRecibido) {
      this.formRegistro.disable()
      this.flagGuardar = false
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected obtenerDatosGuardadosTramite() : void {
    this.subscriptions.push(
      this.solicitudTerminacionAnticipadaService.obtenerDatosTramite(this.idActoTramiteCaso).subscribe({
        next: resp => {
          if(resp){
            this.formRegistro.get('observaciones')?.setValue(resp.observacion ?? '')
            this.sujetosProcesalesSeleccionadosIds = resp.sujetos as  string[]
            const fechaNotificacion = dayjs(resp.fechaNotificacion).startOf('day');
            if (fechaNotificacion.isBefore(dayjs().startOf('day'))) {
              this.fechaActual = dayjs(resp.fechaNotificacion).toDate();
            }
            setTimeout(() => { 
             this.formRegistro.get('fechaNotificacion')?.setValue(convertStringToDate(resp.fechaNotificacion))
             }, 100) 
          }
        },
        error: () => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar obtener la información del trámite`, 'Aceptar')
        }
      })
    )
  }


  protected counterReportChar(): number {
    return this.formRegistro.get('observaciones')!.value !== null
      ? this.formRegistro.get('observaciones')!.value.length
      : 0;
  }

  protected otroTramite(){
    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      showHeader: false,
      data: {
        tipo: 2,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idEtapa: this.idEtapa,
      },
    });

    ref.onClose.subscribe((confirm) => {
      if (confirm === RESPUESTA_MODAL.OK) window.location.reload();
    });
  }

  protected abrirModalAgregarEditarSujeto() {
      const ref = this.dialogService.open(SujetosTerminacionAnticipadaComponent, {
        showHeader: false,
        data:
        { idCaso: this.idCaso,
          idActoTramiteCaso:this.idActoTramiteCaso,
          numeroCaso:this.numeroCaso,
          etapa: this.etapa,
          sujetosProcesalesSeleccionadosIds:this.sujetosProcesalesSeleccionadosIds,
          modoLectura:!this.flagGuardar,
          idTramite:this.idTramite
        },
        contentStyle: { padding: '0', 'border-radius': '15px' }
      });

      ref.onClose.subscribe((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          //Se guarda los idSujetoCaso
          this.sujetosProcesalesSeleccionadosIds = data;
        }
      });
  }

  protected guardarTramite(){
    if (this.formRegistro.invalid || this.sujetosProcesalesSeleccionadosIds.length == 0) {
      this.formRegistro.markAllAsTouched();
      return;
    }
    const request = {
      idActoTramiteCaso:this.idActoTramiteCaso,
      fechaNotificacion:this.formRegistro.get('fechaNotificacion')?.value,
      observacion:this.formRegistro.get('observaciones')?.value,
      sujetos:this.sujetosProcesalesSeleccionadosIds
    }
    this.subscriptions.push(
      this.solicitudTerminacionAnticipadaService.registrarEditarTramite(request).subscribe({
        next: resp => {
          if(resp){
            this.formRegistro.disable()
            this.flagGuardar = false
            this.modalDialogService.success("REGISTRO CORRECTAMENTE", `Se registró correctamente la información de la Solicitud de terminación anticipada`, 'Aceptar')
            this.gestionCasoService.obtenerCasoFiscal(this.idCaso)            
          }
        },
        error: () => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar guardar la información del trámite`, 'Aceptar')
        }
      })
    )
  }

  protected icono(name: string): string {
      return icono(name);
  }

  protected get tramiteNoDespachadoMesa(): boolean {
    return !this.tieneActoTramiteCasoDocumento && !this.tramiteEstadoRecibido
  }

  protected get tieneActoTramiteCasoDocumento(): boolean {
    return !(this.idActoTramiteCaso == null || this.idActoTramiteCaso == '')
  }

  protected get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
  }

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }
  protected get idTramite(): string  {
    return this.tramiteSeleccionado?.idTramite!
  }
  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }
}
