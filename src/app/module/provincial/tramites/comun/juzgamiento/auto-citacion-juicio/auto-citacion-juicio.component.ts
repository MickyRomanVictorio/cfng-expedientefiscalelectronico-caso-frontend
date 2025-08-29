import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { DateMaskModule } from '@directives/date-mask.module';
import { NgClass } from '@angular/common';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from "primeng/inputmask";
import { DialogService } from 'primeng/dynamicdialog';
import { AgregarAudienciaComponent } from './agregar-audiencia/agregar-audiencia.component';
import { GuardarTramiteProcesalComponent } from "@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component";
import { ESTADO_REGISTRO, IconAsset, IconUtil, RESPUESTA_MODAL } from 'ngx-cfng-core-lib';
import { AgendaNotificacionInterface } from '@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface';
import { AutoCitacionJuicioService } from '@core/services/provincial/tramites/comun/juzgamiento/auto-citacion-juicio/auto-citacion-juicio.service';
import { AutoCitacionJuicio } from '@core/interfaces/provincial/tramites/comun/juzgamiento/auto-citacion-juicio/auto-citacion-juicio.interface';
import { GenericResponse } from '@core/interfaces/comunes/GenericResponse';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';

@Component({
  selector: 'app-auto-citacion-juicio',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    CalendarModule,
    ButtonModule,
    CheckboxModule,
    DateMaskModule,
    InputTextareaModule,
    CmpLibModule,
    InputTextModule,
    InputMaskModule,
    NgxCfngCoreModalDialogModule,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent
  ],
  providers: [ DialogService ],
  templateUrl: './auto-citacion-juicio.component.html',
  styleUrl: './auto-citacion-juicio.component.scss'
})
export class AutoCitacionJuicioComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() idActoTramiteCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() esNuevo: boolean = false;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() tramiteEnModoEdicion: boolean = false;
  @Input() idEstadoTramite: number = 0;

  private readonly subscriptions: Subscription[] = [];
  protected longitudMaximaObservaciones: number = 1000;
  private codigoCuadernoPruebaRespaldo: string | null = null;
  private readonly pattern = /^[\da-zA-Z]{5}-[\da-zA-Z]{4}-[\da-zA-Z]-[\da-zA-Z]{4}-[\da-zA-Z]{2}-[\da-zA-Z]{2}-[\da-zA-Z]{2}$/;

  protected formAutoCitacionJuicio: FormGroup = new FormGroup({
    idActoTramiteCaso: new FormControl(null, [Validators.required]),
    fechaNotificacion: new FormControl(null, [Validators.required]),
    agendasMultiples: new FormControl([]),
    incorporaCuadernoPrueba: new FormControl(null),
    codigoCuadernoPrueba: new FormControl(null, [Validators.pattern(this.pattern)]),
    observacion: new FormControl(null, [Validators.maxLength(this.longitudMaximaObservaciones)])
  })

  get tieneActoTramiteCasoDocumento(): boolean {
    return Boolean(this.idActoTramiteCaso);
  }

  get formularioValido(): boolean {
    return this.formAutoCitacionJuicio.valid;
  }

  get cantidadCaracteresObservacion(): number {
    return this.formAutoCitacionJuicio.get('observacion')?.value?.length ?? 0;
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion;
  }

  get agendasMultiplesActivas(): AgendaNotificacionInterface[] {
    return (
      this.formAutoCitacionJuicio.get('agendasMultiples')?.value.length > 0 ?
      this.formAutoCitacionJuicio.get('agendasMultiples')?.value.filter((item: AgendaNotificacionInterface)=> item.estadoAgendaFiscal == '1') :
      []
    )
  }

  protected readonly iconUtil = inject(IconUtil);
  protected readonly iconAsset = inject(IconAsset);
  private readonly dialogService = inject(DialogService);
  private readonly autoCitacionJuicioService = inject(AutoCitacionJuicioService);
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly gestionCasoService = inject(GestionCasoService);

  ngOnInit(): void {
    this.tieneActoTramiteCasoDocumento && this.obtenerDetalleActoTramiteCaso();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  protected agregarAudienciasMultiples(): void {
    let agendasMultiplesValue = Array.from(this.formAutoCitacionJuicio.get('agendasMultiples')?.value)  ;
    const dialog = this.dialogService.open( AgregarAudienciaComponent, {
      width: '1000px',
      showHeader: false,
      contentStyle: { padding: '10px', 'border-radius': '15px' },
      data: { agendasMultiples : agendasMultiplesValue }
    })

    dialog.onClose.subscribe((data: any) => {
      if ( data.estado === RESPUESTA_MODAL.OK ) this.formAutoCitacionJuicio.get('agendasMultiples')?.setValue( data.agendasMultiples )
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
      }
    });
    ref.onClose.subscribe((confirm) => {
      if (confirm === RESPUESTA_MODAL.OK) window.location.reload();
    });
  }

  private obtenerDetalleActoTramiteCaso() {
    this.formAutoCitacionJuicio.get('idActoTramiteCaso')?.setValue(this.idActoTramiteCaso);
    this.obtenerAutoCitacionJuicio();
  }

  private obtenerAutoCitacionJuicio(): void {
    this.subscriptions.push(
      this.autoCitacionJuicioService.obtenerAutoCitacionJuicio( this.idActoTramiteCaso )
      .subscribe({
          next: (resp: AutoCitacionJuicio) => {
            this.formAutoCitacionJuicio.get('codigoCuadernoPrueba')?.markAsTouched();
            this.establecerValoresFormularioRecibido( resp );
            this.codigoCuadernoPruebaRespaldo = resp.codigoCuadernoPrueba;
          }
        })
      )
  }

  private establecerValoresFormularioRecibido(data: AutoCitacionJuicio): void {
    this.formAutoCitacionJuicio.patchValue({
      idActoTramiteCaso: data.idActoTramiteCaso,
      fechaNotificacion: data.fechaNotificacion,
      agendasMultiples: data.agendasMultiples,
      incorporaCuadernoPrueba: data.incorporaCuadernoPrueba,
      codigoCuadernoPrueba: data.codigoCuadernoPrueba,
      observacion: data.observacion
    });
    !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
  }

  protected confirmarRegistroTramite(): void {
    const dialog = this.modalDialogService.question('', `A continuación, se procederá a <strong>crear el trámite</strong> de <strong>${this.tramiteSeleccionado?.nombreTramite}</strong>. ¿Está seguro de realizar la siguiente acción?`, 'Aceptar', 'Cancelar');
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.validarTramiteARegistrar();
        }
      }
    });
  }

  private validarTramiteARegistrar(): void {
    this.formAutoCitacionJuicio.get('agendasMultiples')?.value.forEach((agenda: AgendaNotificacionInterface) => {
      agenda.idCaso = this.idCaso;
      agenda.idActoTramiteCaso = this.idActoTramiteCaso!;
      agenda.fechaNotificacion = this.formAutoCitacionJuicio.get('fechaNotificacion')?.value;
    });
    this.registrarAutoCitacionJuicio();
  }

  private registrarAutoCitacionJuicio(): void {
    this.subscriptions.push(
      this.autoCitacionJuicioService.registrarAutoCitacionJuicio( this.formAutoCitacionJuicio.value )
      .subscribe({
          next: (resp: GenericResponse) => {
            this.tramiteEnModoEdicion = false;
            this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
            this.gestionCasoService.obtenerCasoFiscal( this.idCaso );
            this.deshabilitarFormulario();
            this.modalDialogService.success('REGISTRO CORRECTO', `Se registró correctamente la información de la <strong>${this.tramiteSeleccionado?.nombreTramite}.</strong>`, 'Aceptar');
          }
        })
      )
  }

  protected alCambiarIncorporaCuaderno(event: any): void {
    !event && this.formAutoCitacionJuicio.get('codigoCuadernoPrueba')?.setValue( null );
    event && this.formAutoCitacionJuicio.get('codigoCuadernoPrueba')?.setValue( this.codigoCuadernoPruebaRespaldo );
  }

  private deshabilitarFormulario(): void {
    this.formAutoCitacionJuicio.get('fechaNotificacion')?.disable();
    this.formAutoCitacionJuicio.get('incorporaCuadernoPrueba')?.disable();
    this.formAutoCitacionJuicio.get('codigoCuadernoPrueba')?.disable();
    this.formAutoCitacionJuicio.get('observacion')?.disable();
  }

}
