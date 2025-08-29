import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { DetalleActosInvestigacionModalComponent } from '../detalle-actos-investigacion-modal/detalle-actos-investigacion-modal.component';
import { TipoAccionEnum } from '../utils/tipo-accion-enum';
import { VisualizarDocumentoActosInvestigacionModalComponent } from '../visualizar-documento-actos-investigacion-modal/visualizar-documento-actos-investigacion-modal.component';
import { FiltroActoInvestigacionComponent } from './filtro-acto-investigacion/filtro-acto-investigacion.component';
import { ActoProcesal } from './interfaces/acto-procesal-interfaces';
import { ActosInvestigacionService } from './services/actos-investigacion.service';
import { FormularioActoInvestigacion } from './interfaces/formulario-acto-investigacion-interface';
import { RespuestasActoProcesal } from './interfaces/acto-procesal-respuestas-interface';

@Component({
  selector: 'app-lista-actos-investigacion',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CheckboxModule,
    FormsModule,
    FiltroActoInvestigacionComponent,
    PaginatorComponent,
  ],
  templateUrl: './lista-actos-investigacion.component.html',
  styleUrl: './lista-actos-investigacion.component.scss',
  providers: [DialogService],
})
export class ListaActosInvestigacionComponent implements OnInit {
  @Input()
  protected tipoAccionActual: TipoAccionEnum = TipoAccionEnum.VISUALIZAR;
  @Output()
  protected respuestas: string[] = [];

