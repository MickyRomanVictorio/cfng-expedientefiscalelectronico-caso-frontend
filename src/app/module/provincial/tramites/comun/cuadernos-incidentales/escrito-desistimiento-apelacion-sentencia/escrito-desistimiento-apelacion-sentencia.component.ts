import {CommonModule, DatePipe} from '@angular/common';
import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output,} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule,} from '@angular/forms';
import {TramiteProcesal} from '@core/interfaces/comunes/tramiteProcesal';
import {NgxSpinnerService} from 'ngx-spinner';
import {CalendarModule} from 'primeng/calendar';
import {DialogService,} from 'primeng/dynamicdialog';
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
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {TramiteService} from "@services/provincial/tramites/tramite.service";
import {SujetosApelacionSentencia} from "@components/modals/sujetos-apelacion-sentencia/sujetos-apelacion-sentencia";
import {
  PestanaApelacionService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/pestana-apelacion.service";

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
  templateUrl: './escrito-desistimiento-apelacion-sentencia.component.html',
  styleUrls: ['./escrito-desistimiento-apelacion-sentencia.component.scss'],
  providers: [DialogService, DatePipe]
})

export class EscritoDesistimientoApelacionSentenciaComponent implements OnInit, OnDestroy {
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

  private suscripciones: Subscription[] = [];
  private idEstadoRegistro: number = 0;
  protected formGroup!: FormGroup;
  protected soloLectura: boolean = false;
  protected flCheckModal: boolean = false;
  protected nuPestana: string = '';

  private dialogService = inject(DialogService);
  private spinner = inject(NgxSpinnerService);
  protected tramiteService = inject(TramiteService);
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly pestanaApelacionService = inject(PestanaApelacionService);

  constructor() {}

  ngOnInit(): void {
    this.obtenerDatosFormulario();
    this.peticionParaEjecutar.emit(() => this.guardarFormulario() );
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((s) => s.unsubscribe());
  }

  /** GESTION DE ESTADOS **/

  get estadoRecibido(): boolean {
    return this.idEstadoTramite !== null && this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  get iconButton(): string {
    return this.flCheckModal || this.soloLectura ? 'success' : 'error'
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoRegistro === ESTADO_REGISTRO.RECIBIDO;
  }

  /** LLAMADA A DATOS **/
  private obtenerDatosFormulario() {
    this.suscripciones.push(
      this.pestanaApelacionService
        .obtenerTramiteInteroperabilidad(this.idActoTramiteCaso)
        .subscribe({
          next: (data) => {
            this.flCheckModal = data.nuSujetosGuardado > 0;
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
      idActoTramiteCaso: this.idActoTramiteCaso
    };
    return this.pestanaApelacionService.registrarTramiteInteroperabilidad(request).pipe(
      tap(() => {
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
    let dataModal = {
      showHeader: false,
      data: {
        numeroCaso: this.numeroCaso,
        nuPestana: this.nuPestana,
        idActoTramiteCaso: this.idActoTramiteCaso,
        soloLectura: !this.tramiteEnModoEdicion,
        configuracion: {
          titulo: 'Seleccionar recurso de desistimiento de apelación de sentencia',
          subtitulo: 'Seleccione los sujetos procesales a los que registrará el recurso de desistimiento de apelación de sentencia',
          mensaje_informativo: {
            mostrar: false,
            descripcion: null,
            campo_prerequisito: null,
            valor_prerequisito: 0
          },
          posicion_petitorio: 'bajo_texto',
          columnas: [
            {
              nombre_campo: 'checkResultadoEscritoDesistimientoSeleccionar',
              mostrar_campo: 'checkResultadoEscritoDesistimientoMostrar',
              mostrar: true,
              editar: true
            }
          ]
        }
      }
    };
    let ref = this.dialogService.open(SujetosApelacionSentencia, dataModal);
    ref.onClose.subscribe((data: any) => {
      if (data && data.flCheckModal) {
        this.flCheckModal = data.flCheckModal;
        this.validarHabilitarGuardar();
      }
    });
  }

  private validarHabilitarGuardar(){
    this.tramiteService.formularioEditado = true;
    this.tramiteService.habilitarGuardar = this.flCheckModal;

    if(this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO){
      this.soloLectura = true;
    }
  }

}
