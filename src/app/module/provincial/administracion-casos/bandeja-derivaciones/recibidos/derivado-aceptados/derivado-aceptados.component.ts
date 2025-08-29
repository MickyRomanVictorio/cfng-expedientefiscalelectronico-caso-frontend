import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { obtenerIcono } from '@utils/icon';
import { ExportarService } from '@services/shared/exportar.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from 'primeng/dynamicdialog';
import { TipoArchivoType } from '@core/types/exportar.type';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { NumeroCasoComponent } from '@modules/provincial/administracion-casos/bandeja-derivaciones/recibidos/numero-caso/numero-caso.component';
import { ButtonModule } from 'primeng/button';
import { EnviadosFiltroRequest } from '@services/provincial/bandeja-derivaciones/enviados/EnviadosFiltroRequest';
import { ApiRecibidosAceptadosService } from '@services/provincial/bandeja-derivaciones/recibidos/recibidos-aceptados';
import { AcumuladoDevuelto } from '@interfaces/provincial/bandeja-derivacion/recibidos/acumulado-devueltos/AcumuladoDevuelto';
import { RecibidosFiltroRequest } from '@interfaces/provincial/bandeja-derivacion/recibidos/RecibidosFiltroRequest';
import { obtenerCasoHtml, obtenerRutaParaEtapa } from '@utils/utils';
import { DerivacionesRecibidosService } from '@services/provincial/bandeja-derivaciones/recibidos/derivaciones-recibidos.service';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { DateFormatPipe } from 'dist/ngx-cfng-core-lib';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { Router } from '@angular/router';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';

@Component({
  selector: 'app-derivado-aceptados',
  templateUrl: './derivado-aceptados.component.html',
  styleUrls: ['./derivado-aceptados.component.scss'],
  standalone: true,
  providers: [MessageService, DialogService],
  imports: [
    CommonModule,
    CmpLibModule,
    TableModule,
    ToastModule,
    NumeroCasoComponent,
    ButtonModule,
    PaginatorComponent,
    CapitalizePipe,
    DateFormatPipe
  ],
})
export default class DerivadoAceptadosComponent implements OnInit, OnDestroy {
  protected enviadosAceptados: AcumuladoDevuelto[] = [];
  protected enviadosAceptadosTemp: AcumuladoDevuelto[] = [];
  protected filtro!: EnviadosFiltroRequest;
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
    private dataService: DerivacionesRecibidosService,
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private exportarService: ExportarService,
    private messageService: MessageService,
    private recibidosService: DerivacionesRecibidosService,
    private apiRecibidosAceptadosServic: ApiRecibidosAceptadosService,
    private datePipe: DatePipe,
    private router: Router,
    @Inject(Casos) private consultaCasos: Casos
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
      this.enviadosAceptadosTemp = this.enviadosAceptados.filter(item =>
        Object.values(item).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
            fieldValue
              ?.toString()
              ?.toLowerCase()
              .includes(texto?.toLowerCase())
        )
      );

      this.itemPaginado.data.data = this.enviadosAceptadosTemp;
      this.itemPaginado.data.total = this.enviadosAceptadosTemp.length;
      this.updatePagedItems(this.enviadosAceptadosTemp, true);
    });
  }

  public busquedaConFiltro() {
    this.obsBusc = this.dataService.filtroRequest$.subscribe(
      this.obtenerEnviadoDevueltos.bind(this)
    );

    /**this.enviadosService.filtroRequest$.subscribe((request) => {
      console.log(request);
      this.filtro = request;
      this.obtenerEnviadoDevueltos(request);
    });**/
  }

  public obtenerEnviadoDevueltos(filtro: any): void {
    const request = {
      textBusqueda: filtro.busqueda,
      tipoFecha: filtro.tipoFecha,
      fechaDesde: this.formatearFecha(filtro.fechaDesde),
      fechaHasta: this.formatearFecha(filtro.fechaHasta),
    };
    this.spinner.show();
    let expresion = /\//gi;
    this.subscriptions.push(
      this.apiRecibidosAceptadosServic
        .obtenerAceptados(
          0,
          request.tipoFecha,
          request.fechaDesde.replace(expresion, '-'),
          request.fechaHasta.replace(expresion, '-')
        )
        .subscribe({
          next: (resp) => {
            this.spinner.hide();
            this.enviadosAceptados = resp.data;
            this.enviadosAceptadosTemp = this.enviadosAceptados;
            this.itemPaginado.data.data = this.enviadosAceptadosTemp;
            this.itemPaginado.data.total = this.enviadosAceptadosTemp.length;
            this.updatePagedItems(this.enviadosAceptadosTemp, false);
            const buscado = request.textBusqueda;
            if (buscado) { 
              this.busquedaConTexto();
            }
          },
          error: (error) => {
            this.spinner.hide();
            console.error(error);
          },
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
    this.enviadosAceptadosTemp = data.slice(start, end);
  }

  public abrirDetalleCaso(infoDerivacion: any): void {
    let casoEtapa = '01';
    this.consultaCasos.getConsultarCasos(infoDerivacion.idCaso)
      .subscribe((data) => {
        console.log(data);
      });
    setTimeout(() => {
      let ruta;
      if (infoDerivacion.flgDerivado == '1' && infoDerivacion.flgAsignado == '1' && infoDerivacion.flgRecepcion == '1') {
        ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(casoEtapa)}/caso/${infoDerivacion.idCaso}`;
      }
      if (infoDerivacion.flgDerivado == '1' && infoDerivacion.flgAsignado == '0' && infoDerivacion.flgRecepcion == '0') {
        ruta = `/app/administracion-casos/asignacion/listar-casos-por-asignar`
      }
      if (infoDerivacion.flgDerivado == '1' && infoDerivacion.flgAsignado == '1' && infoDerivacion.flgRecepcion == '0') {
        ruta = `app/administracion-casos/recepcion`
      }
      this.router.navigate([`${ruta}`])
        .then((success) => {
          if (success) {
            setTimeout(() => window.location.reload(), 100);
          } else {
            console.error('Falló la navegación');
          }
        });
    }, 1000);
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.enviadosAceptados.length > 0) {
      const headers = [
        'N°',
        'Número de caso',
        'Remitente',
        'Origen',
        'F. derivación',
        'F. aceptación',
      ];
      const data: any[] = [];

      this.enviadosAceptados.forEach((d: AcumuladoDevuelto, i) => {
        const row = {
          'N°': (i + 1),
          'Número de caso': `${d.numeroCaso ? d.numeroCaso : ''} ${d.tipoDerivacion == '1' ? '\nDerivación directa' : '' }`,
          'Remitente': `${d.remitenteDenuncia ? 'Fiscal: ' + d.remitenteDenuncia : ''}`,
          'Origen': d.destino,
          'F. derivación': d.fechaDerivacion ? this.getFormat(`${d.fechaDerivacion} ${d.horaDerivacion}`) : '-',
          'F. aceptación': d.fechaAceptacion ? this.getFormat(`${d.fechaAceptacion} ${d.horaAceptacion}`) : '-'
        };
        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(
          data,
          headers,
          'Casos recibidos aceptados',
          'landscape'
        )
        : this.exportarService.exportarAExcel(
          data,
          headers,
          'Casos recibidos aceptados'
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

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }
}
