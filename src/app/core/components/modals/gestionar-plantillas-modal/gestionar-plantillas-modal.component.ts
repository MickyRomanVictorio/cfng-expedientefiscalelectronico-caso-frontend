import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { formatoCampoPipe } from '@pipes/formato-campo.pipe';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { delay, Subscription } from 'rxjs';
import { EncabezadoModalComponent } from '../encabezado-modal/encabezado-modal.component';

import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';

import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
import { MenuItem } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AdjuntarDocumentoManualComponent } from '@components/tramite-editor/tramite-manual/adjuntar-documento-manual/adjuntar-documento-manual.component';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { AdjuntarDocumentoComponent } from './adjuntar-documento/adjuntar-documento.component';
import { PlantillaTramiteManualService } from '@core/services/provincial/tramites/plantilla-tramite-manual.service';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { AlertaData } from '@core/interfaces/comunes/alert';
import { Plantilla } from '@core/interfaces/provincial/tramites/tramite-manual/plantillas-tramite-manual.interface';

@Component({
  standalone: true,
  selector: 'gestionar-plantillas-modal',
  templateUrl: './gestionar-plantillas-modal.component.html',
  styleUrls: ['./gestionar-plantillas-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    EncabezadoModalComponent,
    CheckboxModule,
    formatoCampoPipe,
    CommonModule,
    ButtonModule,
    TabsViewComponent,
    TabViewModule,
    CalendarModule,
    RadioButtonModule,
    TableModule,
    FileUploadModule,
    ToastModule,
    CmpLibModule,
    AdjuntarDocumentoComponent,
    AdjuntarDocumentoManualComponent,
  ],
  providers: [],
})
export class GestionarPlantillasModalComponent implements OnInit {
  idNodeEditar: string = '';
  idPlantillaDocumentoEditar: number = 0;
  titulo: string = 'Gestionar plantillas del trámite: ';
  tituloModal: SafeHtml | undefined = undefined;
  obtenerIcono = obtenerIcono;
  archivo: File | undefined;
  uploading = false;
  uploadProgress = 0;
  completed = 0;
  usuario!: string;
  public idCaso!: string;
  public idActoTramiteEstado!: string;
  public codigoDespacho!: string;
  public idActoTramiteCaso!: string;
  public formularioGestorPlantilla: FormGroup;
  fileAceptadosMensaje: string = '.doc, .docx';

  cargandoTabla: boolean = false;
  public subscriptions: Subscription[] = [];
  numeroCaso: String = '';
  caso: any = [];
  listaDocumentos: Plantilla[] = [];

  @ViewChild(AdjuntarDocumentoComponent)
  adjuntarDocumentoComponent!: AdjuntarDocumentoComponent;
  isEditMode: boolean = false;

  constructor(
    public referenciaModal: DynamicDialogRef,
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private formulario: FormBuilder,
    protected _sanitizer: DomSanitizer,
    private sanitizador: DomSanitizer,
    private plantillaTramiteManualService: PlantillaTramiteManualService,
    private dialogService: DialogService
  ) {
    this.idCaso = this.config.data.idCaso;
    this.idActoTramiteCaso = this.config.data.idActoTramiteCaso;
    this.idActoTramiteEstado = this.config.data.idActoTramiteEstado;
    this.codigoDespacho = this.config.data.codigoDespacho;
    this.formularioGestorPlantilla = this.formulario.group({
      nombrePlantilla: new FormControl('', [
        Validators.required,
        Validators.maxLength(30),
      ]),
    });
  }
  public getPlantillaTramiteManualService(): PlantillaTramiteManualService {
    return this.plantillaTramiteManualService;
  }
  public indexActivo: number = 0;
  public pdfUrl: any;

  items: (data: any) => MenuItem[] = (data: any) => [];

  ngOnInit() {
    this.cargarTablaPlantillas();
    this.obtenerTitulo();
  }

  onSelect(file: File) {
    this.archivo = file;
  }
    isGuardarPlantillaDisabled(): boolean {
      if (this.isEditMode) {
        return !this.formularioGestorPlantilla.valid;
      } else {
        return !(this.archivo && this.formularioGestorPlantilla.valid);
      }
    }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  close() {
    this.plantillaTramiteManualService.handleReloadEditor();
    this.dialogRef.close();
  }

