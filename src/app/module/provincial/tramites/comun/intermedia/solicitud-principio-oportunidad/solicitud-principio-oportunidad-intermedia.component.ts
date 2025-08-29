import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {AlertaFormulario} from '@core/interfaces/comunes/alerta-formulario.interface';
import {DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef} from 'primeng/dynamicdialog';
import {RegistrarPlazoRequest} from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest';
import {NgxSpinnerService} from 'ngx-spinner';
import {DiligenciaPreliminar} from '@interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {DividerModule} from 'primeng/divider';
import {CheckboxModule} from 'primeng/checkbox';
import {MessagesModule} from 'primeng/messages';
import {ToastModule} from 'primeng/toast';
import {DialogModule} from 'primeng/dialog';
import {DropdownModule} from 'primeng/dropdown';
import {MenuModule} from 'primeng/menu';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FilterComponent} from '@components/generales/filter/filter.component';
import {MessageService} from 'primeng/api';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {AlertasTramiteComponent} from '@components/generales/alertas-tramite/alertas-tramite.component';
// import { StorageService } from '@core/services/shared/storage.service';
import {CasoFiscal} from '@core/interfaces/comunes/casosFiscales';
import {ESTADO_REGISTRO, TRAMITES} from 'ngx-cfng-core-lib';
import {
  SolicitudAcuerdoReparatorioService
} from '@services/provincial/tramites/comun/intermedia/solicitud-acuerdo-reparatorio.service';
import {ReusablesCargarDocumentos} from '@services/reusables/reusable-cargar-documentos.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertaModalComponent} from '@components/modals/alerta-modal/alerta-modal.component';
import {AlertaData} from '@interfaces/comunes/alert';

const {
  SOLICITUD_ACUERDO_REPARATORIA
} = TRAMITES

@Component({
  selector: 'app-solicitud-principio-oportunidad-intermedia',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DividerModule,
    CheckboxModule,
    MessagesModule,
    ToastModule,
    DialogModule,
    DropdownModule,
    MenuModule,
    DynamicDialogModule,
    FormsModule,
    ReactiveFormsModule,
    FilterComponent,
    AlertasTramiteComponent
  ],
  providers: [MessageService, DialogService],
  templateUrl: './solicitud-principio-oportunidad-intermedia.component.html',
  styleUrls: ['./solicitud-principio-oportunidad-intermedia.component.scss']
})
export class SolicitudPrincipioOportunidadIntermediaComponent implements OnInit {

  @Input() idCaso: string = ''
  @Input() esNuevo: boolean = false
  diligenciasService: any;
  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    console.log("entrooo idActoTramiteCaso",idActoTramiteCaso);
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso
      this.esNuevo ? this.alSeleccionar() : this.obtenerFormulario()
    }
  }

  @Output() datosFormulario = new EventEmitter<any>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  public refModal!: DynamicDialogRef
  public subscriptions: Subscription[] = []
  public alertas: AlertaFormulario[] = [];
  private _idActoTramiteCaso: string = ''
  public casoFiscal: CasoFiscal | null = null
  public plazoRequest: RegistrarPlazoRequest | null = null
  public esCasoReservado: boolean = false
  public datosDiligencia: DiligenciaPreliminar | null = null
  private idActoTramiteCasoEstado : string = '';
  public pdfSolicitudElevacionUrl: SafeResourceUrl = '';
  public solicitudElevacionNoEncontrada: boolean = false;

  private suscripciones: Subscription[] = [];

  private idActoTramite! : string

  constructor(
    private spinner: NgxSpinnerService,
    private dialogService: DialogService,
    // private storageService: StorageService, TODO
    private solicitudAcuerdoReparatorioService : SolicitudAcuerdoReparatorioService,
    private cargarDocumentosService: ReusablesCargarDocumentos,
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // TODO this.casoFiscal = JSON.parse(this.storageService.getItem(LOCALSTORAGE.CASO_OBJETO_KEY));
  }

  ngOnInit(): void {

    console.log('solicitud acuerdo reparatorio' + this._idActoTramiteCaso);

    console.log("caso fiscal",this.casoFiscal!.idActoTramiteCasoUltimo);
    console.log("caso fiscal idActoTramiteEstado",this.casoFiscal!.idActoTramiteEstado);

    this.obtenerIdSolicitudAcuerdoReparatoria();
    //this.peticionParaEjecutar.emit((datos: any) => this.diligenciasService.procesarDiligenciaPreliminar(datos))
  }

  get formularioValido(): boolean {
    return this.plazoRequest != undefined && this.plazoRequest != null;
  }

  get idActoTramiteCaso(): string {
    return this._idActoTramiteCaso
  }

  public alSeleccionar(): void {
    this.datosDiligencia = {
      plazosRequest: this.plazoRequest!,
      flCasoReservado: this.esCasoReservado,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso
    }
    this.datosFormulario.emit(this.plazoRequest)
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public obtenerFormulario() {
    this.diligenciasService.obtenerDiligenciaPreliminar(this._idActoTramiteCaso).subscribe({
      next: (resp:any) => {
        console.log(resp);
        if ( resp != undefined && resp != null){
          this.datosDiligencia = resp
          this.datosFormulario.emit(this.plazoRequest)
        }
      }
    })
  }

  get mostrarSolicitudAcuerdoReparatorio(): boolean {
    return  true //this._idActoTramiteCaso === SOLICITUD_ACUERDO_REPARATORIA
  }

  public obtenerIdSolicitudAcuerdoReparatoria() {
    console.log("caso fiscal 2",this.casoFiscal!.idActoTramiteCasoUltimo);

    if ( this.mostrarSolicitudAcuerdoReparatorio ) {
      //this.ocultarBotonTramite.emit(true)
      this.spinner.show()
      this.suscripciones.push(
         this.solicitudAcuerdoReparatorioService.obtenerAutoRequerimiento( this.casoFiscal!.idActoTramiteCasoUltimo! ).subscribe({
           next: solicitud => {

             if(solicitud.idEstadoRegistro == ESTADO_REGISTRO.RECIBIDO || solicitud.idEstadoRegistro == ESTADO_REGISTRO.FIRMADO){
             // if(solicitud.idEstadoRegistro == EstadoRegistro.RECIBIDO ){
               this.obtenerDocumentoSolicitudElevacionActuados(solicitud.idDocumento);
             }else{
               this.solicitudElevacionNoEncontrada = true;
               this.spinner.hide()
             }

           },
           error: error => {
             console.error(error)
             this.spinner.hide()
             this.solicitudElevacionNoEncontrada = true
             //this.ocultarTitulo.emit(true)
           }
         })
      )
    }
  }

  private obtenerDocumentoSolicitudElevacionActuados( idDocumento: string ): void {

    this.suscripciones.push(
      this.cargarDocumentosService.verPdf( idDocumento ).subscribe({
        next: resp => {
          this.spinner.hide()
          if ( resp.code === 200 ) {

            this.pdfSolicitudElevacionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64, ${String(resp.data[0].archivo)}`);
          } else if ( resp.code == 204 ) {
            //this.mensajeError('Aviso', 'Documento sin contenido');
            console.error('Documento sin contenido')
            //this.solicitudElevacionNoEncontrada = true;
          }
        },
        error: error => {
          console.error(error)
          this.spinner.hide()
        }
      })
    )
  }

  public verDocumentosIngresados(): void {
    this.router.navigate(['/app/documentos-ingresados'])
  }

  private mensajeError( mensaje: string, submensaje: string ) {
    this.dialogService.open( AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      }
    } as DynamicDialogConfig<AlertaData>)
  }
}


