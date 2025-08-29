import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { obtenerIcono } from "@utils/icon";
import { ExportarService } from "@services/shared/exportar.service";
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService, DynamicDialogRef, DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogModule } from "primeng/dialog";
import { TipoArchivoType } from '@core/types/exportar.type';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { DateFormatPipe } from '@pipes/format-date.pipe';
import { DateMaskModule } from '@directives/date-mask.module';
import { DerivacionesRecibidosService } from '@services/provincial/bandeja-derivaciones/recibidos/derivaciones-recibidos.service';
import { RecibidosAcumuladosRevertidosService } from '@services/provincial/bandeja-derivaciones/recibidos/recibidos-acumulados-revertidos.service';
import { VerCasoRecibidoReversionComponent } from '@components/modals/ver-caso-recibido-reversion/ver-caso-recibido-reversion.component';
import { RecicidoAcumuladoRevertido } from '@interfaces/provincial/bandeja-derivacion/recibidos/acumulado-revertidos/RecibidoAcumuladoRevertido';
import { RecibidosRevertidosFiltroRequest } from '@interfaces/provincial/bandeja-derivacion/recibidos/acumulado-revertidos/RecibidosRevertidosFiltroRequest';
import { obtenerCasoHtml } from '@utils/utils';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { ButtonModule } from 'primeng/button';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';

@Component({
  selector: 'app-bandeja-acumulado-revertidos',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    TableModule,
    ToastModule,
    DateFormatPipe,
    DateMaskModule,
    DynamicDialogModule,
    DialogModule,
    ButtonModule,
    PaginatorComponent,
    CapitalizePipe],
  templateUrl: './bandeja-acumulado-revertidos.component.html',
  styleUrls: ['./bandeja-acumulado-revertidos.component.scss'],
  providers: [MessageService, DialogService],
})
export default class BandejaAcumuladoRevertidosComponent implements OnInit, OnDestroy {
  protected derivadoRevertidos: RecicidoAcumuladoRevertido[] = [];
  protected derivadoRevertidosTotal: RecicidoAcumuladoRevertido[] = [];
  private subscriptions: Subscription[] = [];
  private referenciaModal!: DynamicDialogRef;
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
    private derivacionAcumuladoService: RecibidosAcumuladosRevertidosService,
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
      this.derivadoRevertidosTotal = this.derivadoRevertidos.filter(item =>
        Object.values(item).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
            fieldValue
              ?.toString()
              ?.toLowerCase()
              .includes(texto?.toLowerCase())
        )
      );

      this.itemPaginado.data.data = this.derivadoRevertidosTotal;
      this.itemPaginado.data.total = this.derivadoRevertidosTotal.length;
      this.updatePagedItems(this.derivadoRevertidosTotal, true);
    });
  }

  public busquedaConFiltro() {
    if (this.obsBusc) {
      this.obsBusc.unsubscribe();
    }

    this.obsBusc = this.recibidosService.filtroRequest$.subscribe(request => {
      this.obtenerAcumuladosRevertidos(request);
    });
  }

  public obtenerAcumuladosRevertidos(filtro: any): void {
    this.spinner.show();
    const request = {
      textBusqueda: filtro.busqueda,
      tipoFecha: filtro.tipoFecha,
      fechaDesde: this.formatearFecha(filtro.fechaDesde),
      fechaHasta: this.formatearFecha(filtro.fechaHasta),
    }
    this.subscriptions.push(
      this.derivacionAcumuladoService.obtenerDerivadosAcumuladosRevertidos(request).subscribe({
        next: resp => {
          this.spinner.hide()
          this.derivadoRevertidos = resp;
          this.derivadoRevertidosTotal = this.derivadoRevertidos;
          this.itemPaginado.data.data = this.derivadoRevertidosTotal;
          this.itemPaginado.data.total = this.derivadoRevertidosTotal.length;
          this.updatePagedItems(this.derivadoRevertidosTotal, false);
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
    this.derivadoRevertidosTotal = data.slice(start, end);
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.derivadoRevertidos.length > 0) {
      const headers = ['N°', 'Número de caso', 'Remitente', 'Origen', 'F. derivación', 'F. reversión']
      const data: any[] = [];
      this.derivadoRevertidos.forEach((d: RecicidoAcumuladoRevertido, i) => {
        const row = {
          'N°': (i + 1),
          'Número de caso': `Caso: ${d.caso ? d.caso : ''} ${d.acumuladoa ? '\nAcumulado a: ' + d.acumuladoa : ''}`,
          'Remitente': `${d.remitente ? 'Fiscal: ' + d.remitente : ''}`,
          'Origen': d.origen,
          'F. derivación': d.fechaDerivacion ? this.getFormat(`${d.fechaDerivacion} ${d.horaDerivacion}`) : '-',
          'F. reversión': d.fechadeReversion ? this.getFormat(`${d.fechadeReversion} ${d.horadeReversion}`) : '-'
        }
        data.push(row)
      })
      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos recibidos acumulados revertidos', 'landscape')
        : this.exportarService.exportarAExcel(data, headers, 'Casos recibidos acumulados revertidos')
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
    return '';
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

  public verReversion(registroSelect: RecicidoAcumuladoRevertido): void {
    this.referenciaModal = this.dialogService.open(VerCasoRecibidoReversionComponent, {
      width: '70%',
      contentStyle: { 'overflow-y': 'auto', 'padding': '1.5vw' },
      baseZIndex: 10000,
      showHeader: false,
      data: {
        revertido: registroSelect
      }
    });

    this.referenciaModal.onClose.subscribe({
      next: () => this.busquedaConFiltro(),
      error: error => console.error(error)
    })
  }
}
