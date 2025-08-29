import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { obtenerIcono } from "@utils/icon";
import { ExportarService } from "@services/shared/exportar.service";
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TipoArchivoType } from '@core/types/exportar.type';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { DateFormatPipe } from '@pipes/format-date.pipe';
import { DateMaskModule } from '@directives/date-mask.module';
import { DerivadoRevertidoService } from '@services/provincial/bandeja-derivaciones/recibidos/derivado-revertido.service';
import { DetalleReversionModalComponent } from './detalle-reversion-modal/detalle-reversion-modal.component';
import { DerivadoDevuelto } from '@interfaces/provincial/bandeja-derivacion/enviados/derivado-devueltos/DerivadoDevuelto';
import { BandejaDerivacionRequest } from '@interfaces/provincial/bandeja-derivacion/enviados/derivado-revertidos/BandejaDerivacionRequest';
import { obtenerCasoHtml } from '@utils/utils';
import { ButtonModule } from 'primeng/button';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { DerivacionesRecibidosService } from '@core/services/provincial/bandeja-derivaciones/recibidos/derivaciones-recibidos.service';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';

@Component({
  standalone: true,
  selector: 'app-derivado-revertidos-recibido',
  templateUrl: './derivado-revertidos-recibido.component.html',
  styleUrls: ['./derivado-revertidos-recibido.component.scss'],
  providers: [MessageService, DialogService, DatePipe],
  imports: [CommonModule,
    CmpLibModule,
    TableModule,
    ToastModule,
    DateFormatPipe,
    DateMaskModule,
    ButtonModule,
    PaginatorComponent,
    CapitalizePipe,
    DateFormatPipe,
  ],
})
export default class DerivadoRevertidosRecibidoComponent implements OnInit, OnDestroy {

  protected derivadoRevertidos: DerivadoDevuelto[] = [];
  protected derivadoRevertidosFiltrados: DerivadoDevuelto[] = [];
  private referenciaModal!: DynamicDialogRef;
  private ref!: DynamicDialogRef;
  /**private filtro!: EnviadosFiltroRequest;**/
  private subscriptions: Subscription[] = [];
  private obsText!: Subscription;
  private obsBusc!: Subscription;

  protected query: any = { limit: 3, page: 1, where: {} }
  protected resetPage: boolean = false;
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
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private dialogService: DialogService,
    private exportarService: ExportarService,
    private messageService: MessageService,
    private recibidosService: DerivacionesRecibidosService,
    private revertidoService: DerivadoRevertidoService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.busquedaConTexto();
    this.busquedaConFiltro();
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

    this.obsText = this.recibidosService.textoBuscado$.subscribe(texto => {
      this.derivadoRevertidosFiltrados = this.derivadoRevertidos.filter(item =>
        Object.values(item).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
            fieldValue
              ?.toString()
              ?.toLowerCase()
              .includes(texto?.toLowerCase())
        )
      );

      this.itemPaginado.data.data = this.derivadoRevertidosFiltrados;
      this.itemPaginado.data.total = this.derivadoRevertidosFiltrados.length;
      this.updatePagedItems(this.derivadoRevertidosFiltrados, true);
    });
  }

  public busquedaConFiltro() {
    if (this.obsBusc) {
      this.obsBusc.unsubscribe();
    }

    this.obsBusc = this.recibidosService.filtroRequest$.subscribe(request => {
      /**this.filtro = request;**/
      this.listaDerivadosRevertidos(request);
    });
  }

  public listaDerivadosRevertidos(filtro: any): void {
    this.spinner.show();
    const request = {
      textBusqueda: filtro.busqueda,
      tipoFecha: filtro.tipoFecha,
      fechaDesde: this.formatearFecha(filtro.fechaDesde),
      fechaHasta: this.formatearFecha(filtro.fechaHasta),
    }
    this.subscriptions.push(
      this.revertidoService.listarDerivadoRevertidos(request).subscribe({
        next: resp => {
          this.spinner.hide();
          this.derivadoRevertidos = resp;
          this.derivadoRevertidosFiltrados = this.derivadoRevertidos;
          this.itemPaginado.data.data = this.derivadoRevertidosFiltrados;
          this.itemPaginado.data.total = this.derivadoRevertidosFiltrados.length;
          this.updatePagedItems(this.derivadoRevertidosFiltrados, false);
          const buscado = request.textBusqueda;
          if (buscado) {
            this.busquedaConTexto();
          }
        },
        error: error => {
          this.spinner.hide()
          console.error(error)
        }
      })
    );
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.updatePagedItems(paginacion.data, paginacion.resetPage)
  }

  indexPag(index: number) {
    const data = (this.query.page - 1) * this.query.limit;
    return index + data + 1;
  }

  updatePagedItems(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.derivadoRevertidosFiltrados = data.slice(start, end);
  }

  public getCaso(nroCaso: string): any {
    if (nroCaso && nroCaso.trim().length > 0) {
      return this.sanitizer.bypassSecurityTrustHtml(obtenerCasoHtml(nroCaso));
    }
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.derivadoRevertidos.length > 0) {
      const headers = ['N°', 'Número de caso', 'Remitente', 'Origen', 'F. derivación', 'F. reversión']
      const data: any[] = [];
      this.derivadoRevertidos.forEach((d: DerivadoDevuelto, i) => {
        const row = {
          'N°': (i + 1),
          'Número de caso': `${d.coCaso ? d.coCaso : ''} ${d.tipoDerivacion == '1' ? '\nDerivación directa' : ''}`,
          'Remitente': `${d.remitenteDenuncia ? 'Fiscal: ' + d.remitenteDenuncia : ''}`,
          'Origen': d.origen,
          'F. derivación': d.fechaDerivacion ? this.getFormat(`${d.fechaDerivacion} ${d.horaDerivacion}`) : '-',
          'F. reversión': d.fechaReversion ? this.getFormat(`${d.fechaReversion} ${d.horaReversion}`) : '-'
        }
        data.push(row)
      })
      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos recibidos revertidos', 'landscape')
        : this.exportarService.exportarAExcel(data, headers, 'Casos recibidos revertidos')
      return;
    }
    this.messageService.add({ severity: 'warn', detail: `No se encontraron registros para ser exportados a ${exportType}` })
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

  public verDetalleReversion(registroSelect: DerivadoDevuelto) {
    this.ref = this.referenciaModal = this.dialogService.open(DetalleReversionModalComponent, {
      width: '70%',
      contentStyle: { 'overflow-y': 'auto', 'padding': '1.5vw' },
      baseZIndex: 10000,
      showHeader: false,
      data: {
        revertido: registroSelect
      },
    });

    this.ref.onClose.subscribe((data) => {
      if (typeof data === "undefined") {
        return;
      }
    });
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
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

}
