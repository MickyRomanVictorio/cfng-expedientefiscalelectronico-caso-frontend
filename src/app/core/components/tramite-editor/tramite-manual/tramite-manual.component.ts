import { PlantillaTramiteManualService } from '@services/provincial/tramites/plantilla-tramite-manual.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { archivoFileToB64, trustUrlB64 } from '@utils/file';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MenuItem, MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TramiteResponse } from '@core/interfaces/comunes/crearTramite';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { VisorComponent } from '@components/tramite-editor/visor/visor.component';
import { DropdownModule } from 'primeng/dropdown';
import { StepsModule } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { EditorComponent } from '../editor/editor.component';
import { AdjuntarDocumentoManualComponent } from './adjuntar-documento-manual/adjuntar-documento-manual.component';
import { Subscription } from 'rxjs';
import {
  Plantilla,
  PlantillaPersonalizada
} from '@core/interfaces/provincial/tramites/tramite-manual/plantillas-tramite-manual.interface';
import { GestionCasoService } from '@services/shared/gestion-caso.service';
@Component({
  selector: 'app-tramite-manual',
  standalone: true,
  imports: [
    CommonModule,
    StepsModule,
    EditorComponent,
    DropdownModule,
    FileUploadModule,
    ToastModule,
    CmpLibModule,
    AdjuntarDocumentoManualComponent,
    VisorComponent,
    TableModule,
  ],
  providers: [MessageService],
  templateUrl: './tramite-manual.component.html',
  styleUrls: ['./tramite-manual.component.scss'],
})
export class TramiteManualComponent implements OnInit, OnDestroy{
  @Output() indexManual = new EventEmitter<number>();
  @Input() idActoTramiteEstado!: string;
  @Input() codigoDespacho!: string;

  public pdfUrl: SafeResourceUrl | null = null;
  uploadProgress = 0;
  idDocumentoVersion: string = '';
  idCaso: string = '';
  files: any[] = [];
  firmado = false;
  uploading = false;
  archivo: any;
  fileAceptadosMensaje: string = '.doc, .docx';
  public archivoSeleccionadoB64: string = '';

  listaDocumentos: PlantillaPersonalizada[] = [];
  plantillaDefecto: PlantillaPersonalizada = {} as PlantillaPersonalizada;
  cargandoCombobox: boolean = false;
  selectedIdNode:string='';
  selectedDocumentoNombre: string | undefined; // Variable para capturar el nombre del documento seleccionado
  private subscription: Subscription= new Subscription();

  constructor(private sanitizer: DomSanitizer,
              private messageService: MessageService,
              private tramiteService: TramiteService,
              protected readonly gestionCasoService: GestionCasoService,
              private plantillaTramiteManualService: PlantillaTramiteManualService,
  ) {}

  public ngOnInit(): void {
    this.iniciarPlantillaDefecto();
    this.cargarTablaPlantillas();
    this.plantillaTramiteManualService.reloadEditor.subscribe(
      reloadEditor => this.onModalClosedRefresh()
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get tramiteResponse(): TramiteResponse {
    return this.tramiteService.tramiteRegistrado;
  }

  iniciarPlantillaDefecto(): void {
    this.idCaso = this.gestionCasoService.expedienteActual.idCaso;
    this.plantillaDefecto.idNode = '-1';
    this.plantillaDefecto.nombrePlantillaPersonalizada = 'Plantilla por defecto';
    this.plantillaDefecto.pathPlantilla = 'plantilla.docx';
  }

  cargarTablaPlantillas() {
    this.cargandoCombobox = true;
    this.plantillaTramiteManualService
      .listarPlantillas(this.idActoTramiteEstado, this.codigoDespacho, this.tramiteResponse.idActoTramiteCaso!!)
      .subscribe({
        next: (data) => {
          this.listaDocumentos = data;
          this.listaDocumentos.unshift(this.plantillaDefecto);
          this.cargandoCombobox = false;
        },
        error: (error) => {
          this.cargandoCombobox = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error al cargar las plantillas',
            detail: 'Ocurrió un error al cargar las plantillas',
          });
        },
      });
  }

  crearTramiteManual($event: MouseEvent) {
    $event.preventDefault();
    if (!this.tramiteResponse.idDocumentoVersiones) return;
    this.idDocumentoVersion = this.tramiteResponse.idDocumentoVersiones;

    this.uploading = true;
    const formData = new FormData();
    formData.append('file', this.archivo);

    this.tramiteService
      .tramiteManual(formData, this.idDocumentoVersion)
      .subscribe({
        next: (event: HttpEvent<TramiteResponse>) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(
              (100 * event.loaded) / event.total!
            );
          } else if (event.type === HttpEventType.Response) {
            this.uploading = false;
            const response = event.body;
            if (!response) return;
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'El archivo se subió con éxito',
              life: 4000,
            });
            this.tramiteService.tramiteRegistrado = response;
            this.indexManual.emit(0);
            this.tramiteService.handleReloadEditor(response?.pathDocumento);
          }
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ha ocurrido un error inesperado. Inténtelo más tarde',
            life: 4000,
          });
          console.log(error);
          this.uploading = false;
        },
      });
  }

  cargarArchivo(file: File) {
    this.archivo = file;
  }

  eliminarArchivo() {
    this.archivo = null;
  }

  public async alSeleccionarArchivo(): Promise<void> {
    this.messageService.clear();

    if (this.archivo) {
      this.archivoSeleccionadoB64 = await archivoFileToB64(this.archivo);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${trustUrlB64(this.archivoSeleccionadoB64)}`
      );
    }
  }

  elegirPlantilla($event: any) {
    this.selectedIdNode = $event.value;
    const selectedDocumento = this.listaDocumentos.find(
      (doc:Plantilla) => doc.idNode === this.selectedIdNode
    );
    this.selectedDocumentoNombre = selectedDocumento ? selectedDocumento.pathPlantilla : undefined;
  }

  descargarPlantilla(event: any) {
    event.preventDefault();
    const nombreArchivo = this.selectedDocumentoNombre ? this.selectedDocumentoNombre : 'plantilla.docx';
    const idNode = this.selectedIdNode;

    this.plantillaTramiteManualService
      .descargarPlantillaConIdNode(idNode, this.idActoTramiteEstado, this.idCaso)
      .subscribe({
        next: (rs: Blob) => {
          this.guardarArchivo(rs, nombreArchivo);
        },
      });
  }

  private guardarArchivo(blob: Blob, nombreArchivo: string = 'plantilla.docx'): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  onModalClosedRefresh() {
    this.cargarTablaPlantillas();
  }
}
