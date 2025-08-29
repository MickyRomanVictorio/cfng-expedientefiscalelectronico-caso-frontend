import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { DerivacionesEnviadosService } from '@services/provincial/bandeja-derivaciones/enviados/DerivacionesEnviadosService';
import { EnviadosDerivadoAService } from '@services/provincial/bandeja-derivaciones/enviados/enviados-derivadoa.service';
import { ExportarService } from '@services/shared/exportar.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { formatoFechaPartesPipe } from '@pipes/formato-fecha-dos-lineas';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { ActualizarDestinoModalComponent } from '../bandeja-derivaciones-enviados/aceptados/modal-actualizar-destino/actualizarDestino-modal.component';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { DateFormatPipe } from 'dist/ngx-cfng-core-lib';
import { ButtonModule } from 'primeng/button';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';

@Component({
  standalone: true,
  imports: [
    CmpLibModule,
    CommonModule,
    DialogModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    formatoFechaPartesPipe,
    PaginatorComponent,
    CapitalizePipe,
    DateFormatPipe,
    ButtonModule
  ],
  selector: 'app-bandeja-derivaciones-derivado-aceptados',
  templateUrl: './derivado-aceptados.component.html',
  styleUrls: ['./derivado-aceptados.component.scss'],
  providers: [MessageService, DatePipe, DialogService],
})
export default class DerivadoAceptadosComponent implements OnInit, OnDestroy {
  constructor(
    private exportarService: ExportarService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private dialogService: DialogService,
    private enviadosAceptadosService: EnviadosDerivadoAService,
    private enviadosService: DerivacionesEnviadosService,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe
  ) { }

  private filtroSubscription: Subscription | null = null;  // Referencia a la suscripción
  private textoSubscription: Subscription | null = null;
  private subscriptions: Subscription[] = [];
  protected documentosFiltrados: any = [];
  protected documentosFiltradosTemp: any = [];

  //paginación
  protected query: any = { limit: 3, page: 1, where: {} };
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

  async ngOnInit() {
    this.busquedaConTexto();
    this.busquedaConFiltro();
  }

  ngOnDestroy() {
    // Cancelar la suscripción cuando el componente se destruya
    if (this.textoSubscription) {
      this.textoSubscription.unsubscribe();
    }
    if (this.filtroSubscription) {
      this.filtroSubscription.unsubscribe();
    }
  }

  public busquedaConTexto() {
    if (this.textoSubscription) {
      this.textoSubscription.unsubscribe();
    }

    this.textoSubscription = this.enviadosService.textoBuscado$.subscribe(texto => {
      this.filtrarTexto(texto);
    });
  }

  public filtrarTexto(textoBusqueda: string): void {
    this.documentosFiltradosTemp = this.documentosFiltrados.filter((item: any) => {
      return Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(textoBusqueda?.toLowerCase())
      )
    });

    this.itemPaginado.data.data = this.documentosFiltradosTemp
    this.itemPaginado.data.total = this.documentosFiltradosTemp.length;
    this.updatePagedItems(this.documentosFiltradosTemp, true);
  }

  async busquedaConFiltro() {
    // Nos suscribimos a los cambios de filtro, pero antes nos aseguramos de cancelar la suscripción anterior
    if (this.filtroSubscription) {
      this.filtroSubscription.unsubscribe();
    }

    this.filtroSubscription = this.enviadosService.filtroRequest$.subscribe(async (request) => {
      request.buscarTexto = this.enviadosService.obtenerTextoBuscado();
      
      this.documentosFiltrados = await this.obtenerEnviadosAceptados(
        '0',
        request.tipoFecha,
        request.fechaDesde,
        request.fechaHasta
      );
      this.documentosFiltradosTemp = this.documentosFiltrados;
      this.itemPaginado.data.data = this.documentosFiltradosTemp;
      this.itemPaginado.data.total = this.documentosFiltradosTemp.length;
      this.updatePagedItems(this.documentosFiltradosTemp, false);
      const buscado = request.buscarTexto;
      if (buscado) {
        this.filtrarTexto(buscado);
      }
    });
  }

  obtenerEnviadosAceptados(
    buscar: any,
    tipoFecha: any,
    desde: any,
    hasta: any
  ) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.enviadosAceptadosService
          .obtenerAceptados(buscar, tipoFecha, desde, hasta)
          .subscribe({
            next: (resp) => {
              resolve(resp.data);
            },
          })
      );
    });
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
    this.documentosFiltradosTemp = data.slice(start, end);
  }

  editarRegistro(documento: any) {
    const ref = this.dialogService.open(ActualizarDestinoModalComponent, {
      width: '60%',
      contentStyle: { 'overflow-y': 'auto', 'padding': '1.5vw' },
      baseZIndex: 10000,
      showHeader: false,
      data: {
        data: documento,
      },
    })

    ref.onClose.subscribe({
      next: () => this.busquedaConFiltro(),
      error: error => console.error(error)
    });
    
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
 
  public getCaso(nroCaso: string): any {
    if (nroCaso && nroCaso.trim().length > 0) {
      return this.sanitizer.bypassSecurityTrustHtml(obtenerCasoHtml(nroCaso));
    }
    return '';
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.documentosFiltradosTemp.length > 0) {
      const headers = [
        'N°', 
        'Número de caso', 
        'Destino',
        'Remitente de denuncia',
        'Fecha derivación',
        'F. aceptación',
      ];
      const data: any[] = [];
      this.documentosFiltradosTemp.forEach((d: any, i: number) => {
        const fechaDenuncia = d.fechaDenuncia ? this.getFormat(`${d.fechaDenuncia} ${d.horaDenuncia}`) : '-';
        const row = {
          'N°': (i + 1),
          'Número de caso': `${d.numeroCaso ? d.numeroCaso : ''} ${d.tipoDerivacion == '1' ? '\nDerivación directa' : '\nDerivación manual' }`,
          'Destino': d.destino,
          'Remitente de denuncia': `${d.tipoPersona} \n ${d.remitenteDenuncia} \n ${fechaDenuncia}`,
          'Fecha derivación': d.fechaDerivacion ? this.getFormat(`${d.fechaDerivacion} ${d.horaDerivacion}`) : '-',
          'F. aceptación': d.fechaAceptacion ? this.getFormat(`${d.fechaAceptacion} ${d.horaAceptacion}`) : '-'
        }
        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos derivados aceptados', 'landscape')
        : this.exportarService.exportarAExcel(
          data,
          headers,
          'Derivado aceptados'
        );
      return;
    }
    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
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
}
