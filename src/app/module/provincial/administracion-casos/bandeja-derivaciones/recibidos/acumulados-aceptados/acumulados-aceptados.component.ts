import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { TabRecibidosComponent } from '@modules/provincial/administracion-casos/bandeja-derivaciones/recibidos/tab-recibidos/tab-recibidos.component';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { DateFormatPipe } from '@pipes/format-date.pipe';
import { EnviadosDerivadoAService } from '@services/provincial/bandeja-derivaciones/enviados/enviados-derivadoa.service';
import {
  CasosRecibidos,
  TipoPlazo,
} from '@services/provincial/bandeja-derivaciones/recibidos/casos-recibidos';
import { DerivacionesRecibidosService } from '@services/provincial/bandeja-derivaciones/recibidos/derivaciones-recibidos.service';
import { ExportarService } from '@services/shared/exportar.service';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml, obtenerRutaParaEtapa, urlConsultaCasoFiscal } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription, debounceTime } from 'rxjs';
import { BandejaDerivacionesAcumuladas } from '@interfaces/provincial/bandeja-derivacion/enviados/acumulado-aceptados/AcumuladoAceptados';
import { FiltroDerivacionesRequest } from '@interfaces/provincial/bandeja-derivacion/enviados/acumulado-aceptados/FiltrosDirivacionesRequest';
import { DerivacionesEnviadosService } from '@services/provincial/bandeja-derivaciones/enviados/DerivacionesEnviadosService';
import { ButtonModule } from 'primeng/button';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';

