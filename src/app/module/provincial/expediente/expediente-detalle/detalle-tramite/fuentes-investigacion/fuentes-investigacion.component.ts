import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {CommonModule, NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {Subscription} from "rxjs";
import {Archivo, DetalleFuenteInvestigacion, Etapa} from "@interfaces/comunes/detalle-fuente-investigacion";
import {TableModule} from "primeng/table";
import {FileUtil, IconAsset} from "ngx-cfng-core-lib";
import {Button} from "primeng/button";
import {obtenerIcono} from "@utils/icon";
import {format} from 'date-fns';
import {PaginatorComponent} from "@components/generales/paginator/paginator.component";
import {DialogModule} from "primeng/dialog";
import {FileUploadModule} from "primeng/fileupload";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {CargarArchivoComponent} from "@components/modals/fuente-investigacion/cargar-archivo/cargar-archivo.component";
import {
  VisualizarArchivoComponent
} from "@components/modals/fuente-investigacion/visualizar-archivo/visualizar-archivo.component";
import {Expediente} from "@utils/expediente";
import {GestionCasoService} from "@services/shared/gestion-caso.service";
import {ReusableFuentesInvestigacionService} from "@services/reusables/reusable-fuentes-investigacion.service";
import {AlertaModalComponent} from "@components/modals/alerta-modal/alerta-modal.component";
import {AlertaData} from "@interfaces/comunes/alert";
import {NgxSpinnerService} from "ngx-spinner";
import {MensajeNotificacionService} from "@services/shared/mensaje.service";
import { CasosMonitoreadosService } from '@core/services/superior/casos-monitoreados/casos-monitoreados.service';

@Component({
  selector: 'app-fuentes-investigacion',
  templateUrl: './fuentes-investigacion.component.html',
  styleUrl: './fuentes-investigacion.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    InputTextModule,
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    TableModule,
    FormsModule,
    NgOptimizedImage,
    Button,
    NgClass,
    PaginatorComponent,
    DialogModule,
    FileUploadModule,
  ],
  providers: [
    DialogService,
    MensajeNotificacionService
  ]
})
export class FuentesInvestigacionComponent implements OnInit, OnDestroy {

  public documentosFuenteInvestigacion: DetalleFuenteInvestigacion = {} as DetalleFuenteInvestigacion;
  private modalSubirArchivoRef!: DynamicDialogRef;
  private modalVisualizarRef!: DynamicDialogRef;
  private timeout?: number;
  protected esSoloLectura: boolean = false;

