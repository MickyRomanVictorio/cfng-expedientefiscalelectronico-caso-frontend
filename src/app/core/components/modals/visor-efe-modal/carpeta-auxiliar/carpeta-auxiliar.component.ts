import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarpetaAuxiliarDocumentosService } from '@services/provincial/carpteta-auxiliar/carpeta-auxiliar-documentos.service';
import { VisorEfeService } from '@services/visor/visor.service';
import { ModalSubirCargoComponent } from '@modules/provincial/expediente/expediente-detalle/carpeta-auxiliar/carpeta-auxiliar-detalle/modal-subir-cargo/modal-subir-cargo.component';
import { descargarArchivoB64, formatoPesoArchivo } from '@utils/file';
import { obtenerIcono } from '@utils/icon';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Expediente } from '@core/utils/expediente';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GestionCasoService } from '@services/shared/gestion-caso.service';

@Component({
  selector: 'app-carpeta-auxiliar',
  standalone: true,
  imports: [
    CmpLibModule,
    ScrollPanelModule,
    CommonModule,
    SelectButtonModule,
    FormsModule,
    TableModule,
    NgxExtendedPdfViewerModule,
    ToastModule,
  ],
  templateUrl: './carpeta-auxiliar.component.html',
  styleUrls: ['./carpeta-auxiliar.component.scss'],
  providers: [DatePipe, MessageService, DialogService],
})
export class CarpetaAuxiliarComponent implements OnInit {

  @Input()
  public idCaso: string = '';

  @Input()
  public caso!:Expediente;

  @Input() numeroCaso: string = ''

  @ViewChildren('filaDocumentoRef', { read: ElementRef })
  protected filaDocumentoRef!: QueryList<ElementRef>;

  protected gruposDocumentosOriginal: GrupoDocumento[] = [];
  protected gruposDocumentos: GrupoDocumento[] = [];
  protected convertirMBaBytes = (megabytes: number) => megabytes * 1024 * 1024;
  protected obtenerIcono = obtenerIcono;
  protected formatoPesoArchivo = formatoPesoArchivo;
  protected seleccionado: Documentos[] = [];
  protected listatipoDocumentoConsulta: any[] = [
    { name: 'Todos', value: '0' },
    { name: 'Cargo de notificación', value: '12' },
    { name: 'Cargo de citación', value: '13' },
    { name: 'Cargo oficio', value: '30' },
  ];
  protected pdfBase64: string | null = '';
  protected totalEncontrado: number = 0;
  protected buscarValor: string = '';
  private busquedaTiempo: any = null;
  protected tipoDocumentoConsultaSeleccionado: string = '0';
  protected documentoSeleccionado!: Documentos | undefined;
  protected documentoSeleccionadoIndex = 0;
  protected documentos: CodigoCorrelativo[] = [];
  private modalSubirCargoRef!: DynamicDialogRef;

  constructor(
    private readonly datePipe: DatePipe,
    private readonly dialogService: DialogService,
    private readonly dataService: VisorEfeService,
    private readonly messageService: MessageService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly carpetaAuxiliarDocumentosService: CarpetaAuxiliarDocumentosService,
  ) {}

  ngOnInit(): void {
    this.cargarDatosInicio();
    this.obtenerCasoFiscal();
  }

  private obtenerCasoFiscal(): void {
    if (this.caso != null) return;
    this.gestionCasoService.obtenerCasoFiscalV2(this.idCaso).pipe(
      tap(() => this.caso = this.gestionCasoService.expedienteActual)
    ).subscribe();
  }

  private cargarDatosInicio() {
    this.carpetaAuxiliarDocumentosService
      .obtenerDocumentos(this.idCaso)
      .subscribe({
        next: (rs) => {
          if (rs && rs.code === 200) {
            this.gruposDocumentosOriginal = rs.data.carpetaAuxiliar;
            this.gruposDocumentos = [...this.gruposDocumentosOriginal];
            this.procesarDatos();
            this.seleccionarArchivo(this.documentoSeleccionadoIndex);
          }
        },
      });
  }

