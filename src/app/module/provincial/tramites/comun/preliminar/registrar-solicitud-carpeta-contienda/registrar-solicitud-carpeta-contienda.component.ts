import {CommonModule, DatePipe} from '@angular/common';
import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import {SLUG_SIGN,} from '@constants/mesa-unica-despacho';
import {DateMaskModule} from '@directives/date-mask.module';
import {AdjuntoData} from '@components/generales/visor-pdf-frame/adjunto-data.interface';
import {VisorPdfFrameComponent} from '@components/generales/visor-pdf-frame/visor-pdf-frame.component';
import {archivoFileToB64, base64ToFile, descargarArchivoB64, formatoPesoArchivo,} from '@utils/file';
import {obtenerIcono} from '@utils/icon';
import {capitalized} from '@utils/string';
import {noQuotes, obtenerRutaParaEtapa} from '@utils/utils';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {MessagesModule} from 'primeng/messages';
import {ProgressBarModule} from 'primeng/progressbar';
import {RadioButtonModule} from 'primeng/radiobutton';
import {SelectButtonModule} from 'primeng/selectbutton';
import {TableModule} from 'primeng/table';
import {ToastModule} from 'primeng/toast';
import {Subscription} from 'rxjs';
import {TramiteProcesal} from '@core/interfaces/comunes/tramiteProcesal';
import {SolicitudContiendaCompetencia} from '@interfaces/provincial/tramites/comun/calificacion/contienda-competencia/solicitud-contienda-competencia';
import {DatosFirma} from '@interfaces/reusables/firma-digital/datos-firma.interface';
import {FirmaIndividualService} from '@services/firma-digital/firma-individual.service';
import {ContiendaCompetenciaService} from '@services/provincial/tramites/comun/calificacion/contienda-competencia/contienda-competencia.service';
import {ReusablesCargarDocumentos} from '@services/reusables/reusable-cargar-documentos.service';
import {CasoStorageService} from '@services/shared/caso-storage.service';
import {MaestroService} from '@services/shared/maestro.service';
import {BACKEND} from '@environments/environment';
import {TokenService} from '@services/shared/token.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {FileUploadModule} from 'primeng/fileupload';
import {RepositorioDocumentoService} from '@core/services/generales/repositorio-documento.service';
import {FirmaDigitalClienteComponent, FirmaDigitalClienteService, FirmaInterface} from 'ngx-cfng-core-firma-digital';
import {FirmaIndividualComponent} from "@components/generales/firma-individual/firma-individual.component";
import {VisorEfeService} from "@services/visor/visor.service";
import {AlertaModalComponent} from "@components/modals/alerta-modal/alerta-modal.component";
import {AlertaData} from "@interfaces/comunes/alert";
import {TramiteService} from "@services/provincial/tramites/tramite.service";
import {GestionCasoService} from "@services/shared/gestion-caso.service";
import {NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService} from '@ngx-cfng-core-modal/dialog';
import {MessageService} from "primeng/api";
import { EliminarTramiteRequest } from '@core/interfaces/reusables/eliminar-tramite/eliminar-tramite-request';
import { EliminarTramiteService } from '@core/services/reusables/efe/eliminar-tramite/eliminar-tramite.service';
import { Router } from '@angular/router';
import { TIPO_COPIA } from 'dist/ngx-cfng-core-lib';

@Component({
  standalone: true,
  selector: 'app-registrar-solicitud-carpeta-contienda',
  templateUrl: './registrar-solicitud-carpeta-contienda.component.html',
  styleUrls: ['./registrar-solicitud-carpeta-contienda.component.scss'],
  imports: [
    RadioButtonModule,
    DateMaskModule,
    CommonModule,
    DropdownModule,
    InputTextareaModule,
    MessagesModule,
    InputTextModule,
    CmpLibModule,
    ReactiveFormsModule,
    ButtonModule,
    FormsModule,
    ProgressBarModule,
    ToastModule,
    TableModule,
    FirmaDigitalClienteComponent,
    VisorPdfFrameComponent,
    SelectButtonModule,
    FileUploadModule,
    FirmaIndividualComponent,
    NgxCfngCoreModalDialogModule
  ],
  providers: [
    FirmaDigitalClienteService,
    DatePipe,
    DynamicDialogRef,
    DynamicDialogConfig,
  ],
})
export class RegistrarSolicitudCarpetaContiendaComponent implements OnInit, OnDestroy {
  @Input() files: any[] = [];
  @Input() urlClass: string = 'cfe-url';
  @Input() idCaso: string = '';
  @Input() etapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idEtapa: string = '';

