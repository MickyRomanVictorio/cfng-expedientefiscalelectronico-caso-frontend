import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AcuerdoReparatorioInfo, CasoFiscal, } from '@core/interfaces/comunes/casosFiscales';
import {
  TramitePendieteResoculicion
} from '@interfaces/provincial/tramites/comun/calificacion/resolucion-auto-preparatorio/resolucion-auto-preparatorio.interface';
import { ReusableEditarTramiteService } from '@services/reusables/reusable-editar-tramite.service';
import {
  GuardarTramiteProcesalComponent
} from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { CmpLibModule, ctrlErrorMsg } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogConfig, DynamicDialogRef, } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subscription } from 'rxjs';
import { SelectActoProcesalRequest } from '@interfaces/provincial/bandeja-tramites/SelectedActoTramiteRequest';
import { AlertaData } from '@interfaces/comunes/alert';
import {
  SelectedActoTramiteProcesalService
} from '@services/provincial/bandeja-tramites/SeleccionarTramiteProcesalBehavior';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { ESTADO_REGISTRO } from 'ngx-cfng-core-lib';

@Component({
  standalone: true,
  selector: 'app-resolucion-auto-aprobatorio',
  templateUrl: './resolucion-auto-aprobatorio.component.html',
  styleUrls: ['./resolucion-auto-aprobatorio.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RadioButtonModule,
    DropdownModule,
    CheckboxModule,
    InputTextareaModule,
    InputTextModule,
    ButtonModule,
    CalendarModule,
    CmpLibModule,
  ],
  providers: [DatePipe],
})
export class ResolucionAutoAprobatorioComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() idActoTramiteProcesalEnlace: string = '';
  @Input() idEstadoTramite: number = 0;
  @Input() flgIngresoTramite: string = '';
  @Input() tramiteSeleccionado!: string;

  @Output() datosFormulario = new EventEmitter<Object>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  public referenciaModal!: DynamicDialogRef;
  public acuerdoReparatorioInfo: AcuerdoReparatorioInfo | null = null;
  public casoFiscal: CasoFiscal | null = null;
  public urlPdf: any;
  public estadoTramite = ESTADO_REGISTRO.RECIBIDO;
  public formResolucionAutoPreparatorio!: FormGroup;
  public etapaTramini: number = 3;
  public tipoResultado = [
    { name: 'Fundado', key: 'F' },
    { name: 'Infundado', key: 'I' },
  ];
  suscriptions: Subscription[] = [];
  public selectActoProcesalRequest!: SelectActoProcesalRequest;

  constructor(
    private formulario: FormBuilder,
    private dialogService: DialogService,
    public _sanitizer: DomSanitizer,
    private editarTramiteService: ReusableEditarTramiteService,
    private selectedActoTramiteProcesalService: SelectedActoTramiteProcesalService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.casoFiscal = null; //TODO: JSON.parse(this.storageService.getItem(LOCALSTORAGE.CASO_OBJETO_KEY));
    this.formResolucionAutoPreparatorio = this.formulario.group({
      fechaNotificacion: new FormControl('', Validators.required),
      txtObservacion: [''],
      rbTipoResultado: new FormControl(null, [Validators.required]),
    });

    this.selectedActoTramiteProcesalService.getIdTramite().subscribe({
      next: (respose) => {
        this.selectActoProcesalRequest = respose!;
      },
    });
    this.isDisabledForm();
  }

  ngOnDestroy(): void { }

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
    if (this.estadoRecibido) {
      this.formResolucionAutoPreparatorio.get('fechaNotificacion')!.disable();
      this.formResolucionAutoPreparatorio.get('txtObservacion')!.disable();
      this.formResolucionAutoPreparatorio.get('rbTipoResultado')!.disable();
    } else {
      this.formResolucionAutoPreparatorio.get('fechaNotificacion')!.enable();
      this.formResolucionAutoPreparatorio.get('txtObservacion')!.enable();
      this.formResolucionAutoPreparatorio.get('rbTipoResultado')!.enable();
    }
  }

  public enviarFormulario(): void {
    if (this.formResolucionAutoPreparatorio.valid) {
      console.log('form info...');
    } else {
      console.log(
        'El formulario no es válido. Por favor, complete los campos requeridos.'
      );
    }
  }

  get validarForm(): boolean {
    return this.formResolucionAutoPreparatorio.valid;
  }

  public counterReportChar(): number {
    return this.formResolucionAutoPreparatorio.get('txtObservacion')!.value !==
      null
      ? this.formResolucionAutoPreparatorio.get('txtObservacion')!.value.length
      : 0;
  }

  errorMsg(ctrlName: any) {
    return ctrlErrorMsg(this.verificationForm().get(ctrlName));
  }

  public verificationForm(): FormGroup {
    return new FormGroup({
      fechaNotificacion: new FormControl('', [Validators.required]),
    });
  }

  public guardarTramitePendiente(): void {
    this.spinner.show();
    let datosForm = this.formResolucionAutoPreparatorio.getRawValue();
    let request: TramitePendieteResoculicion = {
      operacion: this.acuerdoReparatorioInfo != null ? 0 : 1, //0 = seleccionó otro tramite sino 1
      idCaso: this.casoFiscal!.idCaso,
      idTramiteCasoUltimo:
        this.acuerdoReparatorioInfo == null
          ? this.casoFiscal!.idActoTramiteCasoUltimo
          : this.idActoTramiteProcesalEnlace,
      idTramiteCasoEstado:
        this.acuerdoReparatorioInfo == null
          ? this.casoFiscal!.idActoTramiteEstado
          : this.acuerdoReparatorioInfo.idTramiteEstado,
      fechaNotificacion: this.datePipe.transform(
        datosForm.fechaNotificacion,
        'dd/MM/yyyy'
      )!,
      tipoResultado: datosForm.rbTipoResultado == 'F' ? 1 : 0,
      observacion: datosForm.txtObservacion,
    };
    this.suscriptions.push(
      this.editarTramiteService
        .registrarTramitePendienteResolucion(request)
        .subscribe({
          next: (resp) => {
            this.spinner.hide();
            this.alertaTramiteReigsrado(
              this.selectActoProcesalRequest.tramiteNombre
            );
            console.log(resp.data);
          },
          error: (error) => {
            this.spinner.hide();
            console.log(error);
          },
        })
    );
  }

  private alertaTramiteReigsrado(nombreTramite: string) {
    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'success',
        confirmButtonText: 'Ok',
        title: `Se registró correctamente la información de la`,
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

  openModalSelectTramite(): void {
    console.log(
      'this.idCaso: ' + this.idCaso + ' this.idEtapa: ' + this.idEtapa
    );
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
      this.acuerdoReparatorioInfo = {
        idTramiteCaso: data.idTramiteCaso,
        idTramiteEstado: data.idTramiteCasoEstado,
      };
      console.log(data);
      ref.close();
    });
  }
}
