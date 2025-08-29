import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { obtenerIcono } from "@utils/icon";
import { ExportarService } from "@services/shared/exportar.service";
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from 'primeng/dynamicdialog';
import { TipoArchivoType } from '@core/types/exportar.type';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { RecibidosDerivadoAService } from '@services/provincial/bandeja-derivaciones/recibidos/recibido-derivadoa.service';
import {
  NumeroCasoComponent
} from "@modules/provincial/administracion-casos/bandeja-derivaciones/recibidos/numero-caso/numero-caso.component";
import { ButtonModule } from 'primeng/button';
import { AcumuladoDevuelto } from '@interfaces/provincial/bandeja-derivacion/recibidos/acumulado-devueltos/AcumuladoDevuelto';
import { RecibidosFiltroRequest } from '@interfaces/provincial/bandeja-derivacion/recibidos/RecibidosFiltroRequest';
import { obtenerCasoHtml } from '@utils/utils';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { DerivacionesRecibidosService } from '@core/services/provincial/bandeja-derivaciones/recibidos/derivaciones-recibidos.service';
import { DateFormatPipe } from 'dist/ngx-cfng-core-lib';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { DetalleDevolucionModalComponent } from '@core/components/modals/detalle-devolucion-modal/detalle-devolucion-modal.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';

@Component({
  standalone: true,
  selector: 'app-acumulado-devueltos',
  templateUrl: './acumulado-devueltos.component.html',
  styleUrls: ['./acumulado-devueltos.component.scss'],
  providers: [MessageService, DialogService],
  imports: [
    CommonModule,
    CmpLibModule,
    TableModule,
    ToastModule,
    NumeroCasoComponent,
    ButtonModule,
    PaginatorComponent,
    ButtonModule,
    DateFormatPipe,
    CapitalizePipe
  ],
})
export default class AcumuladoDevueltosRecibidoComponent implements OnInit, OnDestroy {

  protected acumuladoDevueltos: AcumuladoDevuelto[] = [];
  protected acumuladoDevueltosTemp: AcumuladoDevuelto[] = [];

  /**private filtro!: RecibidosFiltroRequest**/
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
    private serviceBackend: RecibidosDerivadoAService,
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
      this.acumuladoDevueltosTemp = this.acumuladoDevueltos.filter(item =>
        Object.values(item).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
            fieldValue
              ?.toString()
              ?.toLowerCase()
              .includes(texto?.toLowerCase()) 
        )
      );

      this.itemPaginado.data.data = this.acumuladoDevueltosTemp;
      this.itemPaginado.data.total = this.acumuladoDevueltosTemp.length;
      this.updatePagedItems(this.acumuladoDevueltosTemp, true);
    });
  }

  public busquedaConFiltro() {
    if (this.obsBusc) {
      this.obsBusc.unsubscribe();
    }

    this.obsBusc = this.recibidosService.filtroRequest$.subscribe(request => {
      /**this.filtro = request;**/
      this.obtenerEnviadoDevueltos(request);
    });
  }

  public obtenerEnviadoDevueltos(filtro: any): void {
    this.spinner.show()
    const request = {
      textBusqueda: filtro.busqueda,
      tipoFecha: filtro.tipoFecha,
      fechaDesde: this.formatearFecha(filtro.fechaDesde),
      fechaHasta: this.formatearFecha(filtro.fechaHasta),
    }
    this.subscriptions.push(
      this.serviceBackend.getListaAcumulados(request).subscribe({
        next: resp => {
          this.spinner.hide()
          this.acumuladoDevueltos = resp;
          this.acumuladoDevueltosTemp = this.acumuladoDevueltos;
          this.itemPaginado.data.data = this.acumuladoDevueltosTemp;
          this.itemPaginado.data.total = this.acumuladoDevueltosTemp.length;
          this.updatePagedItems(this.acumuladoDevueltosTemp, false);
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
    )
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
    this.acumuladoDevueltosTemp = data.slice(start, end);
  }

  public verDevolucion(idBandejaDerivacion: string, numeroCaso: string): void {
    const verDetalleRef = this.dialogService.open(DetalleDevolucionModalComponent, {
      showHeader: false,
      data: {
        numeroCaso,
        idBandejaDerivacion
      }
    })
    verDetalleRef.onClose.subscribe({
      next: () => this.busquedaConFiltro(),
      error: error => console.error(error)
    })
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.acumuladoDevueltos.length > 0) {
      const headers = ['N°', 'Número de caso', 'Remitente', 'Origen', 'F. derivación', 'F. devolución']
      const data: any[] = [];

      this.acumuladoDevueltos.forEach((d: AcumuladoDevuelto, i) => {
        const row = {
          'N°': (i + 1),
          'Número de caso': `Caso: ${d.codigoCaso ? d.codigoCaso : ''} ${d.acumuladoa ? '\nAcumulado a: ' + d.acumuladoa : ''}`,
          'Remitente': `${d.remitentedenuncia ? 'Fiscal: ' + d.remitentedenuncia : ''}`,
          'Origen': d.origen,
          'F. derivación': d.fechaResultado ? this.getFormat(`${d.fechaResultado} ${d.horaResultado}`) : '-',
          'F. devolución': d.fechaDevolucion ? this.getFormat(`${d.fechaDevolucion} ${d.horaDevolucion}`) : '-'
        }
        data.push(row)
      })

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos recibidos acumulados devueltos', 'landscape')
        : this.exportarService.exportarAExcel(data, headers, 'Casos recibidos acumulados devueltos')
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

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  public getCaso(nroCaso: string): any {
    if (nroCaso && nroCaso.trim().length > 0) {
      return this.sanitizer.bypassSecurityTrustHtml(obtenerCasoHtml(nroCaso));
    }
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
