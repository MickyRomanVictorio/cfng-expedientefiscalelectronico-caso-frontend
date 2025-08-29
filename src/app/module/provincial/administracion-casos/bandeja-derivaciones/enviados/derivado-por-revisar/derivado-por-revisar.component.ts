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
import { DerivacionesEnviadosService } from '@services/provincial/bandeja-derivaciones/enviados/DerivacionesEnviadosService';
import { EnviadosFiltroRequest } from '@services/provincial/bandeja-derivaciones/enviados/EnviadosFiltroRequest';
import { Subscription } from 'rxjs';
import { EnviadosDerivadoPorRevisarService } from '@services/provincial/bandeja-derivaciones/enviados/derivado-por-revisar/EnviadosDerivadosPorRevisarService';
import { ButtonModule } from "primeng/button";
import { ReversionModalComponent } from "@components/modals/reversion-modal/reversion-modal.component";
import { InformacionCasoComponent } from '@components/modals/informacion-caso/informacion-caso.component';
import { VisorEfeModalComponent } from '@components/modals/visor-efe-modal/visor-efe-modal.component';
import { DerivadoPorRevisar } from '@interfaces/provincial/bandeja-derivacion/enviados/derivado-por-revisar/DerivadoPorRevisar';
import { obtenerCasoHtml } from '@utils/utils';
import { PaginatorComponent } from "@components/generales/paginator/paginator.component";
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { DateFormatPipe } from 'dist/ngx-cfng-core-lib';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';

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
    ButtonModule,
    PaginatorComponent,
    CapitalizePipe,
    DateFormatPipe
  ],
})
export default class DerivadoPorRevisarComponent implements OnInit, OnDestroy {

  protected derivadoPorRevisar: DerivadoPorRevisar[] = [];
  protected derivadoPorRevisarTemp: DerivadoPorRevisar[] = [];
  private subscriptions: Subscription[] = [];
  private referenciaModal!: DynamicDialogRef;

  //paginación
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

  private filtroSubscription: Subscription | null = null;  // Referencia a la suscripción
  private textoSubscription: Subscription | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private dialogService: DialogService,
    private exportarService: ExportarService,
    private messageService: MessageService,
    private enviadosService: DerivacionesEnviadosService,
    private serviceBackend: EnviadosDerivadoPorRevisarService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
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
    this.derivadoPorRevisarTemp = this.derivadoPorRevisar.filter((item) =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(textoBusqueda?.toLowerCase())
      )
    );

    this.itemPaginado.data.data = this.derivadoPorRevisarTemp
    this.itemPaginado.data.total = this.derivadoPorRevisarTemp.length;
    this.updatePagedItems(this.derivadoPorRevisarTemp, true);
  }

  public busquedaConFiltro() {
    // Nos suscribimos a los cambios de filtro, pero antes nos aseguramos de cancelar la suscripción anterior
    if (this.filtroSubscription) {
      this.filtroSubscription.unsubscribe();
    }

    this.filtroSubscription = this.enviadosService.filtroRequest$.subscribe(request => {
      request.buscarTexto = this.enviadosService.obtenerTextoBuscado();

      this.obtenerDerivadosPorRevisar(request);
    });
  }

  public obtenerDerivadosPorRevisar(filtro: EnviadosFiltroRequest): void {
    this.spinner.show();

    this.subscriptions.push(
      this.serviceBackend.obtenerDerivadosPorRevisar(filtro).subscribe({
        next: resp => {
          this.spinner.hide()
          this.derivadoPorRevisar = resp;
          this.derivadoPorRevisarTemp = this.derivadoPorRevisar;
          this.itemPaginado.data.data = this.derivadoPorRevisarTemp;
          this.itemPaginado.data.total = this.derivadoPorRevisarTemp.length;
          this.updatePagedItems(this.derivadoPorRevisarTemp, false);
          const buscado = filtro.buscarTexto;
          if (buscado) { 
            this.filtrarTexto(buscado);
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
    this.derivadoPorRevisarTemp = data.slice(start, end);
  }

  public revertirDerivacion(idCaso: string, numeroCaso: string, idBandejaDerivacion: string, distrito: string): void {
    this.referenciaModal = this.dialogService.open(ReversionModalComponent, { 
      width: '70%',
      contentStyle: { 'overflow-y': 'auto', 'padding': '1.5vw' },
      baseZIndex: 10000,
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
    this.referenciaModal.onClose.subscribe({
      next: () => this.busquedaConFiltro(),
      error: error => console.error(error)
    })
  }

  abrirModalInformacionCaso(caso: any): void {
    /**this.gestionCasoService.obtenerCasoFiscalV2(caso.idCaso);**/

    this.referenciaModal = this.dialogService.open(InformacionCasoComponent, {
      width: '1300px',
      height: '100vh',
      showHeader: false,
      contentStyle: { padding: '20', 'border-radius': '15px', 'background-color': '#f5f2e0' },
      data: { numeroCaso: caso.coCaso, idCaso: caso.idCaso, bandeja: '' /**'RECIBIDOS_DERIVADO_PORREVISAR'**/ , soloLectura: true },
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

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  } 

  public getCaso(nroCaso: string): any {
    if (nroCaso && nroCaso.trim().length > 0) {
      return this.sanitizer.bypassSecurityTrustHtml(obtenerCasoHtml(nroCaso));
    }
    return '';
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.derivadoPorRevisarTemp.length > 0) {
      const headers = ['N°', 'Número de caso', 'Destino', 'Remitente de denuncia', 'Fecha derivación']
      const data: any[] = [];
      this.derivadoPorRevisarTemp.forEach((d: DerivadoPorRevisar, i) => {
        const fechaDenuncia = d.fechaDenuncia ? this.getFormat(`${d.fechaDenuncia} ${d.horaDenuncia}`) : '-';
        const row = {
          'N°': (i + 1),
          'Número de caso': `${d.coCaso ? d.coCaso : ''} ${d.tipoDerivacion == '1' ? '\nDerivación directa' : ''}`,
          'Destino': d.destino,
          'Remitente de denuncia': `${d.tipoRemitente} \n ${d.remitenteDenuncia} \n ${fechaDenuncia}`,
          'Fecha derivación': d.fechaDerivacion ? this.getFormat(`${d.fechaDerivacion} ${d.horaDerivacion}`) : '-'
        }
        data.push(row);
      })

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos derivados aceptados por revisar', 'landscape')
        : this.exportarService.exportarAExcel(data, headers, 'DerCasos derivados aceptados por revisar')
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

}
