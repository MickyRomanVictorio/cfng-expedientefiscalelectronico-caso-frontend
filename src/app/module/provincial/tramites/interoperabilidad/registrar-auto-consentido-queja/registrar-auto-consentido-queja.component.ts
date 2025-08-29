import {CommonModule, DatePipe} from '@angular/common';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output,} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {AcuerdoReparatorioInfo, CasoFiscal,} from '@interfaces/comunes/casosFiscales';
import {TramiteProcesal} from '@interfaces/comunes/tramiteProcesal';
import {
    DeclaraConsentidoRequerimiento
} from '@services/provincial/tramites/interoperabilidad/resolucion-auto/declara-consentido-requerimiento';
import {
    GuardarTramiteProcesalComponent
} from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import {NgxSpinnerService} from 'ngx-spinner';
import {CalendarModule} from 'primeng/calendar';
import {DialogService, DynamicDialogConfig, DynamicDialogRef,} from 'primeng/dynamicdialog';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {Subscription} from 'rxjs';
import {ESTADO_REGISTRO, IconAsset} from 'ngx-cfng-core-lib';
import {ButtonModule} from 'primeng/button';
import {
    MensajeCompletarInformacionComponent
} from '@components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import {RadioButtonModule} from "primeng/radiobutton";
import {DropdownModule} from "primeng/dropdown";
import {CheckboxModule} from "primeng/checkbox";
import {InputTextModule} from "primeng/inputtext";
import {NgxExtendedPdfViewerModule} from "ngx-extended-pdf-viewer";
import {
    MensajeInteroperabilidadPjComponent
} from "@components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component";
import {NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService} from '@ngx-cfng-core-modal/dialog';
import {DomSanitizer} from "@angular/platform-browser";
import {GestionCasoService} from "@services/shared/gestion-caso.service";
import {obtenerIcono} from '@utils/icon';
import {CmpLibModule, ctrlErrorMsg} from "ngx-mpfn-dev-cmp-lib";
import {AutoResuelveRequest} from "@interfaces/comunes/AutoResuelveRequerimientoRequest";
import {
    ResolucionAutoDeclaraConsentidoApelacionQuejaService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/declara-consentido-apelacion-queja";
import {
    RegistrarAutoConsentidoQuejaModalComponent
} from "@modules/provincial/tramites/interoperabilidad/registrar-auto-consentido-queja/registrar-auto-consentido-queja-modal/registrar-auto-consentido-queja-modal.component";

@Component({
    standalone: true,
    selector: 'app-resolucion-consentido-apelacion-queja',
    templateUrl: './registrar-auto-consentido-queja.component.html',
    styleUrls: ['./registrar-auto-consentido-queja.component.scss'],
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
        NgxExtendedPdfViewerModule,
        MensajeCompletarInformacionComponent,
        MensajeInteroperabilidadPjComponent,
        NgxCfngCoreModalDialogModule,
    ],
    providers: [DatePipe]
})
export class RegistrarAutoConsentidoQuejaComponent implements OnInit, OnDestroy {
    @Input() idCaso: string = '';
    @Input() numeroCaso: string = '';
    @Input() etapa: string = '';
    @Input() idEtapa: string = '';
    @Input() tramiteSeleccionado: TramiteProcesal | null = null;
    @Input() idDocumento: string[] = [];
    @Input() datosExtraFormulario: any;
    @Input() idEstadoTramite!: number;
    @Input() tramiteEnModoEdicion!: boolean;
    @Input() deshabilitado: boolean = false;
    @Input() idActoTramiteCaso!: string;

    @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();
    @Output() ocultarTitulo = new EventEmitter<(datos: any) => any>();

    public casoFiscal: CasoFiscal | null = null;
    public acuerdoReparatorioInfo: AcuerdoReparatorioInfo | null = null;
    public caracteresRestantes: number = 1000;
    public subscriptions: Subscription[] = [];
    public referenciaModal!: DynamicDialogRef;
    public idCuaderno: any;


    private selectedSujetos: any = [];
    private cantidad_maxima_carateres: number = 200;
    public urlPdf: any;
    protected formGroup!: FormGroup;
    public obtenerIcono = obtenerIcono
    private idEstadoRegistro: number = 0;
    soloLectura: boolean = false;
    public sujetosProcesales: any[] = [];
    esApelacion: boolean = false;
    esQueja: boolean = false;

    constructor(
        private datePipe: DatePipe,
        private formulario: FormBuilder,
        protected iconAsset: IconAsset,
        public _sanitizer: DomSanitizer,
        private spinner: NgxSpinnerService,
        private dialogService: DialogService,
        private readonly gestionCasoService: GestionCasoService,
        private resolucionAutoService: DeclaraConsentidoRequerimiento,
        private readonly modalDialogService: NgxCfngCoreModalDialogService,
        private ResolucionAutoDeclaraConsentidoApelacionQuejaService: ResolucionAutoDeclaraConsentidoApelacionQuejaService,
    ) {
    }

