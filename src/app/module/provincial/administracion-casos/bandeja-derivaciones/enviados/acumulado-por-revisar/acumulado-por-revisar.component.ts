import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AcumuladoPorRevisar } from '@interfaces/provincial/bandeja-derivacion/enviados/acumulado-por-revisar/AcumuladoPorRevisar';
import { FiltroAcumuladoPorRevisar } from '@interfaces/provincial/bandeja-derivacion/enviados/acumulado-por-revisar/FiltroAcumuladoPorRevisar';
import { DerivacionesEnviadosService } from '@services/provincial/bandeja-derivaciones/enviados/DerivacionesEnviadosService';
import { EnviadosAcumuladosPorRevisarService } from '@services/provincial/bandeja-derivaciones/enviados/acumulado-por-revisar/EnviadosAcumuladosPorRevisarService';
import { ExportarService } from '@services/shared/exportar.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { InformacionCasoComponent } from '@components/modals/informacion-caso/informacion-caso.component';
import { ReversionModalComponent } from '@components/modals/reversion-modal/reversion-modal.component';
import { VisorEfeModalComponent } from '@components/modals/visor-efe-modal/visor-efe-modal.component';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { PaginatorComponent } from "@components/generales/paginator/paginator.component";
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { DateFormatPipe } from 'dist/ngx-cfng-core-lib';

@Component({
  standalone: true,
  selector: 'app-acumulado-derivado-por-revisar',
  templateUrl: './acumulado-por-revisar.component.html',
  styleUrls: ['./acumulado-por-revisar.component.scss'],
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
export default class AcumuladoPorRevisarComponent implements OnInit, OnDestroy {

  protected acumuladoPorRevisar: AcumuladoPorRevisar[] = [];
  protected acumuladoPorRevisarTemp: AcumuladoPorRevisar[] = [];
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
    private serviceBackend: EnviadosAcumuladosPorRevisarService,
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
    console.log('******busquedaConTexto (AcumuladoPorRevisarComponent)******')
    if (this.textoSubscription) {
      this.textoSubscription.unsubscribe();
    }

    this.textoSubscription = this.enviadosService.textoBuscado$.subscribe(texto => {
      console.log('Texto recibido por buscar = ', texto)
      this.filtrarTexto(texto);
    });
  }

  public filtrarTexto(textoBusqueda: string): void {
    console.log('acumuladoPorRevisar size = ', this.acumuladoPorRevisar.length)
    console.log('acumuladoPorRevisarTemp antes size = ', this.acumuladoPorRevisarTemp.length)

    this.acumuladoPorRevisarTemp= this.acumuladoPorRevisar.filter((item) =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(textoBusqueda?.toLowerCase())
      )
    );

    console.log('acumuladoPorRevisarTemp size = ', this.acumuladoPorRevisarTemp.length)

    this.itemPaginado.data.data = this.acumuladoPorRevisarTemp
    this.itemPaginado.data.total = this.acumuladoPorRevisarTemp.length;
    this.updatePagedItems(this.acumuladoPorRevisarTemp, true);
  }

  public busquedaConFiltro() {
    // Nos suscribimos a los cambios de filtro, pero antes nos aseguramos de cancelar la suscripción anterior
    if (this.filtroSubscription) {
      this.filtroSubscription.unsubscribe();
    }

    this.filtroSubscription = this.enviadosService.filtroRequest$.subscribe(request => {
      console.log('Desde las busquedas AcumuladoPorRevisarComponent');
      console.log('filtro recibido = ', request);

      console.log('obtenerTextoBuscado = ', this.enviadosService.obtenerTextoBuscado());
      request.buscarTexto = this.enviadosService.obtenerTextoBuscado(); 

      //this.filtro = request
      this.obtenerAcumuladosPorRevisar(request);
    });
  }

  public obtenerAcumuladosPorRevisar(filtro: FiltroAcumuladoPorRevisar): void {
    this.spinner.show(); 

    this.subscriptions.push(
      this.serviceBackend.obtenerAcumuladosPorRevisar(filtro).subscribe({
        next: resp => {
          this.spinner.hide()
          this.acumuladoPorRevisar = resp;
          this.acumuladoPorRevisarTemp = this.acumuladoPorRevisar;
          this.itemPaginado.data.data = this.acumuladoPorRevisarTemp;
          this.itemPaginado.data.total = this.acumuladoPorRevisarTemp.length;
          this.updatePagedItems(this.acumuladoPorRevisarTemp, false);
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
    this.acumuladoPorRevisarTemp = data.slice(start, end);
  }

  public revertirDerivacion(idCaso: string, numeroCaso: string, idBandejaDerivacion: string, distrito: string): void {
    const revertirCasoRef = this.dialogService.open(ReversionModalComponent, { 
      width: '70%',
      contentStyle: { 'overflow-y': 'auto', 'padding': '1.5vw' },
      baseZIndex: 10000,
      showHeader: false,
      data: {
        tipoAccion: "1",
        idBandejaDerivacion: idBandejaDerivacion,
        caso: numeroCaso,
        idCaso: idCaso,
        titulo: 'REVERTIR DERIVACIÓN',
        descripcion: 'Detalles reversión',
        distrito: distrito
      }
    })
    revertirCasoRef.onClose.subscribe({
      next: () => this.busquedaConFiltro(),
      error: error => console.error(error)
    })
  }

  abrirModalInformacionCaso(caso: any): void {
    console.log('entro abrirModalInformacionCaso')
    console.log('caso = ', caso)

    this.referenciaModal = this.dialogService.open(InformacionCasoComponent, {
      width: '1267px',
      height: '100vh', 
      showHeader: false,
      contentStyle: { padding: '20', 'border-radius': '15px', 'background-color': '#f5f2e0' },
      data: { numeroCaso: caso.caso, idCaso: caso.idCaso, bandeja: '' /**'RECIBIDOS_ACUMULADO_PORREVISAR'**/, soloLectura: true ,idBandejaDerivacion:caso.idBandejaDerivacion },
    })

    this.referenciaModal.onClose.subscribe({
      next: () => this.busquedaConFiltro(),
      error: error => console.error(error)
    });
  } 

  protected mostrarVisorDocumental(idCaso: string, numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '90%',
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
    if (this.acumuladoPorRevisarTemp.length > 0) {
      const headers = ['N°', 'Número de caso', 'Destino', 'Remitente de denuncia', 'Fecha derivación']
      const data: any[] = [];
      this.acumuladoPorRevisarTemp.forEach((d: AcumuladoPorRevisar, i) => {
        const fechaDenuncia = d.fechaDenuncia ? this.getFormat(`${d.fechaDenuncia} ${d.horaDenuncia}`) : '-';
        const row = {
          'N°': (i + 1),
          'Número de caso': `Caso: ${d.caso ? d.caso : ''} ${d.casoAcumulado ? '\nAcumulado a: ' + d.casoAcumulado : ''} ${d.tipoDerivacion == '1' ? '\nDerivación directa' : ''}`,
          'Destino': d.destinodep,
          'Remitente de denuncia': `${d.tipoRemitente} \n ${d.remitentedenuncia} \n ${fechaDenuncia}`,
          'Fecha derivación': d.fechaderivacion ? this.getFormat(`${d.fechaderivacion} ${d.horaDerivacion}`) : '-'
        }
        data.push(row)
      })

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos derivados acumulados por revisar', 'landscape')
        : this.exportarService.exportarAExcel(data, headers, 'Casos derivados acumulados por revisar')
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