  constructor(
    protected iconAsset: IconAsset,
    protected fileUtil: FileUtil,
    private formulario: FormBuilder,
    private dialogService: DialogService,
    private gestionCasoService: GestionCasoService,
    private reusableFuentesInvestigacionService: ReusableFuentesInvestigacionService,
    private spinner: NgxSpinnerService,
    private mensajeService: MensajeNotificacionService,
    private readonly casosMonitoreadosService: CasosMonitoreadosService,
  ) {
  }

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual;
    console.log(this.caso);
    this.esSoloLectura = this.esModoLecturaMonitoreado() ? true : (this.caso && (this.caso.flgLectura.toString() === '1' || this.caso.flgConcluido === '1'));
    this.obtenerFuentesInvestigacion(this.caso.idCaso);
    this.formInicio();
  }

  public referenciaModal!: DynamicDialogRef;

  ngOnDestroy(): void {
    this.suscripciones.forEach((s) => s.unsubscribe());
  }

  public etapas: Etapa[] = [];
  public formFuentesInvestigacion!: FormGroup;
  public suscripciones: Subscription[] = [];
  public indexActivo: number = 0;

  // Paginación
  public query: any = {limit: 10, page: 1, where: {}}
  public etapasFiltrados: Etapa[] = [];
  private caso!: Expediente;
  protected readonly Date = Date;
  protected readonly format = format;
  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  async descargarDocumento(archivo: Archivo) {
    let urlDescargarDocumento = this.reusableFuentesInvestigacionService.getUrlDescargar(archivo!.idArchivo, archivo!.nombreArchivo);
    // urlDescargarDocumento = 'http://cfms-generales-almacenamiento-objetos-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/objetos/v2/t/almacenamiento/privado?archivoId=9286386c-4f7f-4715-92f1-1a1c0a427acd&nombreArchivo=OFICIO%20PRUEBA%20NIKOL%2013052024.pdf';

    try {
      const respuesta = await fetch(urlDescargarDocumento);

      if (!respuesta.ok) {
        throw new Error(`Error al descargar el recurso: ${respuesta.statusText}`);
      }

      const blob = await respuesta.blob();
      const urlBlob = URL.createObjectURL(blob);

      const enlace = document.createElement('a');
      enlace.href = urlBlob;
      enlace.download = archivo.nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error('Hubo un problema al descargar el recurso:', error);
    }

  }

  eliminarDocumento(documento: any): void {
    this.eliminarArchivoFuenteInvestigacion(documento.idArchivo);
    // this.eliminarArchivoFuenteInvestigacion('095f3aab-b280-4158-864b-960bd1794c5c');
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  onInput(valorBuscar: string): void {

    window.clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => {
      this.filtrarEtapas(valorBuscar);
    }, 700);
  }

  public filtrarEtapas(valorBuscar: string): void {
    if (this.formFuentesInvestigacion.valid) {
      if (!valorBuscar) {
        this.etapasFiltrados = [...this.documentosFuenteInvestigacion.etapas];
      } else {
        this.etapasFiltrados = this.documentosFuenteInvestigacion.etapas.filter(
          (data) =>
            Object.values(data).some(
              (fieldValue: any) =>
                (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
                fieldValue?.toString()?.toLowerCase().includes(valorBuscar.toLowerCase())
            )
        );
        console.log(this.etapasFiltrados)
      }

      this.itemPaginado.data.data = this.etapasFiltrados;
      this.itemPaginado.data.total = this.etapasFiltrados.length;
    }
  }

  private formInicio(): void {
    this.formFuentesInvestigacion = this.formulario.group({
      buscar: ['']
    });
    this.buscarTexto('');
  }

  private buscarTexto(valorBuscar: string): void {
    this.formFuentesInvestigacion
      .get('buscar')!
      .valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.filtrarEtapas(valorBuscar);
      });
  }

  onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.etapasFiltrados = this.etapas.slice(start, end);
  }

  public eventoVisualizar(data: Archivo): void {
    this.modalVisualizarRef = this.dialogService.open(
      VisualizarArchivoComponent,
      {
        width: '80%',
        height: 'auto',
        data: data,
        showHeader: false,
        contentStyle: {
          padding: '15px',
          'border-radius': '10px',
          overflow: 'hidden',
        },
      }
    );
  }

  public eventoSubirArchivo(): void {
    this.modalSubirArchivoRef = this.dialogService.open(
      CargarArchivoComponent,
      {
        width: '692px',
        height: '920px',
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

  public eliminarArchivoFuenteInvestigacion(idArchivo: string): void {
    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `Eliminar archivo`,
        description: `¿Está seguro de eliminar el archivo?`,
        confirmButtonText: 'Eliminar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    this.referenciaModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.spinner.show();
          this.suscripciones.push(
            this.reusableFuentesInvestigacionService
              .eliminarDocumentoRepositorio(idArchivo)
              .subscribe({
                next: (data) => {
                  this.spinner.hide();
                  if (data.code === 0) {
                    this.obtenerFuentesInvestigacion(this.caso.idCaso);
                    this.mensajeService.verMensajeNotificacion(
                      'Archivo Eliminado',
                      'Se eliminó correctamente el archivo',
                      'success'
                    );
                  }
                },
                error: () => {
                  this.spinner.hide();
                  this.mensajeService.verMensajeErrorServicio();
                },
              })
          );
        }
      },
    });
  }

  private obtenerFuentesInvestigacion(idCaso: string): void {
    this.suscripciones.push(
      this.reusableFuentesInvestigacionService.getFuenteInvestigacion(idCaso).subscribe((result: any) => {
        this.documentosFuenteInvestigacion = {...result.data};

        if (this.documentosFuenteInvestigacion.etapas) {
          this.etapasFiltrados = this.documentosFuenteInvestigacion.etapas;
          this.etapas = this.documentosFuenteInvestigacion.etapas;
        } else {
          this.etapasFiltrados = [];
        }

        this.itemPaginado.data.data = this.etapasFiltrados;
        this.itemPaginado.data.total = this.etapasFiltrados.length;

        this.updatePagedItems();
      })
    )
  }

  private esModoLecturaMonitoreado(): boolean {
    const esMonitoreado = this.casosMonitoreadosService.getEsMonitoreado(); 
    return esMonitoreado === '1';
  }

}