  private procesarDatos() {
    let total = 0;
    this.documentos = [];
    this.documentoSeleccionado = undefined;
    this.documentoSeleccionadoIndex = 0;
    this.pdfBase64 = '';
    //
    this.gruposDocumentos.forEach((el: GrupoDocumento) => {
      el.documentos.forEach((d: Documentos) => {
        total = total + 1;
        this.documentos.push({
          codigo: el.codigo,
          correlativo: d.correlativo,
        });
      });
    });
    this.totalEncontrado = total;
  }

  protected seleccionarArchivoAnterior() {
    this.documentoSeleccionadoIndex = this.documentoSeleccionadoIndex - 1;
    if (this.documentoSeleccionadoIndex < 0) {
      this.documentoSeleccionadoIndex = this.documentos.length - 1;
    }
    this.seleccionarArchivo(this.documentoSeleccionadoIndex);
  }

  protected seleccionarArchivoSiguiente() {
    this.documentoSeleccionadoIndex = this.documentoSeleccionadoIndex + 1;
    if (this.documentoSeleccionadoIndex >= this.documentos.length) {
      this.documentoSeleccionadoIndex = 0;
    }
    this.seleccionarArchivo(this.documentoSeleccionadoIndex);
  }

  protected eventoDescargarTodo() {
    const docs: string[] = [];
    this.gruposDocumentos.forEach((el: GrupoDocumento) => {
      el.documentos.forEach((d: Documentos) => {
        docs.push(d.idDocumento);
      });
    });
    if (docs.length > 0) this.descargarArchivos(docs);
  }

  protected eventoDeseleccionarTodo() {
    this.seleccionado = [];
  }

  protected descargarArchivosSeleccionados() {
    if (this.seleccionado.length === 0) {
      return;
    }
    if (this.seleccionado.length > 1) {
      this.descargarArchivos(
        this.seleccionado.map((documento) => documento.idDocumento)
      );
      return;
    }
    this.descargarArchivo(
      this.seleccionado[0].idDocumento,
      this.seleccionado[0].nombreDocumento
    );
  }

  private descargarArchivos(codigos: string[]) {
    // this.dataService.getPDF64Todos(codigos).subscribe({
    //   next: (rs: any) => {
    //     if (rs && rs.code === 200) {
    //       descargarArchivoB64(
    //         rs.data.contenido,
    //         rs.data.nombre.replace('.pdf', '')
    //       );
    //     }
    //   },
    //   error: () => {
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Ocurrio un error',
    //       detail: 'No se puede descargar los documentos',
    //     });
    //   },
    // });
  }

  protected eventoBuscarTipoDocumento(seleccionado: any): void {
    this.buscarValor = '';
    if (seleccionado.value === '0') {
      this.gruposDocumentos = [...this.gruposDocumentosOriginal];
      this.procesarDatos();
      return;
    }
    const datosEncontrado = this.gruposDocumentosOriginal
      .map((item: GrupoDocumento) => {
        const filteredDocuments = item.documentos.filter(
          (doc: Documentos) => doc.idTipoDocumento === seleccionado.value
        );
        return {
          ...item,
          documentos: filteredDocuments,
        };
      })
      .filter((item) => item.documentos.length > 0);
    //
    this.gruposDocumentos = [...datosEncontrado];
    this.procesarDatos();
  }

  protected eventoBuscar(e: Event) {
    clearTimeout(this.busquedaTiempo); //Evitar búsquedas continuas
    const valor = (e.currentTarget as HTMLInputElement).value.toLowerCase();
    this.busquedaTiempo = setTimeout(() => {
      this.buscarXTexto(valor.toLowerCase());
    }, 500);
  }

  private buscarXTexto(v: string) {
    this.tipoDocumentoConsultaSeleccionado = '0';
    const datosEncontrado = this.gruposDocumentosOriginal
      .map((item: GrupoDocumento) => {
        const filteredDocuments = item.documentos.filter((doc: Documentos) => {
          return (
            doc.tramite?.toLowerCase().includes(v) ||
            doc.actoProcesal?.toLowerCase().includes(v) ||
            doc.tipoDocumento?.toLowerCase().includes(v) ||
            doc.nombreDocumento?.toLowerCase().includes(v)
          );
        });
        return {
          ...item,
          documentos: filteredDocuments,
        };
      })
      .filter((item) => item.documentos.length > 0);
    //
    this.gruposDocumentos = [...datosEncontrado];
    this.procesarDatos();
  }