  @Output() ocultarBotonTramite = new EventEmitter<boolean>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();
  @Output() datosFormulario = new EventEmitter<Object>();

  filesPeso: any;

  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso;
    }
  }

  private _idActoTramiteCaso: string = '';
  private nombreDocumentoCargado!: string;
  tipoCopia: { id: number; coDescripcion: string; noDescripcion: string }[] = [];
  tipoDocumento: any = [];
  usuario: any;
  documentoCargado: boolean = false;
  documentoAdjunto!: AdjuntoData;
  pdfUrl: any;
  file?: File;
  reader?: FileReader;
  protected wordCount = 0;
  protected maxLength = 200;

  public formatoPesoArchivo = formatoPesoArchivo;
  public obtenerIcono = obtenerIcono;
  public suscripciones: Subscription[] = [];
  public form: FormGroup;
  private datosFirma!: DatosFirma;
  formularioDeshabilitado : Boolean = false;
  protected datos!: SolicitudContiendaCompetencia;
  public refModal!: DynamicDialogRef;
  private idArchivo: any;

  constructor(
    private formulario: FormBuilder,
    public config: DynamicDialogConfig,
    private firmaIndividualService: FirmaIndividualService,
    public firmaDigitalClienteService: FirmaDigitalClienteService,
    private tokenService: TokenService,
    private contiendaCompetenciaService: ContiendaCompetenciaService,
    protected _sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private sanitizer: DomSanitizer,
    public maestroService: MaestroService,
    private cargarDocumentosService: ReusablesCargarDocumentos,
    private readonly gestionCasoService: GestionCasoService,
    private repositorioDocumentoService: RepositorioDocumentoService,
    protected dialogService: DialogService,
    private visorEfeService: VisorEfeService,
    protected tramiteService: TramiteService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly eliminarTramiteService: EliminarTramiteService,
    private router: Router,
  ) {
    this.usuario = this.getUserSession().usuario;

    this.form = this.formulario.group({
      idTipoCopia: new FormControl(null, [Validators.required]),
      observaciones: new FormControl(null, []),
    });
  }

  public ngOnInit() {
    this.documentoAdjunto = this.nuevoDocumento();
    this.getTipoCopia();

    this.getSolicitudContienda();

    this.suscripciones.push(
      this.firmaDigitalClienteService.processSignClient.subscribe(
        (data: any) => {
          this.procesoFirmar(data);
        }
      )
    );
    this.peticionParaEjecutar.emit((datos: any) =>
      this.contiendaCompetenciaService.guardarSolicitudContienda(datos)
    );

    setTimeout(() => {
      this.ocultarBotonTramite.emit(true);
    }, 1000);
    this.formularioDeshabilitado = this.tramiteService.tramiteEnModoVisor;
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((subscription) => subscription.unsubscribe());
  }

  getUserSession() {
    return this.tokenService.getDecoded();
  }

  getTipoCopia(): void {
    console.log('oooooooooooooooooooooooooooooo - getTipoCopia');
    this.spinner.show();
    this.suscripciones.push(
      this.maestroService.getCatalogo('ID_N_TIPO_COPIA').subscribe({
        next: (resp) => {
          this.tipoCopia = resp.data;
        },
        error: (error) => {
          this.tipoCopia = [];
        },
      })
    );
  }

  getSolicitudContienda(): void {
    console.log('oooooooooooooooooooooooooooooo - getSolicitudContienda');
    console.log('oooooooooooooooooooooooooooooo - getSolicitudContienda', this.idCaso);
    console.log('oooooooooooooooooooooooooooooo - getSolicitudContienda', this.tramiteSeleccionado!.idActoTramiteEstado);
    this.spinner.show();
    this.suscripciones.push(
      this.contiendaCompetenciaService
        .obtenerSolicitudContienda(
          this._idActoTramiteCaso
        )
        .subscribe({
          next: async (datos) => {
            this.spinner.hide();
            if (datos.documento != null) {
              this.idArchivo = datos.documento;
              this.form.get('idTipoCopia')!.setValue(datos.tipoFirma);
              this.form.get('observaciones')!.setValue(datos.observacion);
              this.wordCount = datos.observacion.length;
              this.form.get('observaciones')!.disable();
              this.form.get('idTipoCopia')?.disable();
              this.documentoCargado = true;
              //this.verpdf(datos.documento, datos.nombreDocumento);
              this.obtenerDocumentoAdjunto(datos.documento);
              this.filesPeso = datos.pesoDocumento;
            }
          },
          error: (error) => {
            this.spinner.hide();
          },
        })
    );
  }

  public verpdf(idDocumento: any, nombreDocumento: any) {
    console.log('oooooooooooooooooooooooooooooo - verpdf');
    this.cargarDocumentosService.verPdf(idDocumento).subscribe({
      next: (resp) => {
        if (resp.code === 200) {
          this.documentoAdjunto = {
            id: nombreDocumento,
            urlPdf: this.sanitizer.bypassSecurityTrustResourceUrl(
              `data:application/pdf;base64,${String(resp.data[0].archivo)}`
            ),
            preNamePdf: 'VISTA DEL DOCUMENTO',
            namePdf: nombreDocumento.replace('.pdf', ''),
            isSign: true,
            base64: String(resp.data[0].archivo),
            fromServer: true,
          };

          this.files[0] = base64ToFile(String(resp.data[0].archivo));
          this.files[0].tamanyo = this.files[0].size;
          this.files[0].nombreOrigen = nombreDocumento;
          this.spinner.hide();
        }
      },
    });
  }

  protected processSignDocument(file: any) {
    console.log('oooooooooooooooooooooooooooooo - processSignDocument');
    this.spinner.show();
    this.documentoCargado = true;
    this.verDocumentoVisor(file);
    this.spinner.hide();
  }

  private async verDocumentoVisor(documentoAdjunto: any): Promise<void> {
    console.log('oooooooooooooooooooooooooooooo - verDocumentoVisor');
    this.documentoAdjunto = {
      id: documentoAdjunto.id,
      urlPdf: this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(documentoAdjunto.file)
      ),
      preNamePdf: 'Vista previa del documento: ',
      namePdf: `${documentoAdjunto.nombreOrigen}`,
      isSign: documentoAdjunto.isSign,
      base64: await archivoFileToB64(documentoAdjunto.file),
      fromServer: false,
    };
  }

  protected eliminarDocumento(documentoAdjunto: any): void {
    const confirmar = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: 'Cancelar acciones',
        description: '¿Realmente desea cancelar la acción de carga, todos los datos ingresados se perderán?',
        confirmButtonText: 'Cancelar Acciones',
        cancelButtonText: 'Cerrar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    confirmar.onClose.subscribe((respuesta: string) => {
      /**respuesta === 'confirm' ? this.ejecutaEliminarDocumento(documentoAdjunto) : null; */
      if (respuesta === 'confirm') {
        //this.ejecutaEliminarDocumento(documentoAdjunto);
        this.eliminarTramiteFirmado();
        this.redireccionarActoProcesal();
      }
    });
  }

  public ejecutaEliminarDocumento(documentoAdjunto: any): void {
    console.log('oooooooooooooooooooooooooooooo - ejecutaEliminarDocumento');
    const indexToDelete = this.files.findIndex(
      (i) => i.id === documentoAdjunto.id
    );
    this.files.splice(indexToDelete, 1);
    this.documentoCargado = false;
    this.documentoAdjunto = this.nuevoDocumento();
  }

  private eliminarTramiteFirmado(): void {
    const idActoTramiteCaso = this._idActoTramiteCaso;
    const motivo = 'Se cancelo la solicitud de derivación de carpeta por contienda';

    const datos: EliminarTramiteRequest = { idActoTramiteCaso, motivo }
    this.suscripciones.push(
      this.eliminarTramiteService.eliminarTramite(datos).subscribe({
        next: () => {
          this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
        },
        error: () => {
          this.modalDialogService.error(
            'ERROR AL INTENTAR ELIMINAR DOCUMENTO FIRMADO',
            'Ha ocurrido un error inesperado al intentar eliminar el documento firmado',
            'Aceptar',
          )
        }
      })
    )
  }

  private redireccionarActoProcesal() {
    const ruta = `app/administracion-casos/consultar-casos-fiscales/${this.etapa}/caso/${this.idCaso}/acto-procesal`;
    this.router.navigateByUrl('/app', { skipLocationChange: true }).then(() => {
      this.router.navigate([`${ruta}`]);
    });
  }

  private nuevoDocumento(): AdjuntoData {
    console.log('oooooooooooooooooooooooooooooo - nuevoDocumento');
    return (this.documentoAdjunto = {
      id: null,
      urlPdf: null,
      preNamePdf: 'Sin vista previa de documento',
      namePdf: '',
      isSign: false,
      base64: null,
      fromServer: false,
    } as AdjuntoData);
  }

  private async obtenerDocumentoFirmado() {
    console.log('oooooooooooooooooooooooooooooo - obtenerDocumentoFirmado');
    await this.spinner.show();
    return new Promise<void>((resolve, reject) => {
      this.suscripciones.push(
        this.repositorioDocumentoService
          .verDocumentorepositorio(this.nombreDocumentoCargado)
          .subscribe({
            next: (resp) => {
              const documentoFirmado = new Blob([resp], {
                type: 'application/pdf',
              });
              const file = new File(
                [documentoFirmado],
                this.documentoAdjunto.namePdf,
                { type: 'application/pdf' }
              );
              const documentoURL =
                this.sanitizer.bypassSecurityTrustResourceUrl(
                  URL.createObjectURL(documentoFirmado)
                );
              this.actualizarDocumentoAdjunto(true, file, documentoURL);
              this.spinner.hide();
              resolve();
            },
            error: (error) => {
              this.spinner.hide();
              console.log(error);
            },
          })
      );
    });
  }

  private async actualizarDocumentoAdjunto(
    esFirmado: boolean,
    documentoFile: File,
    documentoURL: any
  ) {
    console.log('oooooooooooooooooooooooooooooo - actualizarDocumentoAdjunto');
    this.spinner.show();
    const fileB64 = await archivoFileToB64(documentoFile);
    this.documentoAdjunto = {
      ...this.documentoAdjunto,
      isSign: esFirmado,
      base64: await archivoFileToB64(documentoFile),
      urlPdf: documentoURL,
      fromServer: true,
    };
    await this.registrarDatosFormulario();
  }

  private async registrarDatosFormulario(): Promise<void> {
    console.log('oooooooooooooooooooooooooooooo - registrarDatosFormulario');
    await this.spinner.show();
    const formulario = this.form.getRawValue();
    this.datos = {
      ...this.datos,
      etapa: this.etapa,
      observaciones: formulario.observaciones,
      idCaso: this.idCaso,
      idTipoCopia: formulario.idTipoCopia,
      idActoTramiteCaso: this._idActoTramiteCaso,
      idActoTramiteEstado: this.tramiteSeleccionado!.idActoTramiteEstado,
      archivo: this.documentoAdjunto.base64!,
      nombreArchivo: this.documentoAdjunto.namePdf,
    };
    this.suscripciones.push(
      this.contiendaCompetenciaService
        .guardarSolicitudContienda(this.datos)
        .subscribe({
          next: async (datos) => {
            this.gestionCasoService.obtenerCasoFiscal(this.gestionCasoService.casoActual.idCaso);

            this.deshabilitarFormulario();
            this.formularioDeshabilitado = true;
            //this.idArchivo = datos.documento;
            this.changeDetectorRef.detectChanges();
            this.modalDialogService.success('Solicitud registrada y firmada', 'Se registró y firmó correctamente la disposición', 'Aceptar');
            this.spinner.hide();

            //this.redirectActoProcesal(this.idEtapa, this.idCaso, this._idActoTramiteCaso);
            this.getSolicitudContienda();

          },
          error: (error) => {
            this.spinner.hide();
            console.log(error);
          },
        })
    );
  }

  public async redirectActoProcesal(idEtapa: string, idCaso: string, idActoTramiteCaso: string) {
      const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(idEtapa)}/caso/${idCaso}/acto-procesal/${idActoTramiteCaso}/editar`;
      // Navega primero a una ruta vacía sin cambiar el historial (skipLocationChange)
      // 1. Navegar a una ruta temporal que NO esté activa
      await this.router.navigateByUrl('/refresh', { skipLocationChange: true });
      this.router.navigate([`${ruta}`]);
    }

  private async procesoFirmar(realizado: string): Promise<void> {
    console.log('oooooooooooooooooooooooooooooo - procesoFirmar');
    await this.spinner.show();
    if (realizado === '0') {
      await this.obtenerDocumentoFirmado();
    }
    if (realizado === '1') {
      //this.spinner.hide();
      alert(SLUG_SIGN.CANCEL);
    }
  }

  get formularioValido(): boolean {
    return !(this.form.valid && this.files.length === 1);
  }

  countWords() {
    const words = this.form.get('observaciones')!.value ?? '';
    this.wordCount = words.length;
    if (this.wordCount >= this.maxLength) {
      const currentValue = words;
      const newValue = currentValue.substring(0, this.maxLength);
      this.form.get('observaciones')!.setValue(newValue);
    }
  }

  /*** GUARDADO FORMULARIO Y FIRMADO DE DOCUMENTO ***/

  protected confirmarGuardarDigitalizado(): void {
    const confirmar = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: 'Registrar solicitud',
        description: 'Está a punto de firmar digitalmente y registrar la solicitud cargada.  ¿Desea continuar con el registro?',
        confirmButtonText: 'Sí, Continuar',
        cancelButtonText: 'Cancelar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    confirmar.onClose.subscribe((respuesta: string) => {
      /**this.spinner.show();**/
      respuesta === 'confirm' ? this.iniciarDocumentoFirmado() : null;
    });
  }

  async iniciarDocumentoFirmado() {
    await this.spinner.show();
    await this.obtenerDatosFirma();
    await this.cargarDocumentoRepositorio();
    let idTipoCopia = this.form.get('idTipoCopia')!.value;
    let desTipoCopia = this.tipoCopia.find(item => item.id === parseInt(idTipoCopia))?.noDescripcion;
    let id = this.tipoCopia.find(item => item.id === parseInt(idTipoCopia))?.id;
    let cargo = id?.toString() == TIPO_COPIA.COPIA_AUTENTICADA ? 'Fedatario institucional' : this.datosFirma.cargoFirmador;
    let body: FirmaInterface = {
      id: this.nombreDocumentoCargado,
      firma_url: `${BACKEND.FIRMA_CLIENTE}`,
      repositorio_url: `${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}`,
      rol: cargo,
      motivo: desTipoCopia,
      param_url: `${BACKEND.FIRMA_CLIENTE}cliente/obtenerparametros`,
      extension: 'pdf',
      posicionX: null,
      posicionY: null,
    };
    setTimeout(() => {
      this.spinner.show();
    }, 0);
    this.firmaDigitalClienteService.sendDataSign.emit(body);
  }

  private async obtenerDatosFirma() {
    await this.spinner.show();
    return new Promise<void>((resolve, reject) => {
      this.suscripciones.push(
        this.firmaIndividualService.obtenerDatosFirma().subscribe({
          next: (resp) => {
            this.datosFirma = resp;
            resolve();
          },
          error: (e) => {
            this.spinner.hide()
            console.error(e);
          },
        })
      );
    });
  }

  private async cargarDocumentoRepositorio() {
    await this.spinner.show();
    return new Promise<void>((resolve, reject) => {
      const formData = new FormData();
      formData.append(
        'file',
        base64ToFile(this.documentoAdjunto.base64!)!,
        this.documentoAdjunto.namePdf + '.pdf'
      );
      this.suscripciones.push(
        this.repositorioDocumentoService
          .guardarDocumentoRepositorio(formData)
          .subscribe({
            next: (resp) => {
              this.nombreDocumentoCargado = resp.data.nodeId;
              resolve();
            },
            error: (e) => {
              this.spinner.hide()
              console.error(e);
            },
          })
      );
    });
  }

  private obtenerDocumentoAdjunto(idDocumento: string) {
    this.spinner.show();
    this.visorEfeService.getPDF64(idDocumento).subscribe({
      next: resp => {
        this.documentoAdjunto = {
          id: null,
          urlPdf: this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${String(resp.archivo)}`),
          preNamePdf: 'VISTA DEL DOCUMENTO',
          namePdf: resp.nombre,
          isSign: true,
          base64: String(resp.archivo),
          fromServer: true
        };

        this.files[0] = base64ToFile(String(resp.archivo));
        this.files[0].tamanyo = 0;
        this.files[0].nombreOrigen = resp.nombre;

      },
      error: error => {
        console.log(error)
      }
    });
  }

  deshabilitarFormulario(){
    this.form.get('observaciones')!.disable();
    this.form.get('idTipoCopia')?.disable();
    this.formularioDeshabilitado = true;
  }

  protected descargarArchivo(idDocumento: string, nombre?: string) {
    this.visorEfeService.getPDF64(this.idArchivo).subscribe({
      next: (rs: any) => {
        descargarArchivoB64(
          rs.archivo,
          nombre ? nombre : rs.nombre ?? this.idArchivo
        );
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Ocurrio un error',
          detail: 'No se puede descargar el documento',
        });
      },
    });
  }

}