  protected listaActosInvestigacion: ActoProcesal[] = [];
  protected listaActosInvestigacionOriginal: ActoProcesal[] = [];
  protected caso: Expediente;
  protected referenciaModal!: DynamicDialogRef;
  protected tipoAccionEnum = TipoAccionEnum;
  protected numeroBusqueda: number = 0; //Acumula la cantidad de búsquedas
  protected query: any = { limit: 10, page: 1, where: {} };
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  protected seleccionadoTodo: boolean = false;
  protected verMasSujetosProcesales: boolean = true;
  protected isRotated = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private actosInvestigacionService: ActosInvestigacionService,
    private gestionCasoService: GestionCasoService,
    private dialogService: DialogService
  ) {
    this.caso = this.gestionCasoService.casoActual;
  }

  ngOnInit(): void {}

  buscarActosInvestigacion(datos: FormularioActoInvestigacion) {
    datos['idCaso'] = this.caso.idCaso;
    datos['page'] = 1;
    datos['size'] = 10;

    this.actosInvestigacionService.buscarActosInvestigacion(datos).subscribe({
      next: (resp) => {
        this.listaActosInvestigacionOriginal = resp.registros;
        this.listaActosInvestigacionOriginal.forEach((element) => {
          element.seleccionado = false;
          element.respuestas = [
            {
              idRespuesta: '20CE3BDDCC8FFCA0E0650250569D508A',
              idDocumento: 'D1',
              respuesta: 'Respuesta 1',
              elementos: 2,
              clasificacion: 'Documental',
              sujetos:
                'Sujeto 1, Sujeto 2, Sujeto 3, Sujeto 4, Sujeto 5, Sujeto 6, Sujeto 7, Sujeto 8, Sujeto 9, Sujeto 10',
              fechaIngreso: '2022-01-03',
              seleccionado: false,
              isCollapsed: true,
              url: 'http://172.16.111.112:8085/assets/temporal/documento.pdf',
            },
            {
              idRespuesta: '20CE3BDDCC8FFCA0E0650250569D508A',
              idDocumento: 'D2',
              respuesta: 'Respuesta 2',
              elementos: 3,
              clasificacion: 'Pericial',
              sujetos: 'Sujeto 3, Sujeto 4',
              fechaIngreso: '2022-01-04',
              seleccionado: false,
              isCollapsed: true,
              url: 'http://172.16.111.112:8085/assets/temporal/documento.pdf',
            },
            {
              idRespuesta: '20CE3BDDCC8FFCA0E0650250569D508A',
              idDocumento: 'D3',
              respuesta: 'Respuesta 3',
              elementos: 5,
              clasificacion: 'Material',
              sujetos: 'Sujeto 3, Sujeto 4',
              fechaIngreso: '2022-01-04',
              seleccionado: false,
              isCollapsed: true,
              url: 'http://172.16.111.112:8085/assets/temporal/documento.pdf',
            },
            {
              idRespuesta: '20CE3BDDCC8FFCA0E0650250569D508A',
              idDocumento: 'D4',
              respuesta: 'Respuesta 4',
              elementos: 5,
              clasificacion: 'Declaraciones',
              sujetos:
                'Sujeto 1, Sujeto 2, Sujeto 3, Sujeto 4, Sujeto 5, Sujeto 6, Sujeto 7, Sujeto 8, Sujeto 9, Sujeto 10',
              fechaIngreso: '2022-01-04',
              seleccionado: false,
              isCollapsed: true,
              url: 'http://172.16.111.112:8085/assets/temporal/documento.pdf',
            },
          ];
        });

        this.listaActosInvestigacion = [
          ...this.listaActosInvestigacionOriginal,
        ];

        this.itemPaginado.data.data = this.listaActosInvestigacion;
        this.itemPaginado.data.total =
          this.listaActosInvestigacionOriginal.length;

        // console.log(
        //   'listaActosInvestigacionOriginal: ',
        //   JSON.stringify(this.listaActosInvestigacionOriginal)
        // );
      },
      error: (err) => {},
    });
  }

  protected eventoExpandirFila(item: any) {
    item.expanded = !item.expanded;
  }

  protected obtenerClaseTipoEvidencia(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase();
  }

  protected eventoEditarActoInvestigacion(item: any) {
    // console.log('item: ', item);
    this.referenciaModal = this.dialogService.open(
      DetalleActosInvestigacionModalComponent,
      {
        width: '1200px',
        showHeader: false,
        data: {
          caso: this.caso,
          item: item,
          tipoAccionActual: this.tipoAccionActual,
        },
      } as DynamicDialogConfig<any>
    );
  }

  private mostrarModalDocumentoPDF(item: any) {
    // console.log('item: ', item);
    this.referenciaModal = this.dialogService.open(
      VisualizarDocumentoActosInvestigacionModalComponent,
      {
        showHeader: false,
        width: '95%',
        height: '95%',
        data: {
          url: item.url,
        },
      } as DynamicDialogConfig<any>
    );
  }

  protected eventoVisualizar(item: any) {
    switch (this.tipoAccionActual) {
      case this.tipoAccionEnum.EDITAR:
        this.mostrarModalDocumentoPDF(item);
        break;
      case this.tipoAccionEnum.VISUALIZAR:
        this.eventoEditarActoInvestigacion(item);
        break;
      default:
        break;
    }
  }

  protected eventoBuscar(datos: FormularioActoInvestigacion) {
    this.numeroBusqueda++;
    // this.filtroUltimoCriterio = datos;
    this.buscarActosInvestigacion(datos);
  }

  protected eventoBuscarText(valor: string) {
    this.numeroBusqueda = 2;
    if (valor === '') {
      this.listaActosInvestigacion = this.listaActosInvestigacionOriginal;
      return;
    }
    this.listaActosInvestigacion = this.listaActosInvestigacionOriginal.filter(
      (data: ActoProcesal) =>
        Object.values(data).some(
          (atributoValor: unknown) =>
            (typeof atributoValor === 'string' ||
              typeof atributoValor === 'number') &&
            atributoValor
              ?.toString()
              ?.toLowerCase()
              .includes(valor.toLowerCase())
        )
    );
  }

  onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.listaActosInvestigacion = this.listaActosInvestigacionOriginal.slice(
      start,
      end
    );
  }

  toggleAllActosProcesales(checked: boolean): void {
    this.listaActosInvestigacion.forEach((actoProcesal) => {
      actoProcesal.seleccionado = checked;
      this.toggleActoProcesalSelection(actoProcesal, checked);
    });
  }

  toggleActoProcesalSelection(
    actoProcesal: ActoProcesal,
    checked: boolean
  ): void {
    actoProcesal.respuestas.forEach((e) => (e.seleccionado = checked));

    this.verificarTodosActoProcesalSeleccionado();
  }

  private verificarTodosActoProcesalSeleccionado() {
    this.seleccionadoTodo = this.listaActosInvestigacion.every(
      (e) => e.seleccionado
    );
  }

  toggleRespuestaSelection(actoProcesal: ActoProcesal): void {
    actoProcesal.seleccionado = actoProcesal.respuestas.every(
      (e) => e.seleccionado
    );
    this.verificarTodosActoProcesalSeleccionado();
  }

  protected eventoConfirmarSeleccion() {
    this.respuestas = this.listaActosInvestigacion
      .flatMap((actoProcesal) => actoProcesal.respuestas)
      .filter((respuesta) => respuesta.seleccionado)
      .map((respuesta) => respuesta.idRespuesta);

    console.log('idsRespuestas: ', this.respuestas);
  }

  protected get isAnySeleccionado(): boolean {
    return this.listaActosInvestigacion.some(
      (actoProcesal) =>
        actoProcesal.seleccionado ||
        actoProcesal.respuestas.some((respuesta) => respuesta.seleccionado)
    );
  }

  protected superaLimiteDeCaracteres(sujetos: String): boolean {
    return sujetos.length > 20;
  }

  protected sujetosProcesales(respuesta: RespuestasActoProcesal): String {
    return this.superaLimiteDeCaracteres(respuesta.sujetos) &&
      respuesta.isCollapsed
      ? `${respuesta.sujetos.substring(0, 20)}...`
      : respuesta.sujetos;
  }

  protected alternarVista(respuesta: RespuestasActoProcesal) {
    // this.verMasSujetosProcesales = !this.verMasSujetosProcesales;
    respuesta.isCollapsed = !respuesta.isCollapsed;
  }
}

