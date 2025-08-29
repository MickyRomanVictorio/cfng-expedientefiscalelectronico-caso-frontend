import { JsonPipe, NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ReusableBuscarTramites } from '@services/reusables/reusable-buscar-tramites.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropdownModule } from 'primeng/dropdown';
import { MaestroService } from '@services/shared/maestro.service';
import { AdjuntarDocumentoComponent } from '@components/adjuntar-documento/adjuntar-archivo.component';
import { archivoFileToB64, formatoPesoArchivo } from '@utils/file';
import { CarpetaAuxiliarCargoService } from '@services/provincial/carpteta-auxiliar/carpeta-auxiliar-cargo.service';
import { VisorPdfFrameComponent } from '@components/generales/visor-pdf-frame/visor-pdf-frame.component';
import { AdjuntoData } from '@components/generales/visor-pdf-frame/adjunto-data.interface';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule, ctrlErrorMsg } from 'ngx-mpfn-dev-cmp-lib';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { BACKEND } from '@environments/environment';
import { SLUG_CARGO_DIGITALIZADO, SLUG_COMPONENTE_MESA, SLUG_MOTIVO_COPIA, SLUG_SIGN } from '@constants/mesa-unica-despacho';
import { capitalized } from '@utils/string';
import { TokenService } from '@services/shared/token.service';
import { CasoCarpetaAuxiliar } from '@components/modals/visor-efe-modal/carpeta-auxiliar/carpeta-auxiliar.component';
import { BuscarTramitesModalComponent } from '@components/modals/buscar-tramites-modal/buscar-tramites-modal.component';
import { FirmaDigitalClienteComponent, FirmaDigitalClienteService, FirmaInterface } from 'ngx-cfng-core-firma-digital';
import { RepositorioDocumentoService } from '@core/services/generales/repositorio-documento.service';
import { Expediente } from '@utils/expediente';
import { Subscription } from 'rxjs';
import { AtenderDocumentosService } from '@services/provincial/documentos-ingresados/atender-documentos.service';

