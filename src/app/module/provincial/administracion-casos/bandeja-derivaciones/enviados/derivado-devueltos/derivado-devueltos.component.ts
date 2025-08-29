import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
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
import { DerivacionesEnviadosService } from '@services/provincial/bandeja-derivaciones/enviados/DerivacionesEnviadosService';
import { EnviadosFiltroRequest } from '@services/provincial/bandeja-derivaciones/enviados/EnviadosFiltroRequest';
import { Subscription } from 'rxjs';
import { EnviadosDerivadoAService } from '@services/provincial/bandeja-derivaciones/enviados/enviados-derivadoa.service';
import { DateFormatPipe } from '@pipes/format-date.pipe';
import { DateMaskModule } from '@directives/date-mask.module';
import { DetalleDevolucionModalComponent } from '@components/modals/detalle-devolucion-modal/detalle-devolucion-modal.component';
import { DerivadoDevuelto } from '@interfaces/provincial/bandeja-derivacion/enviados/derivado-devueltos/DerivadoDevuelto';
import { obtenerCasoHtml, obtenerRutaParaEtapa, urlConsultaCasoFiscal } from '@utils/utils';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';

@Component({
  standalone: true,
  imports: [CommonModule,
    CmpLibModule,
    TableModule,
    ToastModule,
    DateFormatPipe,
    DateMaskModule,
    CapitalizePipe,
    PaginatorComponent,
    ButtonModule],
  selector: 'app-derivado-devueltos',
  templateUrl: './derivado-devueltos.component.html',
  styleUrls: ['./derivado-devueltos.component.scss'],
  providers: [MessageService, DialogService, DatePipe],
})
export default class DerivadoDevueltosComponent implements OnInit, OnDestroy {
  private derivadoDevueltos: DerivadoDevuelto[] = [];
  protected derivadoDevueltosFiltrados: DerivadoDevuelto[] = [];
  /**private filtro!: EnviadosFiltroRequest;**/
  private subscriptions: Subscription[] = [];

  //paginación
  protected resetPage: boolean = false;
  protected query: any = { limit: 3, page: 1, where: {} }
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
    private serviceBackend: EnviadosDerivadoAService,
    private datePipe: DatePipe,
    private router: Router,
    @Inject(Casos) private consultaCasos: Casos
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

    /**this.subscriptions.push(
      this.enviadosService.textoBuscado$.pipe(
        debounceTime(300),
        distinctUntilChanged()).subscribe(texto => {
          this.filtrarTexto(texto);
        })
    );**/

    this.textoSubscription = this.enviadosService.textoBuscado$.subscribe(texto => {
      this.filtrarTexto(texto);
    });
  }

  public filtrarTexto(textoBusqueda: string): void {
    /**if (!textoBusqueda.trim()) {
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
    });**/

    this.derivadoDevueltosFiltrados = this.derivadoDevueltos.filter((item) =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(textoBusqueda?.toLowerCase())
      )
    );

    this.itemPaginado.data.data = this.derivadoDevueltosFiltrados
    this.itemPaginado.data.total = this.derivadoDevueltosFiltrados.length;
    this.updatePagedItems(this.derivadoDevueltosFiltrados, true);
  }

  public busquedaConFiltro() {
    // Nos suscribimos a los cambios de filtro, pero antes nos aseguramos de cancelar la suscripción anterior
    if (this.filtroSubscription) {
      this.filtroSubscription.unsubscribe();
    }

    this.filtroSubscription = this.enviadosService.filtroRequest$.subscribe(request => {
      request.buscarTexto = this.enviadosService.obtenerTextoBuscado();

      this.obtenerDerivadosDevueltos(request);
    });
  }

  public obtenerDerivadosDevueltos(filtro: EnviadosFiltroRequest): void {
    this.spinner.show();

    this.subscriptions.push(
      this.serviceBackend.obtenerDerivadoDevueltos(filtro).subscribe({
        next: resp => {
          this.spinner.hide()
          this.derivadoDevueltos = resp;
          //this.derivadoDevueltosFiltrados = [...this.derivadoDevueltos]
          this.derivadoDevueltosFiltrados = this.derivadoDevueltos;
          this.itemPaginado.data.data = this.derivadoDevueltosFiltrados
          this.itemPaginado.data.total = this.derivadoDevueltosFiltrados.length
          this.updatePagedItems(this.derivadoDevueltosFiltrados, false);
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
    this.derivadoDevueltosFiltrados = data.slice(start, end);
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

  public abrirDetalleCaso(infoDerivacion: DerivadoDevuelto): void {
    let casoEtapa = '01';
    this.consultaCasos.getConsultarCasos(infoDerivacion.idCaso!)
      .subscribe((data) => {
        console.log(data);
      });
    setTimeout(() => {
      const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(casoEtapa)}/caso/${infoDerivacion.idCaso}`;
      this.router.navigate([`${ruta}`]);
    }, 1000);
  }

  //ver el caso
  public verCaso(registroSelect: DerivadoDevuelto) {
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
    if (this.derivadoDevueltosFiltrados.length > 0) {
      const headers = ['N°', 'Número de caso', 'Destino', 'Remitente de denuncia', 'Fecha derivación', 'F. devolución']
      const data: any[] = [];
      this.derivadoDevueltosFiltrados.forEach((d: DerivadoDevuelto, i) => {
        const fechaDenuncia = d.fechaDenuncia ? this.getFormat(`${d.fechaDenuncia} ${d.horaDenuncia}`) : '-';
        const row = {
          'N°': (i + 1),
          'Número de caso': `${d.coCaso ? d.coCaso : ''} ${d.tipoDerivacion == '1' ? '\nDerivación directa' : ''}`,
          'Destino': d.destino,
          'Remitente de denuncia': `${d.tipoSujeto} \n ${d.remitenteDenuncia} \n ${fechaDenuncia}`,
          'Fecha derivación': d.fechaDerivacion ? this.getFormat(`${d.fechaDerivacion} ${d.horaDerivacion}`) : '-',
          'F. devolución': d.fechaDevolucion ? this.getFormat(`${d.fechaDevolucion} ${d.horaDevolucion}`) : '-'
        }
        data.push(row)
      })

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos derivados devueltos', 'landscape')
        : this.exportarService.exportarAExcel(data, headers, 'Casos derivados devueltos')
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