  protected formatoFecha(fecha: string | null): string {
    if (fecha === null || fecha === '') return '';
    const date = new Date(fecha);
    return this.datePipe.transform(date, 'dd MMM yyyy hh:mm:ss a', 'UTC')!;
  }

  protected eventoSeleccionarArchivo(codigo: string, correlativo: number) {
    const index = this.documentos.findIndex(
      (elm: CodigoCorrelativo) =>
        elm.codigo === codigo && elm.correlativo === correlativo
    );
    this.documentoSeleccionadoIndex = index;
    this.seleccionarArchivo(index);
  }

  protected seleccionarArchivo(index: number): void {
    const codigoCorrelativo = this.documentos[index];
    if (codigoCorrelativo === undefined) return;
    const grupo: GrupoDocumento = this.gruposDocumentos.find(
      (elm) => elm.codigo === codigoCorrelativo.codigo
    )!;
    grupo.mostrarContenido = true;
    this.documentoSeleccionado = grupo.documentos.find(
      (elm) => elm.correlativo === codigoCorrelativo.correlativo
    );
    this.documentoSeleccionado!['_codigoGrupo'] = codigoCorrelativo.codigo;
    //
    this.pdfBase64 = null;
    //
    this.consultarArchivo(this.documentoSeleccionado!.idDocumento);
    this.posicionScrollbar(this.documentoSeleccionado!.correlativo + '');
  }

  protected documentoFilaColor(
    correlativo: number,
    codigoGrupo: string
  ): string {
    if (
      this.documentoSeleccionado &&
      this.documentoSeleccionado.correlativo === correlativo &&
      this.documentoSeleccionado._codigoGrupo === codigoGrupo
    ) {
      return '#F7EED4';
    }
    return '';
  }

  private posicionScrollbar(id: string) {
    setTimeout(() => {
      const selectedElement = this.filaDocumentoRef.find((element) => {
        const elId = element.nativeElement.getAttribute('id');
        return elId && elId === 'fila-' + id;
      });

      if (selectedElement) {
        selectedElement.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    }, 100);
  }

  private consultarArchivo(idDocumento: string) {
    this.dataService.getPDF64(idDocumento).subscribe({
      next: (response) => {
        if (response.data) {
          this.pdfBase64 =
            'data:application/pdf;base64,' + response.data[0].archivo;
        } else {
          this.pdfBase64 = null;
        }
      },
      error: () => {},
    });
  }

  protected descargarArchivo(idDocumento: string, nombre?: string) {
    this.dataService.getPDF64(idDocumento).subscribe({
      next: (rs: any) => {
        if (rs && rs.code === 200) {
          descargarArchivoB64(
            rs.data[0].archivo,
            nombre ? nombre : rs.data[0].nombre ?? idDocumento
          );
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Ocurrio un error',
            detail: 'No se puede descargar el documento',
          });
        }
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

  public eventoSubirCargo(): void {
    this.modalSubirCargoRef = this.dialogService.open(
      ModalSubirCargoComponent,
      {
        width: '1400px',
        height: '97vh',
        data: this.caso,
        showHeader: false,
        contentStyle: {
          padding: '0',
          'border-radius': '15px',
          overflow: 'hidden',
        },
      }
    );
  }
}

// Interfaces Locales
export interface GrupoDocumento {
  codigo: string;
  nombre: string;
  documentos: Documentos[];
  mostrarContenido: boolean;
}
export interface Documentos {
  idDocumento: string;
  idTipoDocumento: string;
  tipoDocumento: string;
  nombreDocumento: string;
  documento: string;
  fechaRecepcion: string;
  fechaRegistro: string;
  asunto: string;
  pesoArchivo: number;
  folioInicial: number;
  folioFinal: number;
  totalFolio: number;
  idEtapa: string;
  etapa: string;
  idActoTramite: string;
  tramite: string;
  idActoProcesal: string;
  actoProcesal: string;
  estado: string;
  correlativo: number;
  filaSeleccionada: boolean;
  _codigoGrupo?: string;
}

export interface CodigoCorrelativo {
  codigo: string;
  correlativo: number;
}

export interface CasoCarpetaAuxiliar {
  tipo: number;
  idCaso: string;
  nroCaso: string;
  actoProcesalId: string;
  actoProcesalNombre: string;
  etapaId: string;
  etapaNombre: string;
  procesoId: number;
}