    ngOnInit(): void {
        this.formGroup = this.formulario.group({
            fechaNotificacion: new FormControl('', Validators.required),
            txtObservacion: new FormControl(''),
        });
        this.obtenerDatosFormulario();
        this.isDisabledForm();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    get validarForm(): boolean {
        return this.formGroup.valid && this.selectedSujetos && this.selectedSujetos.length > 0;
    }

    get botonValido(): boolean {
      return this.formularioValido || this.soloLectura;
    }

    /** GESTION DE ESTADOS **/

    get estadoRecibido(): boolean {
        return this.idEstadoTramite !== null && this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
    }

    get formularioValido(): boolean {
        return this.selectedSujetos && this.selectedSujetos && this.selectedSujetos.length > 0;
    }

    get tramiteEstadoRecibido(): boolean {
        return this.idEstadoRegistro === ESTADO_REGISTRO.RECIBIDO;
    }

    get tieneActoTramiteCasoDocumento(): boolean {
        return Boolean(this.idActoTramiteCaso);
    }

    protected errorMsg(ctrlName: any) {
      return ctrlErrorMsg(this.verificationForm().get(ctrlName));
    }

    /** VALIDACION DE FORMULARIO **/

    private isDisabledForm(): void {
      if (!this.tramiteEnModoEdicion || (this.estadoRecibido || this.soloLectura)) {
        this.formGroup.get('fechaNotificacion')!.disable();
        this.formGroup.get('txtObservacion')!.disable();
        this.soloLectura = true;
      } else {
        this.formGroup.get('fechaNotificacion')!.enable();
        this.formGroup.get('txtObservacion')!.enable();
      }
    }

    private verificationForm(): FormGroup {
      return new FormGroup({
        fechaNotificacion: new FormControl('', [Validators.required]),
        txtObservacion: new FormControl(null,
          [Validators.maxLength(200)]),
      });
    }

    protected actualizarContadorInputTextArea(e: Event): void {
      const value = (e.target as HTMLTextAreaElement).value;
      this.caracteresRestantes = this.cantidad_maxima_carateres - value.length;
    }

    /** LLAMADA A DATOS **/

    private obtenerDatosFormulario(): void {
        this.spinner.show();
        this.subscriptions.push(
            this.resolucionAutoService
                .obtenerAutoRequerimiento(this.idActoTramiteCaso)
                .subscribe({
                    next: (resp) => {
                        this.spinner.hide();
                        resp.fechaNotificacion ? this.formGroup.get('fechaNotificacion')!.setValue(new Date(resp.fechaNotificacion)) : null;
                        resp.observacion ? this.formGroup.get('txtObservacion')!.setValue(resp.observacion) : null;
                    },
                    error: (error) => {
                        this.spinner.hide();
                        console.error(error);
                    },
                })
        );
    }

    protected guardarFormulario(): void {
        this.spinner.show()
        let datosForm = this.formGroup.getRawValue();

        this.selectedSujetos = this.selectedSujetos.map((sujeto: { flConsentidoQueja: boolean; }) => ({
          ...sujeto,
          flConsentidoQueja: sujeto.flConsentidoQueja ? 1 : 0
        }));

        let request: AutoResuelveRequest = {
            operacion: 0,
            idCaso: this.idCaso,
            idActoTramiteCaso: this.idActoTramiteCaso,
            fechaNotificacion: this.datePipe.transform(datosForm.fechaNotificacion, 'dd/MM/yyyy')!,
            observacion: datosForm.txtObservacion,
            listSujetos: this.selectedSujetos
        }

        this.subscriptions.push(
            this.ResolucionAutoDeclaraConsentidoApelacionQuejaService.registrarTramiteQueja(request).subscribe({
                next: resp => {
                    this.spinner.hide()
                    this.gestionCasoService.obtenerCasoFiscal(this.gestionCasoService.casoActual.idCaso);
                    this.soloLectura = true;
                    this.formGroup.get('fechaNotificacion')!.disable();
                    this.formGroup.get('txtObservacion')!.disable();

                    this.modalDialogService.success(
                        'Datos guardado correctamente',
                        'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
                        'Aceptar'
                    );
                },
                error: (error) => {
                    this.spinner.hide()
                    console.log(error);
                }
            })
        );
    }

    /** LLAMADA A COMPONENTES EXTERNOS **/

    public openModalSelectTramite(): void {
        const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
            showHeader: false,
            data: {
                tipo: 2,
                idCaso: this.idCaso,
                idEtapa: this.idEtapa,
                idActoTramiteCaso: this.idActoTramiteCaso,
                idActoProcesal: 0
            }
        } as DynamicDialogConfig);

        const dialogRef = this.dialogService.dialogComponentRefMap.get(ref);
        dialogRef?.changeDetectorRef.detectChanges();

        const instance = dialogRef?.instance?.componentRef?.instance as GuardarTramiteProcesalComponent;
        instance?.onSave.subscribe((data) => {
            this.acuerdoReparatorioInfo = {
                idTramiteCaso: data.idTramiteCaso,
                idTramiteEstado: data.idTramiteCasoEstado
            };
            ref.close();
        });
    }

    public openModalSujetos(): void {
        const ref = this.dialogService.open(RegistrarAutoConsentidoQuejaModalComponent, {
            showHeader: false,
            data: {
                numeroCaso: this.numeroCaso,
                idCaso: this.idCaso,
                idActoTramiteCaso: this.idActoTramiteCaso,
                listSujetosProcesales: this.selectedSujetos,
                soloLectura: this.soloLectura,
            },
        });

        ref.onClose.subscribe((data) => {
            this.selectedSujetos = data
        });
    }

}
