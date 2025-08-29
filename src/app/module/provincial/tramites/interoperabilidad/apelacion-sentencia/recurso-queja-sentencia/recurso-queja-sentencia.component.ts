import {CommonModule, DatePipe} from '@angular/common';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output,} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {CasoFiscal,} from '@core/interfaces/comunes/casosFiscales';
import {TramiteProcesal} from '@core/interfaces/comunes/tramiteProcesal';
import {NgxSpinnerService} from 'ngx-spinner';
import {CalendarModule} from 'primeng/calendar';
import {DialogService, DynamicDialogRef,} from 'primeng/dynamicdialog';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {catchError, Observable, Subscription, tap, throwError} from 'rxjs';
import {ESTADO_REGISTRO} from 'ngx-cfng-core-lib';
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
import {TramiteService} from "@services/provincial/tramites/tramite.service";
import {
  RecursoApelacionService
} from "@services/provincial/tramites/comun/calificacion/recurso-apelacion/recurso-apelacion.service";
import {
  ResolucionAutoResuelveRequerimientoService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service";
import {FirmaIndividualService} from "@services/firma-digital/firma-individual.service";
import { SentenciaQuejaModalComponent } from './sujetos-queja-modal/sujetos-queja-modal.component';
import { RecursoApelacionSentenciaService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/recurso-apelacion-sentencia.service';

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
  selector: 'app-recurso-queja-sentencia',
  templateUrl: './recurso-queja-sentencia.component.html',
  styleUrls: ['./recurso-queja-sentencia.component.scss'],
  providers: [DialogService, DatePipe]
})

export class AppRecursoQuejaSentenciaComponent implements OnInit, OnDestroy {
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
  private flCheckModal: boolean = false;
private sujetosProcesalesEnviar: any[] = [];
  constructor(
    private formulario: FormBuilder,
    private dialogService: DialogService,
    public _sanitizer: DomSanitizer,
    private resolucionAutoResuelveRequerimientoService: ResolucionAutoResuelveRequerimientoService,

    private spinner: NgxSpinnerService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    protected tramiteService: TramiteService,
    private firmaIndividualService: FirmaIndividualService,
    private readonly recursoApelacionSentencia: RecursoApelacionSentenciaService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formulario.group({
      fechaNotificacion: new FormControl('', Validators.required),
      txtObservacion: new FormControl(''),
    });
    this.obtenerSujetosProcesales();
   // this.obtenerDatosFormulario();
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
 protected habilitarGuardar(estado: boolean): void {
    this.tramiteService.habilitarGuardar = estado;
  }
  protected habilitarFirmar(estado: boolean): void {
    this.tramiteService.habilitarFirmar = estado;
  }
  /** GESTION DE ESTADOS **/

  get estadoRecibido(): boolean {
    return this.idEstadoTramite !== null && this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  get iconButton(): string {
    return this.formularioValido || this.soloLectura ? 'success' : ''
  }

  get formularioValido(): boolean {
    return this.selectedSujetos && this.selectedSujetos.length > 0;
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoRegistro === ESTADO_REGISTRO.RECIBIDO;
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

    this.spinner.show();
    let request: any = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
    };
    
    return this.recursoApelacionSentencia.registrarTramite(request).pipe(
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
        this.tramiteService.habilitarGuardar = false;
        this.tramiteService.habilitarFirmar = true;
      }),
      catchError((error) => {
        this.spinner.hide();
        console.log(error);
        return throwError(() => error);
      })
    );
  }

  /** LLAMADA A COMPONENTES EXTERNOS **/

  public openModalSujetos(): void {
    const ref = this.dialogService.open(SentenciaQuejaModalComponent, {
      showHeader: false,
      data: {
        numeroCaso: this.numeroCaso,
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        listSujetosProcesales: this.sujetosProcesales,
        soloLectura: this.soloLectura
      },
    });

    ref.onClose.subscribe((data) => {
      console.log('Modal cerrado con datos:', data);
         if(data && data.button== 'aceptar'){
        this.sujetosProcesales = data.data;
        console.log('Sujetos procesales actualizados:', this.sujetosProcesales);
     //  this.flCheckModal = data.flCheckModal;
        this.validarHabilitarGuardar();
        this.tramiteService.formularioEditado = true;
      }
    });
  }

  private validarHabilitarGuardar(){
    this.selectedSujetos = this.sujetosProcesales.filter(item => item.flQueja === '1');
    console.log('Sujetos seleccionados:', this.selectedSujetos);
    if(this.selectedSujetos && this.selectedSujetos.length > 0){
      this.tramiteService.habilitarGuardar = true;
    }else{
      this.tramiteService.habilitarGuardar = false;
      this.tramiteService.habilitarFirmar = false;
    }

    if(this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO){
      this.soloLectura = true;
    }
  }
  private obtenerSujetosProcesales(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.recursoApelacionSentencia
        .obtenerResultadosSentencia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.sujetosProcesales = resp;
               this.validarHabilitarGuardar();
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
 
  }
}
