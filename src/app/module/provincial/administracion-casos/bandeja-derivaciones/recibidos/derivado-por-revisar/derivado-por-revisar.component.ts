import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { obtenerIcono } from "@utils/icon";
import {
  DerivacionesRecibidosService
} from "@services/provincial/bandeja-derivaciones/recibidos/derivaciones-recibidos.service";
import {
  NumeroCasoComponent
} from "@modules/provincial/administracion-casos/bandeja-derivaciones/recibidos/numero-caso/numero-caso.component";
import { ButtonModule } from "primeng/button";
import { ExportarService } from "@services/shared/exportar.service";
import { CasosRecibidos, TipoPlazo } from "@services/provincial/bandeja-derivaciones/recibidos/casos-recibidos";
import { SelectedTipoPlazoComponent } from "@components/selected-tipo-plazo/selected-tipo-plazo.component";
import { ApiRecibidosService } from "@services/provincial/bandeja-derivaciones/recibidos/api-recibidos.service";
import { debounceTime } from "rxjs/operators";
import { NgxSpinnerService } from "ngx-spinner";
import { Subscription } from "rxjs";
import { InformacionCasoComponent } from "@components/modals/informacion-caso/informacion-caso.component";
import { DevolverModalComponent } from "@components/modals/devolver-caso/devolver-modal.component";
import { HistorialDerivacionComponent } from '@components/modals/historial-derivacion/historial-derivacion.component';
import { PaginatorComponent } from "@components/generales/paginator/paginator.component";
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { DateFormatPipe } from 'dist/ngx-cfng-core-lib';
import { TipoArchivoType } from '@core/types/exportar.type';
import { VisorEfeModalComponent } from '@core/components/modals/visor-efe-modal/visor-efe-modal.component';
@Component({
  standalone: true,
  selector: 'app-derivado-por-revisar',
  templateUrl: './derivado-por-revisar.component.html',
  styleUrls: ['./derivado-por-revisar.component.scss'],
  providers: [MessageService, DialogService],
  imports: [
    CommonModule,
    CmpLibModule,
    TableModule,
    ToastModule,
    NumeroCasoComponent,
    ButtonModule,
    SelectedTipoPlazoComponent,
    PaginatorComponent,
    CapitalizePipe,
    DateFormatPipe
  ],
})
export default class DerivadoPorRevisarComponent implements OnInit, OnDestroy {

  protected readonly obtenerIcono = obtenerIcono;
  private lisSelectedPlazo: Array<TipoPlazo> = [];
  #lisCasosRecibidos: Array<CasosRecibidos> = [];
  private lisCasosRecibidosTemp: Array<CasosRecibidos> = [];
  private obsText!: Subscription;
  private obsBusc!: Subscription;
  private text = '';
  private referenciaModal!: DynamicDialogRef;

  protected query: any = { limit: 3, page: 1, where: {} }
  //protected resetPage: boolean = false;
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  constructor(
    private dataService: DerivacionesRecibidosService,
    private exportarService: ExportarService,
    private messageService: MessageService,
    private apiRecibidosService: ApiRecibidosService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private dialogService: DialogService,
  ) {
  }

  ngOnInit() {
    this.lisSelectedPlazo = ['TODOS'];
    this.busquedaConTexto();
    this.busquedaConFiltro()
  }

  ngOnDestroy() {
    if (this.obsText) {
      this.obsText.unsubscribe();
    }
    if (this.obsBusc) {
      this.obsBusc.unsubscribe();
    }
  }

  public busquedaConTexto() {
    if (this.obsText) {
      this.obsText.unsubscribe();
    }

    this.obsText = this.dataService.textoBuscado$
      .pipe(debounceTime(300))
      .subscribe(text => {
        this.text = text
      });
  }

  public busquedaConFiltro() {
    if (this.obsBusc) {
      this.obsBusc.unsubscribe();
    }

    this.obsBusc = this.dataService.filtroRequest$.subscribe(
      this.buscar.bind(this)
    );
  }

  get lisCasosRecibidos() {
    if (this.lisSelectedPlazo.at(0) === 'TODOS') {
      return this.#lisCasosRecibidos.filter(this.searchText.bind(this));
    } else {
      return this.#lisCasosRecibidos
        .filter(e => this.lisSelectedPlazo.includes(e.tipoPlazo))
        .filter(this.searchText.bind(this));
    }
  }

