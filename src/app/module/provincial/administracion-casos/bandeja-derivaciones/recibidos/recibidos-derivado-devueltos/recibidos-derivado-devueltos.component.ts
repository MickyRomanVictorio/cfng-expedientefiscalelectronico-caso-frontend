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
import { EnviadosFiltroRequest } from '@services/provincial/bandeja-derivaciones/enviados/EnviadosFiltroRequest';
import { Subscription } from 'rxjs';
import { DateFormatPipe } from '@pipes/format-date.pipe';
import { DateMaskModule } from '@directives/date-mask.module';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DetalleDevolucionModalComponent } from '@components/modals/detalle-devolucion-modal/detalle-devolucion-modal.component';
import {
  DerivacionesRecibidosService
} from "@services/provincial/bandeja-derivaciones/recibidos/derivaciones-recibidos.service";
import { DerivadoDevuelto } from '@interfaces/provincial/bandeja-derivacion/enviados/derivado-devueltos/DerivadoDevuelto';
import { RecibidosDerivadoDevueltosService } from '@services/provincial/bandeja-derivaciones/recibidos/derivado-devueltos/recibidos-derivado-devueltos.service';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { obtenerCasoHtml } from '@core/utils/utils';
import { ButtonModule } from 'primeng/button';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';

@Component({
  standalone: true,
  imports: [CommonModule,
    CmpLibModule,
    TableModule,
    ToastModule,
    DateFormatPipe,
    DateMaskModule,
    PaginatorComponent,
    CapitalizePipe,
    ButtonModule],
  selector: 'app-recibidos-derivado-devueltos',
  templateUrl: './recibidos-derivado-devueltos.component.html',
  styleUrls: ['./recibidos-derivado-devueltos.component.scss'],
  providers: [MessageService, DialogService, DatePipe],
})
export default class RecibidosDerivadoDevueltosComponent implements OnInit, OnDestroy {
  public derivadoDevueltos: DerivadoDevuelto[] = [];
  public derivadoDevueltosFiltrados: DerivadoDevuelto[] = [];
  public derivadoDevueltosSeleccionados = [];
  public filtro!: EnviadosFiltroRequest;
  public subscriptions: Subscription[] = [];
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
    private serviceBackend: RecibidosDerivadoDevueltosService,
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
    //this.subscriptions.push(
    /**this.obsText = this.recibidosService.textoBuscado$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(texto => {
      this.filtrarPorTexto(texto);
    })**/
    //);

    if (this.obsText) {
      this.obsText.unsubscribe();
    }

    this.obsText = this.recibidosService.textoBuscado$.subscribe(texto => {
      this.derivadoDevueltosFiltrados = this.derivadoDevueltos.filter(item =>
        Object.values(item).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
            fieldValue
              ?.toString()
              ?.toLowerCase()
              .includes(texto?.toLowerCase())
        )
      );

      this.itemPaginado.data.data = this.derivadoDevueltosFiltrados;
      this.itemPaginado.data.total = this.derivadoDevueltosFiltrados.length;
      this.updatePagedItems(this.derivadoDevueltosFiltrados, true);
    });
  }

  /**public filtrarPorTexto(texto: string): void {
    if (this.obsText) {
      this.obsText.unsubscribe();
    }

    if (!texto.trim()) {
      this.derivadoDevueltosFiltrados = [...this.derivadoDevueltos];
      return;
    }

    this.derivadoDevueltosFiltrados = this.derivadoDevueltos.filter(derivado => {
      return Object.values(derivado).some(value => {
        if (typeof value === 'string' || typeof value === 'number') {
          return value.toString().toLowerCase().includes(texto.toLowerCase());
        }
        return false;
      });
    });
  }**/

  public busquedaConFiltro() {
    if (this.obsBusc) {
      this.obsBusc.unsubscribe();
    }

    this.obsBusc = this.recibidosService.filtroRequest$.subscribe(request => {
      this.filtro = request
      this.obtenerDerivadosDevueltos(request);
    });
  }

  public obtenerDerivadosDevueltos(filtro: any): void {
    this.spinner.show()
    const filtroRequest = {
      textBusqueda: filtro.busqueda,
      tipoFecha: filtro.tipoFecha,
      fechaDesde: this.formatearFecha(filtro.fechaDesde),
      fechaHasta: this.formatearFecha(filtro.fechaHasta),
    }
    this.subscriptions.push(
      this.serviceBackend.obtenerDerivadoDevueltos(filtroRequest).subscribe({
        next: resp => {
          this.spinner.hide()
          this.derivadoDevueltos = resp;
          this.derivadoDevueltosFiltrados = this.derivadoDevueltos;
          this.itemPaginado.data.data = this.derivadoDevueltosFiltrados;
          this.itemPaginado.data.total = this.derivadoDevueltosFiltrados.length;
          this.updatePagedItems(this.derivadoDevueltosFiltrados, false);
          const buscado = filtroRequest.textBusqueda;
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
    this.derivadoDevueltosFiltrados = data.slice(start, end);
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  public getCaso(nroCaso: string): any {
    /**if (!nroCaso || nroCaso.trim() === '') {
      return this.sanitizer.bypassSecurityTrustHtml('-');
    }

    const caso = nroCaso.split('-')
    const casoHtml = `<div class="cfe-caso">${caso[0]}-<span>${caso[1]}-${caso[2]}</span>-${caso[3]}</div>`
    return this.sanitizer.bypassSecurityTrustHtml(casoHtml);**/
    if (nroCaso && nroCaso.trim().length > 0) {
      return this.sanitizer.bypassSecurityTrustHtml(obtenerCasoHtml(nroCaso));
    }
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.derivadoDevueltos.length > 0) {
      const headers = ['N°', 'Número de caso', 'Remitente', 'Origen', 'F. derivación', 'F. devolución']
      const data: any[] = [];

      this.derivadoDevueltos.forEach((d: DerivadoDevuelto, i) => {
        const row = {
          'N°': (i + 1),
          'Número de caso': `${d.coCaso ? d.coCaso : ''} ${d.tipoDerivacion == '1' ? '\nDerivación directa' : ''}`,
          'Remitente': `${d.remitenteDenuncia ? 'Fiscal: ' + d.remitenteDenuncia : ''}`,
          'Origen': d.origen,
          'F. derivación': d.fechaDerivacion ? this.getFormat(`${d.fechaDerivacion} ${d.horaDerivacion}`) : '-',
          'F. devolución': d.fechaDevolucion ? this.getFormat(`${d.fechaDevolucion} ${d.horaDevolucion}`) : '-'
        }
        data.push(row)
      })

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos recibidos devueltos', 'landscape')
        : this.exportarService.exportarAExcel(data, headers, 'Casos recibidos devueltos')
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

  public verDetalleDevolucion(idBandejaDerivacion: string, numeroCaso: string): void {
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
