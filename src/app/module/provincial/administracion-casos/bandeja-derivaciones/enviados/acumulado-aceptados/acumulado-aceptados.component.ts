import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule, DatePipe, formatDate} from "@angular/common";
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {TableModule} from "primeng/table";
import {ToastModule} from "primeng/toast";
import {DomSanitizer} from "@angular/platform-browser";
import {NgxSpinnerService} from "ngx-spinner";
import {DialogService} from "primeng/dynamicdialog";
import {ExportarService} from "@services/shared/exportar.service";
import {MessageService} from "primeng/api";
import { 
  DerivacionesEnviadosService
} from "@services/provincial/bandeja-derivaciones/enviados/DerivacionesEnviadosService";
import {obtenerIcono} from "@utils/icon";
import {TipoArchivoType} from "@core/types/exportar.type";
import {Subscription} from "rxjs";
import {
  EnviadosDerivadoAService
} from "@services/provincial/bandeja-derivaciones/enviados/enviados-derivadoa.service";
import { BandejaDerivacionesAcumuladas } from '@interfaces/provincial/bandeja-derivacion/enviados/acumulado-aceptados/AcumuladoAceptados';
import { FiltroDerivacionesRequest } from '@interfaces/provincial/bandeja-derivacion/enviados/acumulado-aceptados/FiltrosDirivacionesRequest';
import { obtenerCasoHtml } from '@utils/utils';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { DateFormatPipe } from 'dist/ngx-cfng-core-lib';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { PaginatorComponent } from "@components/generales/paginator/paginator.component";

@Component({
  standalone: true,
  selector: 'app-acumulado-derivado-aceptados',
  templateUrl: './acumulado-aceptados.component.html',
  styleUrls: ['./acumulado-aceptados.component.scss'],
  providers: [MessageService, DialogService],
  imports: [
    CommonModule,
    CmpLibModule,
    TableModule,
    ToastModule,
    PaginatorComponent,
    CapitalizePipe,
    DateFormatPipe
  ],
})
export default class AcumuladoAceptadosComponent implements OnInit, OnDestroy {

  protected acumuladoAceptados: BandejaDerivacionesAcumuladas[] = [];
  protected acumuladoAceptadosTemp: BandejaDerivacionesAcumuladas[] = [];
  private subscriptions: Subscription[] = [];

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

  private filtroSubscription: Subscription | null = null;  // Referencia a la suscripción
  private textoSubscription: Subscription | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private exportarService: ExportarService,
    private messageService: MessageService,
    private enviadosService: DerivacionesEnviadosService,
    private serviceBackend: EnviadosDerivadoAService,
    private datePipe: DatePipe,
  ) {
  }

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
    this.acumuladoAceptadosTemp = this.acumuladoAceptados.filter((item) =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(textoBusqueda?.toLowerCase())
      )
    );

    this.itemPaginado.data.data = this.acumuladoAceptadosTemp
    this.itemPaginado.data.total = this.acumuladoAceptadosTemp.length;
    this.updatePagedItems(this.acumuladoAceptadosTemp, true);
  }

  public busquedaConFiltro() {
    // Nos suscribimos a los cambios de filtro, pero antes nos aseguramos de cancelar la suscripción anterior
    if (this.filtroSubscription) {
      this.filtroSubscription.unsubscribe();
    }

    this.filtroSubscription = this.enviadosService.filtroRequest$.subscribe(request => {
      this.obtenerDerivadosPorRevisar(request);
    });
  }

  public obtenerDerivadosPorRevisar(filtro: FiltroDerivacionesRequest): void {
      this.spinner.show();

      this.subscriptions.push(
        this.serviceBackend.obtenerDerivacionesEnviadasAcciones(filtro).subscribe({
          next: resp => {
            this.spinner.hide()
            this.acumuladoAceptados = resp.data;
            this.acumuladoAceptadosTemp = this.acumuladoAceptados;
            this.itemPaginado.data.data = this.acumuladoAceptadosTemp;
            this.itemPaginado.data.total = this.acumuladoAceptadosTemp.length;
            this.updatePagedItems(this.acumuladoAceptadosTemp, false);
            const buscado = this.enviadosService.obtenerTextoBuscado();
            if (buscado) {
              this.filtrarTexto(buscado);
            }
          },
          error: error => {
            this.spinner.hide()
            console.error(error);
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
      this.acumuladoAceptadosTemp = data.slice(start, end);
    }
  
  /**public acumuladosListFiltro(filtro: FiltroDerivacionesRequest) {
    this.spinner.show();
    this.serviceBackend.obtenerDerivacionesEnviadasAcciones(filtro)
      .subscribe({
        next: resp => {
          this.derivacionesEnviadasList = (resp.data);
          this.spinner.hide();
        },
        error: () => this.spinner.hide()
      });
  }**/

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
    if (this.acumuladoAceptadosTemp.length > 0) {
      const headers = [
        'N°', 
        'Número de caso',
        'Destino',
        'Remitente de denuncia',
        'Fecha derivación',
        'F. aceptación',
      ];
      const data: any[] = [];
      this.acumuladoAceptadosTemp.forEach((d: any, i) => {
        const fechaDenuncia = d.fechaDenuncia ? this.getFormat(`${d.fechaDenuncia} ${d.horaDenuncia}`) : '-';
        const row = {
          'N°': (i + 1),
          'Número de caso': `Caso: ${d.numeroCaso ? d.numeroCaso : ''} ${d.numCasoAcumulado ? '\nAcumulado a: ' + d.numCasoAcumulado : ''} ${d.tipoDerivacion == '1' ? '\nDerivación directa' : ''}`,
          'Destino': d.destino,
          'Remitente de denuncia': `${d.tipoPersona} \n ${d.remitente} \n ${fechaDenuncia}`,
          'Fecha derivación': d.fechaDerivacion ? this.getFormat(`${d.fechaDerivacion} ${d.horaDerivacion}`) : '-',
          'F. aceptación': d.fechaAceptacion ? this.getFormat(`${d.fechaAceptacion} ${d.horaAceptacion}`) : '-'
        }
        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos derivados acumulados aceptados', 'landscape')
        : this.exportarService.exportarAExcel(
          data,
          headers,
          'Casos derivados acumulados aceptados'
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

  /**public exportar(exportType: TipoArchivoType): void {
    if (this.derivacionesEnviadasList.length > 0) {
      const headers = ['N°', 'Número de caso', 'Destino', 'Remitente de denuncia', 'Fecha derivación', 'F.aceptación']
      const data:any[] = [];

      this.derivacionesEnviadasList.forEach((d: BandejaDerivacionesAcumuladas) => {
        const row = {
          'N°': d.orden,
          'Número de caso': d.numeroCaso,
          'Destino': d.destino,
          'Remitente de denuncia': d.remitente,
          'Fecha derivación': d.fechaDerivacion,
          'F.aceptación': d.fechaAceptacion
        }
        data.push(row)
      })

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Derivado devueltos', 'landscape')
        : this.exportarService.exportarAExcel(data, headers, 'Derivado devueltos')
      return;
    }

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`
    })
  }**/

}
