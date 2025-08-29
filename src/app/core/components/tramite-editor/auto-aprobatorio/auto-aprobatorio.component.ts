import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { AcuerdoReparatorioInfo, CasoFiscal, } from '@core/interfaces/comunes/casosFiscales';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { ResolucionAutoConsentidoService } from '@services/provincial/tramites/resolucion-auto-consentido.service';
import { ReusableEditarTramiteService } from '@services/reusables/reusable-editar-tramite.service';
import {
  GuardarTramiteProcesalComponent
} from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { DateMaskModule } from '@directives/date-mask.module';
import { DateFormatPipe } from '@pipes/format-date.pipe';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { CalendarModule } from 'primeng/calendar';
import { DialogService, DynamicDialogConfig, DynamicDialogRef, } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs';
import { AlertaData } from '@interfaces/comunes/alert';
import {
  ActaAcuerdoReparatorio,
  Acuerdos,
} from '@interfaces/provincial/tramites/acta-acuerdo/acta-acuerdo-reparatorio.interface';
import {
  AutoAprobatorioRequest
} from '@interfaces/provincial/tramites/comun/intermedia/auto-aprobatorio/auto-aprobatorio-request';
import { AcuerdoReparatorioService } from '@services/provincial/tramites/acuerdo-reparatorio.service';
import { AutoAprobatorioService } from '@services/provincial/tramites/comun/intermedia/auto-aprobatorio.service';
import { ResolucionAutoService } from '@services/provincial/tramites/comun/preparatoria/resolucion-auto.service';
import { CasoStorageService } from '@services/shared/caso-storage.service';
import { AcuerdoReparatorioComponent } from '@components/modals/acuerdo-reparatorio/acuerdo-reparatorio.component';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { ESTADO_REGISTRO } from 'ngx-cfng-core-lib';
import { Button } from 'primeng/button';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
    DateFormatPipe,
    DateMaskModule,
    InputTextareaModule,
    CmpLibModule,
    MensajeCompletarInformacionComponent,
  ],
  selector: 'app-auto-aprobatorio',
  templateUrl: './auto-aprobatorio.component.html',
  styleUrls: ['./auto-aprobatorio.component.scss'],
  providers: [DatePipe],
})
export class AutoAprobatorioComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() esNuevo: boolean = false;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteProcesalEnlace: string = '';
  @Input() idEstadoTramite: number = 0;
  @Input() flgIngresoTramite: string = '';
  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso;
    }
  }

  @Output() datosFormulario = new EventEmitter<Object>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  @ViewChild('botonGuardar') botonGuardar!: Button;
  enlaceModalDeshabilitado: boolean = false;

  public acuerdosDelAutoCargado: boolean = false;
  private _idActoTramiteCaso: string = '';
  public casoFiscal: CasoFiscal | null = null;
  public acuerdoReparatorioInfo: AcuerdoReparatorioInfo | null = null;
  public estadoTramite = ESTADO_REGISTRO.RECIBIDO;
  public formularioResolucionAutoConsentido!: FormGroup;
  public caracteresRestantes: number = 1000;
  public subscriptions: Subscription[] = [];
  public referenciaModal!: DynamicDialogRef;

  private datosForm: ActaAcuerdoReparatorio | null = null;
  private acuerdos: Acuerdos[] = [];
  private titulo: string = '';

  constructor(
    private formulario: FormBuilder,
    private spinner: NgxSpinnerService,
    private dialogService: DialogService,
    private datePipe: DatePipe,
    private editarTramiteService: ReusableEditarTramiteService,
    private resolucionAutoService: ResolucionAutoConsentidoService,
    private resolucionService: ResolucionAutoService,
    private acuerdosService: AcuerdoReparatorioService,
    private autoAprobatorioService: AutoAprobatorioService,
    private casoStorageService: CasoStorageService
  ) { }

  ngOnInit(): void {
    this.casoFiscal = null; //TODO: JSON.parse(this.storageService.getItem(LOCALSTORAGE.CASO_OBJETO_KEY));
    console.log('casoFiscal: ', this.casoFiscal);
    this.formularioResolucionAutoConsentido = this.formulario.group({
      fechaNotificacion: new FormControl('', Validators.required),
      observaciones: new FormControl('', [
        Validators.required,
        Validators.maxLength(1000),
      ]),
    });
    this.obternerResolucionAuto();
    this.isDisabledForm();
    this.titulo = 'ACUERDOS PARA EL PRINCIPIO DE OPORTUNIDAD';
  }

  ngOnDestroy(): void {
    console.log('ingreso');
  }

  get idActoTramiteCaso(): string {
    return this._idActoTramiteCaso;
  }

  get formularioValido(): boolean {
    if (this.acuerdos && this.acuerdos.length > 0) {
      this.acuerdosDelAutoCargado = true;
    } else {
      this.acuerdosDelAutoCargado = false;
    }
    return this.acuerdosDelAutoCargado;
  }

  get estadoRecibido(): boolean {
    return (
      this.idEstadoTramite ===
      ESTADO_REGISTRO.RECIBIDO
    );
  }

  get estadoPedienteCompletar(): boolean {
    return (
      this.idEstadoTramite ===
      ESTADO_REGISTRO.PENDIENTE_COMPLETAR
    );
  }

  get documentoIngresadoPorMPE(): boolean {
    return this.flgIngresoTramite === '1';
  }

  isDisabledForm(): void {
    console.log('estadoRecibido: ', this.estadoRecibido);
    if (this.estadoRecibido) {
      this.formularioResolucionAutoConsentido
        .get('fechaNotificacion')!
        .disable();
      this.formularioResolucionAutoConsentido.get('observaciones')!.disable();
    } else {
      this.formularioResolucionAutoConsentido
        .get('fechaNotificacion')!
        .enable();
      this.formularioResolucionAutoConsentido.get('observaciones')!.enable();
    }
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  public esCampoInvalido(nombreCampo: string): boolean {
    const control: any =
      this.formularioResolucionAutoConsentido.get(nombreCampo);
    return control.invalid && (control.touched || control.dirty);
  }

  public actualizarContadorInputTextArea(e: Event): void {
    const value = (e.target as HTMLTextAreaElement).value;
    this.caracteresRestantes = 1000 - value.length;
  }

  public obternerResolucionAuto(): void {
    this.spinner.show();
    this.subscriptions.push(
      this.resolucionAutoService
        .obtenerAutoRequerimiento(
          this.acuerdoReparatorioInfo != null
            ? this.casoFiscal!.idActoTramiteCasoUltimo!
            : this.idActoTramiteProcesalEnlace
        )
        .subscribe({
          next: (resp) => {
            this.spinner.hide();
            console.log(resp);
            const datos = {
              idActoTramiteCaso: resp.idActoTramiteCaso,
              idEstadoRegistro: resp.idEstadoRegistro,
              idDocumento: resp.idDocumento,
            };
            this.resolucionService.sendData(datos);
          },
          error: (error) => {
            this.spinner.hide();
            console.error(error);
          },
        })
    );
  }

  public guardarResolucion(): void {
    if (this.formularioResolucionAutoConsentido.valid) {
      console.log('Formulario válido');
      this.spinner.show();
      const fechaNotificacion =
        this.formularioResolucionAutoConsentido.get('fechaNotificacion')!.value;
      const observaciones =
        this.formularioResolucionAutoConsentido.get('observaciones')!.value;
      const fechaNotificacionFormat = this.datePipe.transform(
        fechaNotificacion,
        'dd/MM/yyyy'
      )!;
      let request: AutoAprobatorioRequest = {
        idCaso: this.idCaso,
        idActoTramiteCaso:
          this.acuerdoReparatorioInfo != null
            ? this.casoFiscal!.idActoTramiteCasoUltimo!
            : this.idActoTramiteProcesalEnlace,
        acuerdos: this.acuerdos,
        fechaNotificacion: fechaNotificacionFormat,
        observaciones: observaciones,
      };

      this.subscriptions.push(
        this.autoAprobatorioService.guardarAutoAprobatorio(request).subscribe({
          next: async (resp) => {
            if (resp.code === '0') {
              this.deshabilitarDespuesGuardar();
              await this.casoStorageService.actualizarInformacionCasoFiscal(
                this.idCaso
              );
              this.alertaTramiteRegistrado(
                this.tramiteSeleccionado
                  ? this.tramiteSeleccionado.nombreTramite
                  : ''
              );
            }
          },
          error: (error) => {
            this.spinner.hide();
            console.error(error);
          },
        })
      );
    } else {
      this.formularioResolucionAutoConsentido.markAllAsTouched();
    }
  }

  public deshabilitarDespuesGuardar() {
    this.formularioResolucionAutoConsentido.get('fechaNotificacion')!.disable();
    this.formularioResolucionAutoConsentido.get('observaciones')!.disable();
    this.botonGuardar.disabled = true;
    this.enlaceModalDeshabilitado = true;
  }

  public marcarFechaComoDirty(): void {
    const fechaNotificacionControl =
      this.formularioResolucionAutoConsentido.get('fechaNotificacion');
    if (fechaNotificacionControl) {
      fechaNotificacionControl.markAsDirty();
    }
  }

  public cargarModalAcuerdosDelAuto(): void {
    const ref = this.dialogService.open(AcuerdoReparatorioComponent, {
      showHeader: false,
      data: {
        caso: this.casoFiscal!.numeroCaso,
        idCaso: this.casoFiscal!.idCaso,
        idActoTramiteCaso:
          this.acuerdoReparatorioInfo != null
            ? this.casoFiscal!.idActoTramiteCasoUltimo
            : this.idActoTramiteProcesalEnlace,
        titulo: this.titulo,
        listaAcuerdos: this.datosForm?.acuerdos,
        descripcion: '',
      },
    });

    ref.onClose.subscribe((data) => {
      this.acuerdos = data;
      //this.alSeleccionar();
    });
  }

  public alSeleccionar(): void {
    this.datosForm = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      acuerdos: this.acuerdos,
    };
    this.datosFormulario.emit(this.datosForm);
  }

  openModalSelectTramite(): void {
    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      width: '800px',
      showHeader: false,
      data: {
        tipo: 1,
        idCaso: this.idCaso,
        idEtapa: this.idEtapa,
        idActoProcesal: 0,
      },
    } as DynamicDialogConfig);
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
    dialogRef?.changeDetectorRef.detectChanges();
    const instance = dialogRef?.instance?.componentRef
      ?.instance as GuardarTramiteProcesalComponent;
    instance?.onSave.subscribe((data) => {
      console.log(data);
      this.acuerdoReparatorioInfo = {
        idTramiteCaso: data.idTramiteCaso,
        idTramiteEstado: data.idTramiteCasoEstado,
      };
      ref.close();
    });
  }

  private alertaTramiteRegistrado(nombreTramite: string) {
    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '50%',
      showHeader: false,
      data: {
        icon: 'success',
        confirmButtonText: 'Ok',
        title: `Se registró correctamente la información de `,
        description: nombreTramite,
      },
    } as DynamicDialogConfig<AlertaData>);

    this.referenciaModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
        }
      },
    });
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
}