@Component({
  selector: 'modal-subir-cargo',
  standalone: true,
  imports: [
    FirmaDigitalClienteComponent,
    VisorPdfFrameComponent,
    ButtonModule,
    NgClass,NgIf,
    DropdownModule,
    AdjuntarDocumentoComponent,
    CmpLibModule,
    CalendarModule,
    RadioButtonModule,
    TooltipModule,
    JsonPipe,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './modal-subir-cargo.component.html',
  styleUrls: ['./modal-subir-cargo.component.scss'],
  providers:[FirmaDigitalClienteService]
})

export class ModalSubirCargoComponent implements OnInit {

  protected archivoAdjunto: AdjuntoData = {
    id: '',
    preNamePdf: 'Sin vista previa de documento',
    urlPdf: null,
    namePdf: '',
    isSign: false,
    base64: null,
    fromServer: false
  };
  protected obtenerIcono = obtenerIcono;
  protected formatoPesoArchivo = formatoPesoArchivo;
  protected archivoSeleccionado=false;
  protected subscriptions: Subscription[] = [];
  protected archivos:any[]=[];
  protected form!: FormGroup;
  protected documentos:any[] = [];
  protected cargoForm = {
    tipoCopia:-1,
    recepcionFecha:null,
    recepcionHora:null
  };
  proceso: number = 0;
  subtipo!: string;
  etapa!: string;
  private usuario:any;
  protected caso:Expediente | undefined = undefined;

  constructor(
    protected _sanitizer: DomSanitizer,
    protected dialogRef: DynamicDialogRef,
    private formBuilder: FormBuilder,
    private atenderDocumentoService: AtenderDocumentosService,
    private dialogConfig: DynamicDialogConfig,
    private buscarTramitesService: ReusableBuscarTramites,
    private spinner: NgxSpinnerService,
    private sanitizer: DomSanitizer,
    public carpetaAuxiliarCargoService : CarpetaAuxiliarCargoService,
    private firmaDigitalClienteService:FirmaDigitalClienteService,
    private maestroService : MaestroService,
    private tokenService: TokenService,
    private dialogService: DialogService,
    private repositorioDocumentoService: RepositorioDocumentoService
  ) {
    this.usuario = this.tokenService.getDecoded();
    this.repositorioDocumentoService.componenteActivo = SLUG_COMPONENTE_MESA.PRESENTAR_DOCUMENTO;
  }

  ngOnInit() {
    this.caso = this.dialogConfig.data;
    this.obtenerEtapa().then();
    this.form = this.formBuilder.group({
      etapa: [ {value:'', disabled:true} ],//this.dialogConfig.data.etapa
      actoProcesal: [ {value:'', disabled:true}, Validators.required] ,
      tramite: [ {value:'', disabled:true} ],//"Oficio"
      idDocumento:[ {value:'', disabled:false} ],
    });
    //
    //Observador de la firma
    this.firmaDigitalClienteService.processSignClient.subscribe((data: any) => {
      if ( SLUG_COMPONENTE_MESA.PRESENTAR_DOCUMENTO === this.repositorioDocumentoService.componenteActivo) {
        if (data === '0') {
          this.archivos[0].isSign = true;
          this.mostrarArchivoFirmado();
        }
        if (data === '1') {
          this.spinner.hide();
          alert(SLUG_SIGN.CANCEL);
        }
      }
    })
    //
    /*this.maestroService.obtenerActosProcesalesAnt(this.caso.etapaId).subscribe({
      next: resp => {
        console.log(resp.data);
      },
      error: error => {
        console.log(error)
      }
    });*/
  }

  protected get numeroCaso(): string {
    return this.caso?.numeroCaso ?? '';
  }

  obtenerEtapa() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.atenderDocumentoService
          .obtenerEtapa(this.caso?.idCaso ?? '')
          .subscribe({
            next: (resp) => {
              this.proceso = resp.proceso;
              this.subtipo = resp.subtipo;
              this.etapa = resp.etapa;
              resolve();
            },
          })
      );
    });
  }

  protected eventoArchivoSeleccionado(e:any){
    this.archivoSeleccionado=true;
    this.mostrarProcesarArchivo(this.archivos[0].file, false);
  }

  public buscar(){//CUS.PRO.BAN.002.1.3.1   CUS.PRO.REU.042
    const tipo = 1;
    const idCaso = this.caso!.idCaso;
    const nroCaso = this.caso!.numeroCaso;
    console.log("buscar idCaso: ", this.caso!.idCaso)
    const dialog = this.dialogService.open(BuscarTramitesModalComponent, {
      data: { tipo, idCaso, nroCaso, proceso: this.proceso, subtipo: this.subtipo, etapa: this.etapa },
      showHeader: false,
      contentStyle: { 'padding': '0', 'border-radius': '15px' }
    });
    //
    dialog.onClose.subscribe(
      {
        next: (data) => {
          console.log(data);
          this.form.get('tramite')!.setValue(data?.nombreTramite);
          this.form.get('actoProcesal')!.setValue(data?.acto);
          this.form.get('etapa')!.setValue(data?.etapa);
        }
      }
    );

  }


  public guardarCargo() {

  }

  private async mostrarArchivoFirmado(): Promise<void> {
    this.repositorioDocumentoService
        .verDocumentorepositorio(this.archivos[0].nombre)
        .subscribe({
          next: (res: any) => {
            const blob = new Blob([res], { type: 'application/pdf' });
            this.mostrarProcesarArchivo(blob, true)
            this.archivos[0].file = new File([blob], this.archivos[0].nombre, { type: 'application/pdf' });
            this.archivos[0].tamanyo = this.archivos[0].file.size
          },
          error: (error) => {
            this.spinner.hide()
          },
        });
  }

  private async mostrarProcesarArchivo(datos:any, esDocumentoServidor:boolean, nombreDocumento?:string){
    const archivo =  this.archivos[0];
    this.archivoAdjunto = {
      id: archivo.id,
      urlPdf: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(datos)),
      preNamePdf: esDocumentoServidor ? '' : 'Vista previa del documento: ',
      namePdf: esDocumentoServidor ? nombreDocumento : archivo.nombreOrigen,
      isSign: archivo.isSign,
      base64: await archivoFileToB64(datos),
      fromServer: esDocumentoServidor
    };
    this.spinner.hide();
  }

  protected eventoArchivoBorrar(){
    this.archivos = [];
    this.archivoSeleccionado=false;
  }

  protected eventoFirmarGuardar(): void {
    const formData = new FormData();
    formData.append('file', this.archivos[0].file);
      this.repositorioDocumentoService.guardarDocumentoRepositorio( formData )
      .subscribe({
          next: resp => {
            this.archivos[0].nombre = resp.data.nombreArchivo
            this.archivos[0].numeroFolios = resp.data.numeroFolios
            setTimeout(()=>{ this.spinner.show() }, 100)
            this.firmarDocumento();
          },
          error: ( error ) => {
            this.spinner.hide();
        }});
  }

  private firmarDocumento(){
      let body: FirmaInterface = {
        id: this.archivos[0].nombre,
        firma_url: `${BACKEND.FIRMA_CLIENTE}`,
        repositorio_url: `${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}`,
        rol: this.cargoForm.tipoCopia === SLUG_MOTIVO_COPIA.COPIA_DE_COPIA ?  capitalized(this.usuario.usuario.cargo) : SLUG_CARGO_DIGITALIZADO.FEDATARIO,
        motivo: this.cargoForm.tipoCopia===0?'Copia de copia':'Copia autenticada',
        param_url: `${BACKEND.FIRMA_CLIENTE}cliente/obtenerparametros`,
        extension: 'pdf',
        posicionX: null,
        posicionY: null
      };
      this.firmaDigitalClienteService.sendDataSign.emit( body );
  }

  protected activarBtnFirmarGuardar():boolean{
    return this.archivoSeleccionado===true && this.cargoForm.tipoCopia>-1?false:true;
  }


}
