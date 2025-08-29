import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AcumuladoRevertido } from '@interfaces/provincial/bandeja-derivacion/enviados/acumulado-revertidos/AcumuladoRevertidos';
import { RevertidosFiltroRequest } from '@interfaces/provincial/bandeja-derivacion/enviados/acumulado-revertidos/RevertidosFiltroRequest';
import { DerivacionesEnviadosService } from '@services/provincial/bandeja-derivaciones/enviados/DerivacionesEnviadosService';
import { EnviadosAcumuladosRevertidosService } from '@services/provincial/bandeja-derivaciones/enviados/enviados-acumulados-revertidos.service';
import { ExportarService } from '@services/shared/exportar.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { VerDetalleReversionComponent } from '@components/modals/ver-detalle-reversion/ver-detalle-reversion.component';
import { DateFormatPipe } from '@pipes/format-date.pipe';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml, obtenerRutaParaEtapa, urlConsultaCasoFiscal } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DialogModule } from "primeng/dialog";
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { PaginatorComponent } from "@components/generales/paginator/paginator.component";
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';

@Component({
  standalone: true,
  selector: 'app-acumulado-revertidos',
  templateUrl: './acumulado-revertidos.component.html',
  styleUrls: ['./acumulado-revertidos.component.scss'],
  providers: [MessageService, DialogService, DatePipe],
  imports: [
    CommonModule,
    CmpLibModule,
    TableModule,
    ToastModule,
    DateFormatPipe,
    DynamicDialogModule,
    DialogModule,
    PaginatorComponent,
    ButtonModule,
    CapitalizePipe
  ],
})
export default class AcumuladoRevertidosComponent implements OnInit {

  protected acumuladosRevertidos: AcumuladoRevertido[] = [];
  protected acumuladosRevertidosTemp: AcumuladoRevertido[] = [];
  private referenciaModal!: DynamicDialogRef;
  /**private filtro!: EnviadosFiltroRequest;**/
  private subscriptions: Subscription[] = [];

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
    private enviadosAcumuladosRevertidosService: EnviadosAcumuladosRevertidosService,
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

    this.textoSubscription = this.enviadosService.textoBuscado$.subscribe(texto => {
      this.filtrarTexto(texto);
    });
  }

  public filtrarTexto(textoBusqueda: string): void {
    this.acumuladosRevertidosTemp = this.acumuladosRevertidos.filter((item) =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(textoBusqueda?.toLowerCase())
      )
    );

    this.itemPaginado.data.data = this.acumuladosRevertidosTemp
    this.itemPaginado.data.total = this.acumuladosRevertidosTemp.length;
    this.updatePagedItems(this.acumuladosRevertidosTemp, true);
  }

  public busquedaConFiltro() {
    // Nos suscribimos a los cambios de filtro, pero antes nos aseguramos de cancelar la suscripción anterior
    if (this.filtroSubscription) {
      this.filtroSubscription.unsubscribe();
    }

    this.filtroSubscription = this.enviadosService.filtroRequest$.subscribe(request => {
      request.buscarTexto = this.enviadosService.obtenerTextoBuscado();

      this.obtenerAcumuladosRevertidos(request);
    });
  }

  public obtenerAcumuladosRevertidos(filtro: RevertidosFiltroRequest): void {
    this.spinner.show();
    this.subscriptions.push(

      this.enviadosAcumuladosRevertidosService.obtenerDerivadosAcumuladosRevertidos(filtro).subscribe({
        next: resp => {
          this.spinner.hide()
          this.acumuladosRevertidos = resp;
          this.acumuladosRevertidosTemp = this.acumuladosRevertidos;
          this.itemPaginado.data.data = this.acumuladosRevertidosTemp
          this.itemPaginado.data.total = this.acumuladosRevertidosTemp.length;
          this.updatePagedItems(this.acumuladosRevertidosTemp, false);
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
    this.acumuladosRevertidosTemp = data.slice(start, end);
  }

  public verReversion(registroSelect: AcumuladoRevertido): void {
    this.referenciaModal = this.dialogService.open(VerDetalleReversionComponent, {
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

  public abrirDetalleCaso(infoDerivacion: any): void {
    let casoEtapa = '01';
    this.consultaCasos.getConsultarCasos(infoDerivacion.idCaso)
      .subscribe((data) => {
        console.log(data);
      });
    setTimeout(() => {
      const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(casoEtapa)}/caso/${infoDerivacion.idCaso}`;
      this.router.navigate([`${ruta}`]);
    }, 1000);
  }

  public verCaso(registroSelect: AcumuladoRevertido) {
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
    if (this.acumuladosRevertidosTemp.length > 0) {
      const headers = ['N°', 'Número de caso', 'Destino', 'Remitente de denuncia', 'Fecha derivación', 'F. reversión']
      const data: any[] = [];

      this.acumuladosRevertidosTemp.forEach((d: any, i) => {
        const fechaDenuncia = d.fechaDenuncia ? this.getFormat(`${d.fechaDenuncia} ${d.horaDenuncia}`) : '-';
        const row = {
          'N°': (i + 1),
          'Número de caso': `Caso: ${d.coCaso ? d.coCaso : ''} ${d.casoAcumulado ? '\nAcumulado a: ' + d.casoAcumulado : ''} ${d.tipoDerivacion == '1' ? '\nDerivación directa' : ''}`,
          'Destino': d.destino,
          'Remitente de denuncia': `${d.tipoSujeto} \n ${d.remitenteDenuncia} \n ${fechaDenuncia}`,
          'Fecha derivación': d.fechaDerivacion ? this.getFormat(`${d.fechaDerivacion} ${d.horaDerivacion}`) : '-',
          'F. reversión': d.fechaReversion ? this.getFormat(`${d.fechaReversion} ${d.horaReversion}`) : '-'
        }
        data.push(row)
      })

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos derivados acumulados revertidos', 'landscape')
        : this.exportarService.exportarAExcel(data, headers, 'Casos derivados acumulados revertidos')
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
