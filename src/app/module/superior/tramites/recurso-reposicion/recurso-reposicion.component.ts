import { ResolucionAutoResuelveRecursoReposicionService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-recurso-reposicion.service';
import { AutoResuelveRecursoReposicionComponent } from './../../../provincial/tramites/interoperabilidad/auto-resuelve-recurso-reposicion/auto-resuelve-recurso-reposicion.component';
import {CommonModule, DatePipe} from '@angular/common';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output,} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {CasoFiscal,} from '@core/interfaces/comunes/casosFiscales';
import {TramiteProcesal} from '@core/interfaces/comunes/tramiteProcesal';
import {NgxSpinnerService} from 'ngx-spinner';
import {CalendarModule} from 'primeng/calendar';
import {DialogService, DynamicDialogRef,} from 'primeng/dynamicdialog';
import {InputTextareaModule} from 'primeng/inputtextarea';
import { catchError, Observable, Subscription, tap, throwError, map } from 'rxjs';
import {ESTADO_REGISTRO} from 'ngx-cfng-core-lib';
import {ButtonModule} from 'primeng/button';
import {
  MensajeCompletarInformacionComponent
} from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
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
import { SujetosReposicionModalComponent } from './sujetos-reposicion-modal/sujetos-reposicion-modal.component';
import { PestanaApelacionSujetoService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/pestana-apelacion-sujeto.service';
import { ResolucionAutoResuelveCalificacionSuperiorService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-calificacion-superior.service';

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
    MensajeCompletarInformacionComponent,
    MensajeInteroperabilidadPjComponent,
    NgxCfngCoreModalDialogModule,
  ],
  selector: 'app-recurso-reposicion',
  templateUrl: './recurso-reposicion.component.html',
  providers: [DialogService, DatePipe]
})

export class RecursoReposicionComponent implements OnInit, OnDestroy {
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

  constructor(
    private formulario: FormBuilder,
    private dialogService: DialogService,
    public _sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    protected tramiteService: TramiteService,
    private pestanaApelacionSujetoService: PestanaApelacionSujetoService,
    private resolucionAutoResuelveRecursoReposicionService:ResolucionAutoResuelveRecursoReposicionService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formulario.group({
      fechaNotificacion: new FormControl('', Validators.required),
      txtObservacion: new FormControl(''),
    });
    this.obtenerDatosFormulario();
    this.peticionParaEjecutar.emit(() => this.guardarFormulario() );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  /** GESTION DE ESTADOS **/

  get estadoRecibido(): boolean {
    return this.idEstadoTramite !== null && this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  get iconButton(): string {
    return this.formularioValido || this.soloLectura ? 'success' : 'error'
  }

  get formularioValido(): boolean {
    return this.selectedSujetos && this.selectedSujetos && this.selectedSujetos.length > 0;
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoRegistro === ESTADO_REGISTRO.RECIBIDO;
  }

  /** LLAMADA A DATOS **/
  private obtenerDatosFormulario(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.pestanaApelacionSujetoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 1)
        .subscribe({
          next: (resp) => {
            console.log("resssss",resp);
            this.sujetosProcesales = resp.filter((sujeto: any) => sujeto.noTipoRespuestaCalificacionInstancia2=="INADMISIBLE")

            this.validarHabilitarGuardar();
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
      operacion: 0,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      listSujetos: this.sujetosProcesales,
    };
    return this.resolucionAutoResuelveRecursoReposicionService.registrarTramiteRecurso(request).pipe(
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
    const ref = this.dialogService.open(SujetosReposicionModalComponent, {
      showHeader: false,
      data: {
        numeroCaso: this.numeroCaso,
        idCaso: this.idCaso,
        listSujetosProcesales: this.sujetosProcesales,
        soloLectura: this.soloLectura
      },
    });

    ref.onClose.subscribe((data) => {
      if(data && data.button && data.button == 'aceptar'){
        this.sujetosProcesales = data.data;
        console.log("sujetos",this.sujetosProcesales);
        this.validarHabilitarGuardar();
      }
    });
  }

  private validarHabilitarGuardar(){
    this.selectedSujetos = this.sujetosProcesales.filter(item => item.flReposicion === '1');
    if(this.selectedSujetos && this.selectedSujetos.length > 0){
      this.tramiteService.formularioEditado = true;
      this.tramiteService.habilitarGuardar = true;
    }else{
      this.tramiteService.formularioEditado = true;
      this.tramiteService.habilitarGuardar = false;
    }

    if(this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO){
      this.soloLectura = true;
    }
  }

}
