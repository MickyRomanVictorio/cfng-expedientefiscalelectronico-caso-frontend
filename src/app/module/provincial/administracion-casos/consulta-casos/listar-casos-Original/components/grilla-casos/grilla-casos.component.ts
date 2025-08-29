import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  CasoFiscal,
  Delito,
  FormFilter,
} from '@core/interfaces/comunes/casosFiscales';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { CasoStorageService } from '@services/shared/caso-storage.service';
import { ExportarService } from '@services/shared/exportar.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { DIMENSIONES_VENTANA } from '@utils/medidas-pantalla';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DataService } from '../../DataService';
import { BarraProgresoCasoComponent } from '../carpeta-caso/barra-progreso-caso/barra-progreso-caso.component';
import { CarpetaCasoComponent } from '../carpeta-caso/carpeta-caso.component';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { IconAsset, obtenerCasoHtml, obtenerRutaParaEtapa, TipoOpcionCasoFiscal } from 'ngx-cfng-core-lib';

type DataViewType = 'list' | 'grid';

@Component({
  standalone: true,
  selector: 'app-grilla-casos',
  templateUrl: './grilla-casos.component.html',
  imports: [
    RouterModule ,
    CommonModule,
    TableModule,
    ButtonModule,
    DataViewModule,
    CarpetaCasoComponent,
    TagModule,
    BarraProgresoCasoComponent,
    PaginatorComponent

  ],
})
export class ListaCasosGridComponent {
  @Input() filterObj: FormFilter = {};
  @Input() textoBuscado!: string;
  @Input() tipoProceso: number = 1;
  @Input() public tipoOpcionCasoFiscal!: TipoOpcionCasoFiscal;

  @Output() loading = new EventEmitter<boolean>();

  rutaConsultarCasos: string = '/administracion-casos/consultar-casos-fiscales';

  protected isLoading = false;
  protected isGrid = true;
  protected FIRST = 0;
  protected casosfiscales: CasoFiscal[];
  protected casosfiscalesFiltrados: CasoFiscal[];
  protected obtenerCasoHtml = obtenerCasoHtml;
  public totalCasos: number = 0;
  public query: any = { limit: 9, page: 1, where: {} };
  public resetPage: boolean = false;
  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  constructor(
    @Inject(Casos) private Casos: Casos,
    private router: Router,
    private exportarService: ExportarService,
    private dataService: DataService,
    private casoStorageService: CasoStorageService,
    protected iconAsset: IconAsset,
  ) {
    this.casosfiscales = [];
    this.casosfiscalesFiltrados = [];
  }

  ngOnInit(): void {
    this.anchoVentana();
  }

  ngOnChanges(changes: SimpleChanges) {
    const filter = changes['filterObj'];
    if (filter) {
      this.isLoading = true;
      const d = filter.currentValue ?? {};
      this.Casos.getCasosFiscales(d).subscribe((data) => {
        this.casosfiscales = data.data;
        this.casosfiscalesFiltrados = data.data;
        this.itemPaginado.data.data = this.casosfiscalesFiltrados;
        this.itemPaginado.data.total = this.totalCasos = this.casosfiscalesFiltrados.length;
        this.actualizarPaginaRegistros(this.casosfiscalesFiltrados, false);
      });
    }

    const buscado = changes['textoBuscado'];
    if (buscado != undefined) {
      const texto = buscado.currentValue;
      this.buscarTexto(texto);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.anchoVentana(); // Actualiza el ancho cuando cambia el tamaño de la ventana
  }

  private anchoVentana() {
    //Cuando la ventana sea menor a mediano, se muestra los datos en la tabla
    if (window.innerWidth < DIMENSIONES_VENTANA.MD) {
      if (this.isGrid === true) {
        this.isGrid = !this.isGrid;
        this.dataService.actualizarPropiedad(this.isGrid);
      }
    }
  }

  protected changeViewType($event: MouseEvent, type: DataViewType) {
    this.isGrid = type === 'grid';
    this.dataService.actualizarPropiedad(this.isGrid);

    $event.preventDefault();
  }

  protected changePage($event: { first: number; rows: number }) {
    this.FIRST = $event.first;
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.casosfiscales.length > 0) {
      const headers = [
        'Número de caso',
        'Etapa',
        'Fiscal',
        'F. Registro',
        'F Último Trámite',
        'Último Acceso Procesal',
      ];
      const data: any[] = [];

      this.casosfiscales.forEach((c: CasoFiscal) => {

        const row = {
          'Número de caso': c.numeroCaso,
          Etapa: c.etapa,
          Fiscal: c.fiscal,
          //'Delitos': c.delitos,
          'F. Registro': c.fechaIngreso,
          'F Último Trámite': c.fechaUltimoTramite,
          'Último Acceso Procesal': c.ultimoTramite,
        };
        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos Fiscales')
        : this.exportarService.exportarAExcel(data, headers, 'Casos Fiscales');
      return;
    }
  }

  protected flatDelitos(delitos: Delito[]): string {
    return delitos.map((curr) => curr.nombre).join(', ');
  }

  public abrirDetalleCaso(caso: CasoFiscal): void {
    const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(
      caso.idEtapa!
    )}/caso/${caso.idCaso}`;
    this.router.navigate([`${ruta}`]);
    this.casoStorageService.setearSesionStorageCaso(caso);
    this.casoStorageService.setearTabDetalle('0');
  }

  protected getTextColor(hexColor: string): string {
    if (!hexColor) {
      return 'black';
    }
    // Convert the hexadecimal color to RGB values
    hexColor = hexColor.replace(/^#/, '');
    const r = parseInt(hexColor.slice(0, 2), 16) / 255;
    const g = parseInt(hexColor.slice(2, 4), 16) / 255;
    const b = parseInt(hexColor.slice(4, 6), 16) / 255;

    // Calculate relative luminance
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Decide text color based on background luminance
    if (luminance > 0.5) {
      return 'black'; // Use black text for light backgrounds
    } else {
      return 'white'; // Use white text for dark backgrounds
    }
  }

  protected getFilaEstilo(caso: any) {
    if (caso.flgLectura === '1') return '#1B1C1E';
    if (
      caso.plazos.filter((x: any) => x.flgNivel == 'C' && x.indSemaforo == 3)
        .length > 0
    )
      return '#F4D8D8';
    return '#E7EAED';
  }

  protected buscarTexto(buscado: string) {
      this.casosfiscalesFiltrados = this.casosfiscales.filter((data) =>
        Object.values(data).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' ||
              typeof fieldValue === 'number') &&
            fieldValue
              ?.toString()
              ?.toLowerCase()
              .includes(buscado.toLowerCase())
        )
      );
      this.itemPaginado.data.data = this.casosfiscalesFiltrados
      this.itemPaginado.data.total = this.totalCasos = this.casosfiscalesFiltrados.length
      this.actualizarPaginaRegistros(this.casosfiscalesFiltrados, true)
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
    this.casosfiscalesFiltrados = data.slice(start, end);
  }

  protected consultarCasosFiscalesPath() {
    location.href = 'app/administracion-casos/consultar-casos-fiscales/';
  }
}
