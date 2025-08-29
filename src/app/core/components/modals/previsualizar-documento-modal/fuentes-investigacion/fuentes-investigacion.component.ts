import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CalendarModule } from "primeng/calendar";
import { CheckboxModule } from "primeng/checkbox";
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { CommonModule } from "@angular/common";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { MenuModule } from "primeng/menu";
import { MessagesModule } from "primeng/messages";
import { RadioButtonModule } from "primeng/radiobutton";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { PaginatorComponent } from "@components/generales/paginator/paginator.component";
import { FuentesInvestigacion } from "@interfaces/provincial/documentos-ingresados/FuentesInvestigacion";
import { PaginacionInterface } from "@interfaces/comunes/paginacion.interface";
import { Subscription } from "rxjs";
import {
  EvidenciaInvesstigacionService
} from "@services/provincial/documentos-ingresados/evidencia-invesstigacion.service";
import { DocumentoIngresadoNuevo } from "@interfaces/provincial/documentos-ingresados/DocumentoIngresadoNuevo";
import { obtenerIcono } from "@utils/icon";
import { ReusableArchivoService } from '@core/services/reusables/reusable-archivos.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AlertaModalComponent } from '../../alerta-modal/alerta-modal.component';
import { AlertaData } from '@core/interfaces/comunes/alert';

@Component({
  selector: 'app-fuentes-investigacion',
  standalone: true,
  templateUrl: './fuentes-investigacion.component.html',
  styleUrl: './fuentes-investigacion.component.scss',
  imports: [
    CalendarModule,
    CheckboxModule,
    CommonModule,
    CmpLibModule,
    FormsModule,
    FormsModule,
    InputTextModule,
    MenuModule,
    MessagesModule,
    RadioButtonModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    PaginatorComponent,
  ],
})
export class FuentesInvestigacionComponent implements OnInit {

  @Input() documento!: DocumentoIngresadoNuevo;
  protected evidenciasList: FuentesInvestigacion[] = [];
  protected evidenciasFiltradas: FuentesInvestigacion[] = [];
  public evidenciaSeleccionada: FuentesInvestigacion[] = [];
  private subscriptions: Subscription[] = [];

  private totalCasosAsignar: number = 0;
  public resetPage: boolean = false;
  public query: any = { limit: 10, page: 1, where: {} };
  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  formEvidencias: FormGroup = new FormGroup({
    chckMarcarTodos: new FormControl<any>(true)
  });

  constructor(
    private evidenciaInvesstigacionService: EvidenciaInvesstigacionService,
    private cdr: ChangeDetectorRef,
    private readonly spiner: NgxSpinnerService,
    private readonly dialogService: DialogService,
    private readonly reusableArchivo: ReusableArchivoService) {
  }

  ngOnInit() {
    console.log("ngOnInit...")
    this.listarEvidencias();
  }

  private listarEvidencias(): void {
    let requestFuentes: any = {
      idCaso: this.documento.idCaso,
      idDocumentoEscrito: this.documento.idDocumentoEscrito
    }
    this.subscriptions.push(
      this.evidenciaInvesstigacionService.obtenerEvidencias(requestFuentes).subscribe({
        next: resp => {
          if (resp.code === 0) {
            this.evidenciasList = resp.data.map((evidencia: any) => ({ ...evidencia, seleccionado: true }));
            this.evidenciasFiltradas = this.evidenciasList;
            this.evidenciaSeleccionada = this.evidenciasFiltradas;
            this.itemPaginado.data.data = this.evidenciasFiltradas;
            this.itemPaginado.data.total = this.totalCasosAsignar = this.evidenciasFiltradas.length;
            this.actualizarPaginaRegistros(this.evidenciasFiltradas, false);
          }
        },
        error: error => {
          console.log(error)
        }
      })
    )
  }

  public obtenerClaseTipoEvidencia(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase()
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage)
  }

  actualizarPaginaRegistros(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.evidenciasFiltradas = data.slice(start, end);
  }

  get getTextoCheck(): string {
    return `Seleccionar todos`;
  }

  toggleAllCheckboxes(isChecked: boolean): void {
    this.evidenciaSeleccionada = this.evidenciasFiltradas.map((evidencia: any) => ({ ...evidencia, seleccionado: !isChecked }));
    this.evidenciaSeleccionada.push();
  }

  public icono(extension: string): any {
    if (!extension || extension.trim() === "") {
      return obtenerIcono("iFile"); 
    }

    // Eliminar espacios adicionales al inicio y al final de la cadena
    extension = extension.trim().toLowerCase(); // Usamos .toLowerCase() por si se pasa con mayúsculas

    if (extension === "jpg" || extension === "jpeg" || extension === "png") {
      return obtenerIcono("iFileImage");
    }
    else if (extension === "mp4" || extension === "mov" || extension === "avi" || extension === "webm") {
      return obtenerIcono("iFileVideo");
    }
    else if (extension === "mp3" || extension === "aac" || extension === "ogg") {
      return obtenerIcono("iFileAudio");
    }
    else if (extension === "pdf") {
      return obtenerIcono("iPdf");
    }
    else {
      return obtenerIcono("iFile");
    }
  }

  descargarDocumentoPdf(item: any) {
    this.spiner.show();
    this.reusableArchivo.verArchivo(item.idDocumento, item.tipoEvidencia).subscribe({
      next: (resp: Blob) => {
        this.spiner.hide();
        if (resp.size > 0) {
          const fileUrl = window.URL.createObjectURL(resp);
          const a = document.createElement('a');
          a.href = fileUrl;
          /**const extension = item.extensionArchivo;
          const nombreArchivo = item.tipoEvidencia;
          let nombreSinExtension = 'archivo';
          if(extension){
            nombreSinExtension = nombreArchivo.substring(0, nombreArchivo.lastIndexOf('.'));
          }**/
          a.download = item.tipoEvidencia;
          a.click();
        } else {
          this.mensajeError('Aviso', 'Documento sin contenido');
        }
      },
      error: () => {
        this.mensajeError('Aviso', 'No se encontro el documento');
        this.spiner.hide();
      },
    });
  }

  mensajeError(mensaje: any, submensaje: any) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      },
    } as DynamicDialogConfig<AlertaData>);
  }

}