  buscar(filtro: any) {
    const request = {
      textBusqueda: filtro.busqueda,
      tipoFecha: filtro.tipoFecha,
      fechaDesde: this.formatearFecha(filtro.fechaDesde),
      fechaHasta: this.formatearFecha(filtro.fechaHasta),
    };
    this.spinner.show();
    this.apiRecibidosService.getListaRecividos(request)
      .subscribe({
        next: (resp) => {
          this.#lisCasosRecibidos = resp;
          this.lisCasosRecibidosTemp = this.lisCasosRecibidos;
          this.itemPaginado.data.data = this.lisCasosRecibidos;
          this.itemPaginado.data.total = this.lisCasosRecibidos.length;
          this.updatePagedItems();
          const buscado = request.textBusqueda;
          if (buscado) {
            /**this.busquedaConTexto();**/
          }
          this.spinner.hide();
          const { REBICIDOS, ACUMULADOS } = this.#lisCasosRecibidos.reduce(this.calCantidad(), {
            REBICIDOS: 0,
            ACUMULADOS: 0
          });
          this.dataService.cantDerivados = REBICIDOS;
          this.dataService.canAculumados = ACUMULADOS;
        },
        error: (err) => {
          console.log(err);
          this.spinner.hide();
        }
      });
  }

  calCantidad() {
    return (acc: any, e: any) => {
      acc[e.tipoCasoRevisar] = acc[e.tipoCasoRevisar] + 1;
      return acc;
    }
  }

  onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems()
  }

  indexPag(index: number) {
    const data = (this.query.page - 1) * this.query.limit;
    return index + data + 1;
  }

  updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.#lisCasosRecibidos = this.lisCasosRecibidosTemp.slice(start, end);
  }

  searchText(e: CasosRecibidos) {
    if (!Boolean(this.text)) return true;
    return Object.values(e).some(v => {
      if (typeof v === 'string' || typeof v === 'number')
        return v.toString().toLowerCase().includes(this.text.toLowerCase());
      return false;
    })
  }

  chengePlazo($event: Array<TipoPlazo>) {
    this.lisSelectedPlazo = $event;
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.lisCasosRecibidos.length === 0) {
      this.messageService.add({ severity: 'warn', detail: `No se encontraron registros para ser exportados a ${exportType}` })
      return;
    }

    const datos = this.lisCasosRecibidos.map((e, i) => ({
      ["N°"]: (i + 1),
      ["Número de caso"]: `${e.codigoCaso ? e.codigoCaso : ''} ${e.tipoDerivacion}`,
      ["Remitente"]: e.remitentedenuncia ? `Fical: ${e.remitentedenuncia}` : '',
      ["Origen"]: e.origen,
      ["Fecha derivación"]: e.fechaResultado ? this.getFormat(`${e.fechaResultado} ${e.horaResultado}`) : '-'
    }));
    const headers = Object.keys(datos.at(0)!);
    exportType === 'PDF'
      ? this.exportarService.exportarAPdf(datos, headers, 'Casos recibidos por revisar', 'landscape')
      : this.exportarService.exportarAExcel(datos, headers, 'Casos recibidos por revisar')
  }

  getFormat(fecha: string) {
    // Convierte "17/01/2025 16:16" a un formato que JavaScript pueda leer
    const [day, month, year, hour, minute] = fecha.split(/[\s/:\-]/);
    const formattedDate = `${year}-${month}-${day}T${hour}:${minute}:00`;

    // Usamos DatePipe para convertirla al formato deseado
    const formatted = this.datePipe.transform(formattedDate, 'dd MMM yyyy, hh:mm a');

    // Esto devolverá "17 Ene. 2025, 04:16 p.m."
    return formatted!;
  }

  public devolverDerivacion(idCaso: string, numeroCaso: string, idBandejaDerivacion: string): void {
    const devolverCasoRef = this.dialogService.open(DevolverModalComponent, {
      showHeader: false,
      data: {
        tipoAccion: "0",
        idBandejaDerivacion: idBandejaDerivacion,
        caso: numeroCaso,
        idCaso: idCaso,
        titulo: 'Devolver',
        descripcion: 'Detalles de devolución',

      }
    })
    devolverCasoRef.onClose.subscribe({
      next: () => this.busquedaConFiltro(),
      error: error => console.error(error)
    })
  }

  /**********************/
  abrirModalInformacionCaso(caso: any): void {
    this.referenciaModal = this.dialogService.open(InformacionCasoComponent, {
      width: '1300px',
      height: '100vh',
      showHeader: false,
      contentStyle: { padding: '20', 'border-radius': '15px', 'background-color': '#f5f2e0' },
      data: { numeroCaso: caso.codigoCaso, idCaso: caso.idCaso, bandeja: 'RECIBIDOS_DERIVADO_PORREVISAR', soloLectura: true },
    })

    this.referenciaModal.onClose.subscribe({
      next: () => this.busquedaConFiltro(),
      error: error => console.error(error)
    });
  }

  protected mostrarVisorDocumental(idCaso: string, numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      contentStyle: { "padding": 0 },
      data: {
        caso: idCaso,
        numeroCaso: numeroCaso,
        idCaso: idCaso,
        title: 'Visor documental del caso:',
        description: 'Hechos del caso',
      }
    })

    this.referenciaModal.onClose.subscribe({
      next: () => this.busquedaConFiltro(),
      error: error => console.error(error)
    })
  }

  abrirHistorialDerivaciones(): void {
    this.referenciaModal = this.dialogService.open(HistorialDerivacionComponent, {
      width: '1400px',
      height: '80vh',
      showHeader: false,
      contentStyle: { padding: '10' },
      data: {
        numeroCaso: "4006014501-2024-52-0",
        idCaso: "1AA41E8E4220C5CDE0650250569D508A"
      },
    })
  }

  formatearFecha(fecha: any): string {
    if (fecha instanceof Date) {
      const dia = fecha.getDate();
      const mes = fecha.getMonth() + 1;
      const año = fecha.getFullYear();
      return `${dia}/${mes}/${año}`;
    } else {
      return fecha;
    }
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

}