//Interfaces, Enum Locales
// export enums TipoVista {
//   Grilla = 1,
//   Tabla = 2,
// }
// enums TipoExportar {
//   Excel = 1,
//   Pdf = 2,
// }
// export enums TipoResultado {
//   Cerrar = 0,
//   Exito = 1,
//   Error = 2,
// }
// export interface FormularioCrear {
//   casoId: string | null;
//   casoCodigo: string | null;
//   tipoClasificadorExpedienteId: string | null;
//   tipoClasificadorExpedienteNombre: string | null;
// }
// export interface CuadernoIncidental {
//   idCaso: string;
//   codigoCaso: string;
//   anioCaso: string;
//   numeroCaso: string;
//   secuencia: string;
//   clasificadorExpediente: string;
//   idTipoClasificadorExpediente: string;
//   tipoClasificadorExpediente: string;
//   etapa: string;
//   fechaCreacion: string;
//   horaCreacion: string;
//   idActoTramiteCasoUltimo: string | null;
//   ultimoTramite: string | null;
//   numeroCuaderno: string;
//   flagConcluido: boolean | null;
//   flagApelacion: string;
//   flagQueja: string;
//   entidad: string;
//   sujetosProcesales: SujetosProcesales[];
//   pestaniaApelacion: PestaniaApelacion[];
//   pestaniaApelacionMostrar: boolean;
// }
// interface PestaniaApelacion {
//   nombre: string;
//   cantidad: number;
// }
// interface SujetosProcesales {
//   item: number;
//   nombreCompleto: string;
//   nombreCorto: string;
// }
// export interface FormularioActoInvestigacion extends BusquedaFiltro {
//   idCaso?: string;
//   page?: number;
//   size?: number;
// }

// export interface BusquedaFiltro {
//   busqueda?: string;
//   fechaDesdeIngreso?: string;
//   fechaHastaIngreso?: string;
//   sujetoProcesal?: string;
//   clasificacion?: string;
//   etapa?: string;
//   actoProcesal?: string;
// }

// export enums TipoAlerta {
//   Ninguno = 0,
//   Apelacion = 1,
//   Queja = 2,
// }
// export interface CuadernoIncidentalAlertaFecha {
//   cuadernoIncidental: CuadernoIncidental;
//   tipoAlerta: TipoAlerta;
// }

// interface Order {
//   id: number;
//   product: string;
//   date: string;
//   quantity: number;
//   price: number;
// }

// interface Customer {
//   id: number;
//   name: string;
//   orders: Order[];
// }
