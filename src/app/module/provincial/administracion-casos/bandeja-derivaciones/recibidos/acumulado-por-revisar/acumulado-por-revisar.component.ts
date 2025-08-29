import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ExportarService } from '@services/shared/exportar.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { ReversionModalComponent } from '@components/modals/reversion-modal/reversion-modal.component';
import { SelectedTipoPlazoComponent } from '@components/selected-tipo-plazo/selected-tipo-plazo.component';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription, debounceTime } from 'rxjs';
import { NumeroCasoComponent } from '../numero-caso/numero-caso.component';
import { ButtonModule } from 'primeng/button';
import { DerivacionesRecibidosService } from '@services/provincial/bandeja-derivaciones/recibidos/derivaciones-recibidos.service';
import { ApiRecibidosService } from '@services/provincial/bandeja-derivaciones/recibidos/api-recibidos.service';
import { CasosRecibidos, TipoPlazo } from '@services/provincial/bandeja-derivaciones/recibidos/casos-recibidos';
import { InformacionCasoComponent } from '@components/modals/informacion-caso/informacion-caso.component';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { AlertaData } from '@interfaces/comunes/alert';
import { DevolverModalComponent } from "@components/modals/devolver-caso/devolver-modal.component";
import { PaginatorComponent } from "@components/generales/paginator/paginator.component";
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { DateFormatPipe } from 'dist/ngx-cfng-core-lib';
import { VisorEfeModalComponent } from '@core/components/modals/visor-efe-modal/visor-efe-modal.component';

@Component({
  standalone: true,
  selector: 'app-acumulado-por-revisar',
  templateUrl: './acumulado-por-revisar.component.html',
  styleUrls: ['./acumulado-por-revisar.component.scss'],
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
export default class AcumuladoPorRevisarComponent implements OnInit, OnDestroy {

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
    private dialogService: DialogService,
    private datePipe: DatePipe,
    private titlecase: TitleCasePipe
  ) { }

  ngOnInit() {
    this.busquedaConFiltro()
  }

  ngOnDestroy() {
    /**if (this.obsText) this.obsText.unsubscribe();
    if (this.obsBusc) this.obsBusc.unsubscribe();**/

    if (this.obsText) {
      this.obsText.unsubscribe();
    }
    if (this.obsBusc) {
      this.obsBusc.unsubscribe();
    }
  }

  public busquedaConFiltro() {
    if (this.obsText) {
      this.obsText.unsubscribe();
    }

    if (this.obsBusc) {
      this.obsBusc.unsubscribe();
    }

    this.lisSelectedPlazo = ['TODOS'];

    this.obsBusc = this.dataService.filtroRequest$.subscribe(this.buscar.bind(this));

    this.obsText = this.dataService.textoBuscado$
      .pipe(debounceTime(300))
      .subscribe(text => {
        this.text = text;
      });
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
      buscarTexto: filtro.busqueda,          
      tipoFecha: filtro.tipoFecha,
      fechaDesde: this.formatearFecha(filtro.fechaDesde),
      fechaHasta: this.formatearFecha(filtro.fechaHasta),
    };
    this.spinner.show(); 
    this.apiRecibidosService.getListaRecibidosAcumulados(request)
      .subscribe({
        next: (resp) => {
          this.#lisCasosRecibidos = resp;
          this.lisCasosRecibidosTemp = this.lisCasosRecibidos;
          this.itemPaginado.data.data = this.lisCasosRecibidos;
          this.itemPaginado.data.total = this.lisCasosRecibidos.length;
          this.updatePagedItems();
          const buscado = request.buscarTexto;
          if (buscado) {  
            /**this.filtrarTexto(buscado);**/
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
      ["Número de caso"]: `Caso: ${e.codigoCaso} ${e.idCasoAcumulado ? '\nAcumulado a: ' + e.idCasoAcumulado : '' }`,
      ["Remitente"]: e.personaRemitente ? `Fical: ${e.personaRemitente}` : '',
      ["Origen"]: e.origen,
      ["F. derivación"]: e.fechaDerivacion ? this.getFormat(`${e.fechaDerivacion} ${e.horaDerivacion}`) : '-'
    }));
    const headers = Object.keys(datos.at(0)!);
    exportType === 'PDF'
      ? this.exportarService.exportarAPdf(datos, headers, 'Casos recibidos acumulados por revisar', 'landscape')
      : this.exportarService.exportarAExcel(datos, headers, 'Casos recibidos acumulados por revisar')
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

  public revertirDerivacion(idCaso: string, numeroCaso: string, idBandejaDerivacion: string, distrito: string): void {
    const revertirCasoRef = this.dialogService.open(ReversionModalComponent, {
      showHeader: false,
      data: {
        tipoAccion: "0",
        idBandejaDerivacion: idBandejaDerivacion,
        caso: numeroCaso,
        idCaso: idCaso,
        titulo: 'REVERTIR DERIVACIÓN',
        descripcion: 'Detalles reversión',
        distrito: distrito
      }
    })
    revertirCasoRef.onClose.subscribe({
      next: () => this.obsBusc,
      error: error => console.error(error)
    })
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
    if (caso.codigoCaso !== null && caso.idCaso !== null && caso.idBandejaDerivacion !== null) {
      this.referenciaModal = this.dialogService.open(InformacionCasoComponent, {
        width: '1267px',
        height: '100vh',
        showHeader: false,
        contentStyle: { padding: '20', 'border-radius': '15px', 'background-color': '#f5f2e0' },
        data: {
          numeroCaso: caso.codigoCaso,
          idCaso: caso.idCaso,
          bandeja: 'RECIBIDOS_ACUMULADO_PORREVISAR',
          idBandejaDerivacion: caso.idBandejaDerivacion,
          idCasoAcumulado: caso.idCasoAcumulado,
          soloLectura: true
        },
      })

      this.referenciaModal.onClose.subscribe({
        next: () => this.busquedaConFiltro(),
        error: error => console.error(error)
      });

    } else {
      this.mensajeError('Aviso', 'No se encontró el id del caso')
    }
  }

  private mensajeError(mensaje: string, submensaje: string) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      }
    } as DynamicDialogConfig<AlertaData>)
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
