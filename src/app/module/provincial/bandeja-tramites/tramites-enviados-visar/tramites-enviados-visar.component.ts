import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DetalleVisadoComponent } from '@components/modals/detalle-visado/detalle-visado.component';
import { HistorialTramiteModalComponent } from '@components/modals/historial-tramite-modal/historial-tramite-modal.component';
import { PreviewModalComponent } from '@components/modals/preview-modal/preview-modal.component';
import {
  TRAMITE_TIPO_CUADERNO,
  TRAMITE_TIPO_CUADERNO_FILTRO,
} from '@constants/menu';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { FiltroPaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { BandejaTramiteRequest } from '@core/interfaces/provincial/bandeja-tramites/BandejaTramiteRequest';
import { BandejaTramitesService } from '@core/services/provincial/bandeja-tramites/bandeja-tramites.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { BandejaTramite } from '@interfaces/provincial/bandeja-tramites/BandejaTramite';
import { FiltroTramite } from '@interfaces/provincial/bandeja-tramites/FiltroTramite';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import {
  BandejaBusqueda,
  BandejaBusquedaService,
} from '@services/provincial/bandeja-tramites/bandeja-busqueda.service';
import { ExportarService } from '@services/shared/exportar.service';
import { IconUtil, StringUtil } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService, SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-tramites-enviados-visar',
  templateUrl: './tramites-enviados-visar.component.html',
  imports: [
    ButtonModule,
    CapitalizePipe,
    CmpLibModule,
    SharedModule,
    TableModule,
    ToastModule,
    TooltipModule,
    DatePipe,
    PaginatorComponent,
    CommonModule,
  ],
  providers: [MessageService, DialogService],
})
export default class TramitesEnviadosVisarComponent
  implements OnInit, OnDestroy
{
  protected bandejaTramites: BandejaTramite[];
  protected bandejaTramitesInicial: BandejaTramite[];

  public subscriptions: Subscription[] = [];
  public tramitesSeleccionados: BandejaTramite[] = [];
  public filtrosTramite: FiltroTramite[] = [];
  protected filtrosTramiteSelec: number = TRAMITE_TIPO_CUADERNO.TRAMITE_TODOS;
  public referenciaModal!: DynamicDialogRef;
  private bandejaBusquedaS!: Subscription;
  private readonly suscripciones: Subscription[] = [];
  protected totalRegistros: number = 0;

  public query: any = { limit: 10, page: 1, where: {} };
  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  public filtro: FiltroPaginacionInterface = {
    page: 1,
    per_page: 10,
  };
  private dataBandeja!: BandejaTramiteRequest | null;
  public resetPage: boolean = false;

  constructor(
    private readonly messageService: MessageService,
    private readonly exportarService: ExportarService,
    private readonly dialogService: DialogService,
    private readonly bandejaBusquedaService: BandejaBusquedaService,
    private readonly bandejaTramitesService: BandejaTramitesService,
    protected iconUtil: IconUtil,
    protected stringUtil: StringUtil
  ) {
    this.bandejaTramites = [];
    this.bandejaTramitesInicial = [];
  }

  ngOnInit(): void {
    this.filtrosTramite = TRAMITE_TIPO_CUADERNO_FILTRO;

    this.bandejaBusquedaS = this.bandejaBusquedaService.buscar$.subscribe(
      (config: BandejaBusqueda) => {
        if (
          config.nuevaBusquedaEjecutada === true ||
          config.ejecutarNuevaBusqueda === true
        ) {
          this.filtrosTramiteSelec = config.tipoCuadernoId;
        }
      }
    );

    this.suscripciones.push(
      this.bandejaBusquedaService.filtroRequest$.subscribe((data) => {
        this.filtro = {
          page: 1,
          per_page: 10,
        };
        this.query = { limit: 10, page: 1, where: {} };
        this.dataBandeja = data;
        this.obtenerTramitesEnviadosParaVisar(data);
      })
    );

    this.suscripciones.push(
      this.bandejaBusquedaService.textoBuscado$.subscribe((texto) => {
        this.buscarTexto(texto);
      })
    );
  }

  ngOnDestroy(): void {
    if (this.bandejaBusquedaS) this.bandejaBusquedaS.unsubscribe();
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  /**
   * Obtiene y procesa la lista de "tramites" enviados para aprobación.
   *
   * Este método envía una solicitud para obtener los "tramites" utilizando la configuración actual
   * de filtrado de paginación. Al recibir la respuesta, calcula el orden de cada "tramite" en función
   * de la página actual y actualiza la lista interna de "tramites". También actualiza la lista inicial
   * y los datos de paginación.
   *
   * @param request - La carga útil de la solicitud que contiene los parámetros de filtro para obtener
   *                  los "tramites".
   */
  private obtenerTramitesEnviadosParaVisar(request: BandejaTramiteRequest) {
    request.page = this.filtro.page;
    request.perPage = this.filtro.per_page;
    this.bandejaTramites = [];
    this.subscriptions.push(
      this.bandejaTramitesService
        .obtenerTramitesEnviadosParaVisar(request)
        .subscribe({
          next: (resp) => {
            const inicio = (this.filtro.page - 1) * this.filtro.per_page;
            resp.data.registros.forEach((response: any, index: any) => {
              response.orden = inicio + index + 1;
            });

            this.bandejaTramites = resp.data.registros;
            this.bandejaTramitesInicial = resp.data.registros;
            this.totalRegistros = resp.data.totalElementos;
            this.buscarTextoSuscripcion();

            this.itemPaginado.data.data = this.bandejaTramites;
            this.itemPaginado.data.total = resp.data.totalElementos;
            this.itemPaginado.data.perPage = resp.data.perPage;
          },
          error: (e) => {
            console.error(e);
          },
        })
    );
  }

  onPaginate(evento: any) {
    this.filtro.page = evento.page;
    this.filtro.per_page = evento.limit;
    this.query.limit = evento.limit;
    this.query.page = evento.page;
    this.obtenerTramitesEnviadosParaVisar(this.dataBandeja!);
  }

  /**
   * Suscribe a una busqueda por texto.
   * Verifica si se ha configurado una nueva busqueda por texto,
   * y si es asi, llama a buscarTexto con el valor configurado.
   */
  private buscarTextoSuscripcion() {
    if (
      this.bandejaBusquedaService.configuracion.ejecutarNuevaBusquedaXTexto ===
      true
    ) {
      this.buscarTexto(
        this.bandejaBusquedaService.configuracion
          .ejecutarNuevaBusquedaXTextoValor
      );
    }
  }

  /**
   * Busca en la lista de tramites enviados para visar por un texto.
   *
   * Si el texto es vacio, se devuelve la lista original.
   * De lo contrario, se hace una busqueda por cada campo de cada elemento
   * de la lista.
   * @param buscado string a buscar
   */
  protected buscarTexto(buscado: string) {
    if (this.bandejaTramitesInicial.length === 0) {
      return;
    }
    if (!buscado) {
      this.bandejaTramites = this.bandejaTramitesInicial;
      this.itemPaginado.data.total = this.totalRegistros;
    } else {
      this.bandejaTramites = this.bandejaTramitesInicial.filter((data) =>
        Object.values(data).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' ||
              typeof fieldValue === 'number') &&
            fieldValue
              ?.toString()
              ?.toLowerCase()
              .includes(buscado.toLowerCase())
        )
      );
      this.itemPaginado.data.data = this.bandejaTramites;
      this.itemPaginado.data.total = this.bandejaTramites.length;

      this.bandejaTramites = this.bandejaTramites.map((item, index) => {
        return { ...item, orden: index + 1 };
      });
    }
  }

  protected exportarPdfExcel(exportType: TipoArchivoType): void {
    if (this.bandejaTramites.length > 0) {
      const headers = [
        'Número de caso',
        'Acto Procesal',
        'Trámite',
        'F. creación',
        'F. envío',
      ];
      const data: any[] = [];

      this.bandejaTramites.forEach((bandejaTramite: BandejaTramite) => {
        const row = {
          'Número de caso':
            bandejaTramite.coCaso + ' \n ' + bandejaTramite.noEtapa,
          'Acto Procesal': bandejaTramite.noActoProcesal,
          Trámite: bandejaTramite.noTramite,
          'F. creación': bandejaTramite.feCreacion,
          'F. envío': bandejaTramite.feEnvio,
        };
        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(
            data,
            headers,
            'tramites_enviados_visar'
          )
        : this.exportarService.exportarAExcel(
            data,
            headers,
            'tramites_enviados_visar'
          );
      return;
    }

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
  }

  protected filtrar(codigo: number) {
    this.dataBandeja!.idTipoCuaderno = codigo;
    this.dataBandeja = this.resetPaginate(this.dataBandeja!);
    this.obtenerTramitesEnviadosParaVisar(this.dataBandeja);
  }

  protected verHistorialTramite(tramite: BandejaTramite): void {
    this.referenciaModal = this.dialogService.open(
      HistorialTramiteModalComponent,
      {
        showHeader: false,
        data: {
          idCaso: tramite.idCaso,
          numeroCaso: tramite.coCaso,
          idTramite: tramite.idActoTramiteCaso,
          titulo: tramite.noTramite,
        },
      }
    );
  }

  public previewTramite(tramite: BandejaTramite): void {
    this.referenciaModal = this.dialogService.open(PreviewModalComponent, {
      width: '1000px',
      height: '95%',
      showHeader: false,
      data: {
        tramite: tramite,
      }
    });
  }

  protected verDetalleVisado(tramite: BandejaTramite): void {
    this.referenciaModal = this.dialogService.open(DetalleVisadoComponent, {
      showHeader: false,
      width: '800px',
      data: {
        idCaso: tramite.idCaso,
        numeroCaso: tramite.coCaso,
        idTramite: tramite.idTramite,
        nombreTramite: tramite.noTramite,
        idBandejaActoTramite: tramite.idBandejaActoTramite,
      },
    });
  }

  protected filtroColorTipoCuaderno(tramite: BandejaTramite): string {
    const filtro = TRAMITE_TIPO_CUADERNO_FILTRO.find(
      (elm) => elm.codigo === tramite.idTipoCuaderno
    );
    if (filtro === undefined) return '';
    return filtro.color!;
  }

  private resetPaginate(request: BandejaTramiteRequest): BandejaTramiteRequest {
    this.filtro = {
      page: 1,
      per_page: 10,
    };
    this.query = { limit: 10, page: 1, where: {} };
    request.page = this.filtro.page;
    request.perPage = this.filtro.per_page;
    return request;
  }
}