  private obtenerTitulo(): void {
    const tituloHtml = `${this.titulo} `;
    this.tituloModal = this.sanitizador.bypassSecurityTrustHtml(tituloHtml);
  }
  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  guardarPlantillaManual($event: MouseEvent) {
    $event.preventDefault();
    this.uploading = true;
    const formData = new FormData();
    if (this.archivo) {
      formData.append('file', this.archivo);
    }

    const data: Plantilla = {
      codigoDespacho: this.codigoDespacho,
      idNode: this.idNodeEditar,
      idPlantillaPersonalizada: this.idPlantillaDocumentoEditar,
      idActoTramiteEstado: this.idActoTramiteEstado,
      nombrePlantillaPersonalizada:
        this.formularioGestorPlantilla.get('nombrePlantilla')?.value,
    };
    formData.append(
      'data',
      new Blob([JSON.stringify(data)], { type: 'application/json' })
    );

    this.plantillaTramiteManualService.subirNuevaPlantilla(formData).subscribe({
      next: (event) => {
        if (event.type === 2) {
          if (event.status === 500) {
            this.uploading = false;
            this.uploadProgress = 0;
            this.mensajeGuardarPlantilla(
              data.nombrePlantillaPersonalizada,
              'error'
            );
            return;
          }
        }
        if (event.type === 3) {
          this.uploading = false;
          this.uploadProgress = 0;
          this.mensajeGuardarPlantilla(data.nombrePlantillaPersonalizada, 'ok');
          this.cargarTablaPlantillas();
          this.limpiarFormulario();
        }
      },
      error: (error) => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.mensajeGuardarPlantilla(
          data.nombrePlantillaPersonalizada,
          'error'
        );
        this.cargarTablaPlantillas();
        this.limpiarFormulario();
      },
    });
  }

  cargarTablaPlantillas() {
    this.cargandoTabla = true;
    this.plantillaTramiteManualService
      .listarPlantillas(this.idActoTramiteEstado, this.codigoDespacho,this.idActoTramiteCaso)
      .subscribe({
        next: (data) => {
          this.listaDocumentos = data;
          this.cargandoTabla = false;
        },
        error: (error) => {
          this.cargandoTabla = false;
          this.mensajeGuardarPlantilla('', 'error');
        },
      });
  }

  confirmaEliminarPlantilla(plantilla: Plantilla) {
    const dialoEliminar = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `Eliminar Plantilla`,
        description: `¿Esta Seguro de Eliminar la plantilla ${plantilla.nombrePlantillaPersonalizada}?`,
        confirmButtonText: 'Confirmar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);
    dialoEliminar.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.eliminarPlantilla(plantilla);
        }
      },
    });
  }

  eliminarPlantilla(plantilla: Plantilla) {
    this.plantillaTramiteManualService
      .eliminarPlantilla(plantilla.idPlantillaPersonalizada)
      .pipe(delay(300))
      .subscribe({
        next: (event) => {
          this.uploading = false;
          this.uploadProgress = 0;
          if (event.ok) {
            this.mensajeGuardarPlantilla(
              plantilla.nombrePlantillaPersonalizada,
              'eliminado'
            );
          } else {
            this.mensajeGuardarPlantilla(
              plantilla.nombrePlantillaPersonalizada,
              'error'
            );
          }
          this.cargarTablaPlantillas();
          this.limpiarFormulario();
        },
        error: (error) => {
          this.uploading = false;
          this.uploadProgress = 0;
          this.cargarTablaPlantillas();
          this.limpiarFormulario();
          this.mensajeGuardarPlantilla(
            plantilla.nombrePlantillaPersonalizada,
            'error'
          );
        },
      });
  }
  mensajeGuardarPlantilla(nombrePlantillaDocumento: string, tipo: string) {
    var icono = 'success';
    var titulo = 'PLANTILLA GUARDADA CORRECTAMENTE';
    var descripcion = `Se guardó correctamente la plantilla con nombre ${nombrePlantillaDocumento}`;
    if (tipo === 'error') {
      icono = 'error';
      titulo = 'ERROR AL EJECUTAR LA ACCIÓN';
      descripcion = `Error de ejecución en la plantilla ${nombrePlantillaDocumento}`;
    }
    if (tipo === 'eliminado') {
      icono = 'success';
      titulo = 'PLANTILLA ELIMINADA CORRECTAMENTE';
      descripcion = `Se eliminó correctamente la plantilla con nombre ${nombrePlantillaDocumento}`;
    }

    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icono,
        title: titulo,
        description: descripcion,
        confirmButtonText: 'ok',
        confirm: false,
      },
    } as DynamicDialogConfig<AlertaData>);
  }
  actualizarPlantilla(plantilla: Plantilla) {
    this.idPlantillaDocumentoEditar = plantilla.idPlantillaPersonalizada;
    this.idNodeEditar = plantilla.idNode;
    this.formularioGestorPlantilla.patchValue({
      nombrePlantilla: plantilla.nombrePlantillaPersonalizada,
    });
    this.isEditMode = true;
  }
  limpiarFormulario() {
    this.idPlantillaDocumentoEditar = 0;
    this.idNodeEditar = '';
    this.formularioGestorPlantilla.reset();
    this.archivo = undefined;
    this.adjuntarDocumentoComponent.limpiarCampos();
    this.isEditMode = false;
  }
  descargarPlantilla(plantilla: Plantilla) {
    this.plantillaTramiteManualService
      .descargarPlantillaConIdNode(plantilla.idNode, this.idActoTramiteEstado, this.idCaso)
      .subscribe({
        next: (rs: Blob) => {
          this.descargarArchivo(rs, plantilla.pathPlantilla!!);
        },
        error: () => {
          this.mensajeGuardarPlantilla('', 'error');
        },
      });
  }
  descargarArchivo(response: Blob, nombreArchivo: string) {
    const contentType = response.type;
    const blob = new Blob([response], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
