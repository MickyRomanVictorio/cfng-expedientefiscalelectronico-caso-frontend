import {CommonModule, DatePipe} from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {CasoFiscal,} from '@core/interfaces/comunes/casosFiscales';
import {TramiteProcesal} from '@core/interfaces/comunes/tramiteProcesal';
import {NgxSpinnerService} from 'ngx-spinner';
import {CalendarModule} from 'primeng/calendar';
import {DialogService, DynamicDialogRef,} from 'primeng/dynamicdialog';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {catchError, Observable, Subscription, tap, throwError} from 'rxjs';
import {ESTADO_REGISTRO, ACTOS, IconAsset} from 'ngx-cfng-core-lib';
import {ButtonModule} from 'primeng/button';
import {RadioButtonModule} from "primeng/radiobutton";
import {DropdownModule} from "primeng/dropdown";
import {CheckboxModule} from "primeng/checkbox";
import {InputTextModule} from "primeng/inputtext";
import {NgxExtendedPdfViewerModule} from "ngx-extended-pdf-viewer";
import {NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService} from '@ngx-cfng-core-modal/dialog';
import {DomSanitizer} from "@angular/platform-browser";
import {obtenerIcono} from '@utils/icon';
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {
  SujetosApelacionModalComponent
} from "@modules/provincial/tramites/comun/cuadernos-incidentales/recurso-apelacion/sujetos-apelacion-modal/sujetos-apelacion-modal.component";
import {TramiteService} from "@services/provincial/tramites/tramite.service";
import {
  RecursoApelacionService
} from "@services/provincial/tramites/comun/calificacion/recurso-apelacion/recurso-apelacion.service";
import {
  ResolucionAutoResuelveRequerimientoService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service";
import {FirmaIndividualService} from "@services/firma-digital/firma-individual.service";
import { ValidacionTramite } from '@interfaces/comunes/crearTramite';

@Component({
  standalone: true,
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
    NgxCfngCoreModalDialogModule,
  ],
  selector: 'app-recurso-apelacion',
  templateUrl: './recurso-apelacion.component.html',
  styleUrls: ['./recurso-apelacion.component.scss'],
  providers: [DialogService, DatePipe]
})

export class RecursoApelacionComponent implements OnInit, OnDestroy {
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
  @Input() validacionTramite!: ValidacionTramite;

  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();
  @Output() ocultarTitulo = new EventEmitter<(datos: any) => any>();

  public casoFiscal: CasoFiscal | null = null;
  public caracteresRestantes: number = 1000;
  public subscriptions: Subscription[] = [];
  public referenciaModal!: DynamicDialogRef;
  public idCuaderno: any;
  private selectedSujetos: any = [];
  public urlPdf: any;
  protected formGroup!: FormGroup;
  public obtenerIcono = obtenerIcono
  private idEstadoRegistro: number = 0;
  soloLectura: boolean = false;
  public sujetosProcesales: any[] = [];
  private sujetosProcesalesEnviar: any[] = [];

  constructor(
    private formulario: FormBuilder,
    public _sanitizer: DomSanitizer,
    protected iconAsset: IconAsset,
    private spinner: NgxSpinnerService,
    private dialogService: DialogService,
    protected tramiteService: TramiteService,
    private firmaIndividualService: FirmaIndividualService,
    private recursoApelacionService: RecursoApelacionService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private resolucionAutoResuelveRequerimientoService: ResolucionAutoResuelveRequerimientoService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formulario.group({
      fechaNotificacion: new FormControl('', Validators.required),
      txtObservacion: new FormControl(''),
    });
    this.obtenerDatosFormulario();
    this.peticionParaEjecutar.emit(() => this.guardarFormulario() );
    this.subscriptions.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.soloLectura = true;
          }
        }
      )
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  set habilitarGuardar(estado: boolean) {
    this.tramiteService.habilitarGuardar = estado;
  }

  set habilitarFirmar(estado: boolean) {
    this.tramiteService.habilitarFirmar = estado;
  }
  /** GESTION DE ESTADOS **/

  get estadoRecibido(): boolean {
    return this.idEstadoTramite !== null && this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  get botonValido(): boolean {
    return this.formularioValido || this.soloLectura;
  }

  get formularioValido(): boolean {
    return this.selectedSujetos && this.selectedSujetos && this.selectedSujetos.length > 0;
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoRegistro === ESTADO_REGISTRO.RECIBIDO;
  }

  get verSujetos(): boolean {
    const actos: string[] = [ACTOS.APELACION_PROCESO_INMEDIATO,
      ACTOS.APELACION_TERMINACION_ANTICIPADA,
      ACTOS.APELACION_PRINCIPIO_OPORTUNIDAD,
      ACTOS.APELACION_ACUERDO_REPARATORIO];
    return !actos.includes(this.validacionTramite.idActoSeleccionado);
  }

  /** LLAMADA A DATOS **/
  private obtenerDatosFormulario(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 1)
        .subscribe({
          next: (resp) => {
            this.sujetosProcesales = resp;
            this.validarHabilitarGuardar();
            this.tramiteService.formularioEditado = true;

          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  public guardarFormulario(): Observable<any> {
    this.sujetosProcesalesEnviar = this.sujetosProcesales.filter(
      (sujeto) => sujeto.flApelacion === '1'
    );
    this.spinner.show();
    let request: any = {
      operacion: 0,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      listSujetos: this.sujetosProcesalesEnviar,
    };
    return this.recursoApelacionService.registrar(request).pipe(
      tap((resp) => {
        this.tramiteService.formularioEditado = false;
        this.spinner.hide();
        this.modalDialogService.success(
          'Datos guardados correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' +
          this.tramiteSeleccionado?.nombreTramite +
          '</b>.',
          'Aceptar'
        );
        this.tramiteService.formularioEditado = false;
        this.habilitarGuardar = false;
        this.habilitarFirmar = true;
      }),
      catchError((error) => {
        this.spinner.hide();
        return throwError(() => error);
      })
    );
  }

  /** LLAMADA A COMPONENTES EXTERNOS **/

  public openModalSujetos(): void {
    const ref = this.dialogService.open(SujetosApelacionModalComponent, {
      showHeader: false,
      data: {
        numeroCaso: this.numeroCaso,
        idCaso: this.idCaso,
        listSujetosProcesales: this.sujetosProcesales,
        soloLectura: this.soloLectura
      },
    });

    ref.onClose.subscribe((data) => {
      console.log('Modal cerrado con datos:', data);
      if(data && data.button && data.button == 'aceptar'){
        this.sujetosProcesales = data.data;
        this.validarHabilitarGuardar();
        this.tramiteService.formularioEditado = true;
      }
    });
  }

  private validarHabilitarGuardar(): void {
    this.selectedSujetos = this.sujetosProcesales.filter(item => item.flApelacion === '1');
    if (!this.verSujetos || (this.selectedSujetos && this.selectedSujetos.length > 0)) {
      this.habilitarGuardar = true;
    } else {
      this.habilitarGuardar = false;
      this.habilitarFirmar = false;
    }

    if (this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO) {
      this.soloLectura = true;
    }
  }
}