@Component({
  standalone: true,
  selector: 'app-acumulados-aceptados',
  imports: [
    CommonModule,
    CmpLibModule,
    TableModule,
    ToastModule,
    CapitalizePipe,
    DateFormatPipe,
    TabRecibidosComponent,
    ButtonModule,
    PaginatorComponent,
  ],
  templateUrl: './acumulados-aceptados.component.html',
  styleUrls: ['./acumulados-aceptados.component.scss'],
  providers: [MessageService, DialogService],
})
export default class AcumuladosAceptadosComponent implements OnInit, OnDestroy {
  protected readonly obtenerIcono = obtenerIcono;
  private lisSelectedPlazo: Array<TipoPlazo> = [];
  protected derivacionesEnviadasList: BandejaDerivacionesAcumuladas[] = [];
  protected derivacionesEnviadasListTemp: BandejaDerivacionesAcumuladas[] = [];
  private obsText!: Subscription;
  private obsBusc!: Subscription;
  private text = '';

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
    private exportarService: ExportarService,
    private messageService: MessageService,
    private enviadosDerivadoAService: EnviadosDerivadoAService,
    private recibidosService: DerivacionesRecibidosService,
    private datePipe: DatePipe,
    private router: Router,
    @Inject(Casos) private consultaCasos: Casos
  ) // private storageService: StorageService TODO
  { }

  ngOnInit() {
    this.busquedaConTexto();
    this.busquedaConFiltro();
    /***if (this.obsBusc) {
      this.obsBusc.unsubscribe();
    }

    this.obsBusc = this.dataService.filtroRequest$.subscribe(
      this.buscar.bind(this)
    );

    if (this.obsText) {
      this.obsText.unsubscribe();
    }

    this.obsText = this.dataService.textoBuscado$
      .pipe(debounceTime(300))
      .subscribe((text) => (this.text = text));**/
  }

  ngOnDestroy() {
    if (this.obsText) {
      this.obsText.unsubscribe();
    }
    if (this.obsBusc) {
      this.obsBusc.unsubscribe();
    }
  }

  /**searchText(e: CasosRecibidos) {
    if (!Boolean(this.text)) return true;
    return Object.values(e).some((v) => {
      if (typeof v === 'string' || typeof v === 'number')
        return v.toString().toLowerCase().includes(this.text.toLowerCase());
      return false;
    });
  }**/

  public busquedaConTexto() {
    if (this.obsText) {
      this.obsText.unsubscribe();
    }

    this.obsText = this.recibidosService.textoBuscado$.subscribe(texto => {
      this.derivacionesEnviadasListTemp = this.derivacionesEnviadasList.filter(item =>
        Object.values(item).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
            fieldValue
              ?.toString()
              ?.toLowerCase()
              .includes(texto?.toLowerCase())
        )
      );

      this.itemPaginado.data.data = this.derivacionesEnviadasListTemp;
      this.itemPaginado.data.total = this.derivacionesEnviadasListTemp.length;
      this.updatePagedItems(this.derivacionesEnviadasListTemp, true);
    });
  }

  public busquedaConFiltro() {
    if (this.obsBusc) {
      this.obsBusc.unsubscribe();
    }

    this.obsBusc = this.recibidosService.filtroRequest$.subscribe(request => {
      this.buscar(request);
    });
  }

  buscar(request: any) {
    this.spinner.show();
    let req: FiltroDerivacionesRequest = {
      textBusqueda: request.busqueda,
      tipoFecha: request.tipoFecha,
      fechaDesde: this.formatearFecha(request.fechaDesde),
      fechaHasta: this.formatearFecha(request.fechaHasta),
      accion: 125,
    };
    this.enviadosDerivadoAService.obtenerDerivacionesRecibidosAcumuladoAceptadas(req)
      .subscribe({
        next: (resp) => {
          this.spinner.hide();
          this.derivacionesEnviadasList = resp.data;
          this.derivacionesEnviadasListTemp = this.derivacionesEnviadasList;
          this.itemPaginado.data.data = this.derivacionesEnviadasListTemp;
          this.itemPaginado.data.total = this.derivacionesEnviadasListTemp.length;
          this.updatePagedItems(this.derivacionesEnviadasListTemp, false);
          const buscado = req.textBusqueda;
          if (buscado) { 
            this.busquedaConTexto();
          }
        },
        error: (err) => {
          console.log(err);
          this.spinner.hide();
        },
      });
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.updatePagedItems(paginacion.data, paginacion.resetPage)
  }

  updatePagedItems(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.derivacionesEnviadasListTemp = data.slice(start, end);
  }

  indexPag(index: number) {
    const data = (this.query.page - 1) * this.query.limit;
    return index + data + 1;
  }

  public getCaso(nroCaso: string): any {
    if (nroCaso && nroCaso.trim().length > 0) {
      return this.sanitizer.bypassSecurityTrustHtml(obtenerCasoHtml(nroCaso));
    }
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.derivacionesEnviadasList.length > 0) {
      const headers = [
        'N°',
        'Número de caso',
        'Remitente',
        'Origen',
        'F. derivación',
        'F. aceptación',
      ];
      const data: any[] = [];

      this.derivacionesEnviadasList.forEach(
        (d: BandejaDerivacionesAcumuladas, i) => {
          const row = {
            'N°': (i + 1),
            'Número de caso': `Caso: ${d.numeroCaso ? d.numeroCaso : ''} ${d.numCasoAcumulado ? '\nAcumulado a: ' + d.numCasoAcumulado : ''}`,
            'Remitente': `${d.remitente ? 'Fiscal: ' + d.remitente : ''}`,
            'Origen': d.destino,
            'F. derivación': d.fechaDerivacion ? this.getFormat(`${d.fechaDerivacion} ${d.horaDerivacion}`) : '-',
            'F. aceptación': d.fechaAceptacion ? this.getFormat(`${d.fechaAceptacion} ${d.horaAceptacion}`) : '-'
          };
          data.push(row);
        }
      );

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(
          data,
          headers,
          'Casos recibidos acumulados aceptados',
          'landscape'
        )
        : this.exportarService.exportarAExcel(
          data,
          headers,
          'Casos recibidos acumulados aceptados'
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

  public irDetalleCaso() {
    console.log('registroSelect ->');
  }

  public abrirDetalleCaso(infoDerivacion: BandejaDerivacionesAcumuladas): void {
    let casoEtapa = '01';
    /**infoDerivacion.idCaso = "0FB980EF5CC2CB4CE0650250569D508A";
    infoDerivacion.nomEtapa = "CALIFICACION";**/
    this.consultaCasos.getConsultarCasos(infoDerivacion.idCaso!)
      .subscribe((data) => {
        console.log(data);
        /**
          this.storageService.clearItem(LOCALSTORAGE.CASO_KEY);
          this.storageService.createItem(LOCALSTORAGE.CASO_KEY, infoDerivacion.idCaso);

          this.storageService.clearItem(LOCALSTORAGE.ETAPA_KEY);
          this.storageService.createItem(LOCALSTORAGE.ETAPA_KEY, infoDerivacion.nomEtapa);

          this.storageService.clearItem(LOCALSTORAGE.CASO_OBJETO_KEY);
          this.storageService.createItem(LOCALSTORAGE.CASO_OBJETO_KEY, JSON.stringify(data));

          this.storageService.clearItem(LOCALSTORAGE.TAB_DETALLE_SELECCIONADO_KEY);
          this.storageService.createItem(LOCALSTORAGE.TAB_DETALLE_SELECCIONADO_KEY, "0");
      **/
      });
    setTimeout(() => {
      const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(casoEtapa)}/caso/${infoDerivacion.idCaso}`;
      this.router.navigate([`${ruta}`]);
    }, 1000);
  }

  //ver el caso
  public verCaso(registroSelect: BandejaDerivacionesAcumuladas) {
    this.eventoIrATramite(registroSelect);
  }

  //enviar al tramite
  protected eventoIrATramite(item: any): void {
    const urlEtapa = urlConsultaCasoFiscal({
      idEtapa: item.idEtapaInicial,
      idCaso: item.idCaso,
      flgConcluido: item.flConcluido,
    });
    const ruta = urlEtapa + `/acto-procesal/${item.idActoTramiteCaso}`;
    this.router.navigate([`${ruta}`]);
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
