import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HistorialTramiteModalComponent } from '@components/modals/historial-tramite-modal/historial-tramite-modal.component';
import { PreviewModalComponent } from '@components/modals/preview-modal/preview-modal.component';
import {
  TRAMITE_TIPO_CUADERNO,
  TRAMITE_TIPO_CUADERNO_FILTRO,
} from '@constants/menu';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { FiltroPaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { BandejaTramiteRequest } from '@core/interfaces/provincial/bandeja-tramites/BandejaTramiteRequest';
import { BandejaTramitesSharedService } from '@core/services/provincial/bandeja-tramites/bandeja-tramites-shared.service';
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
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';


@Component({
  standalone: true,
  selector: 'app-tramites-pendientes-visar',
  templateUrl: './tramites-pendientes-visar.component.html',
  imports: [
    ButtonModule,
    CapitalizePipe,
    CmpLibModule,
    TableModule,
    ToastModule,
    TooltipModule,
    DatePipe,
    PaginatorComponent,
    NgxCfngCoreModalDialogModule
  ],
  providers: [DialogService],
})
export default class TramitesPendientesVisarComponent
  implements OnInit, OnDestroy
{
  protected bandejaTramites: BandejaTramite[];
  protected bandejaTramitesInicial: BandejaTramite[];
  private dataBandeja!: BandejaTramiteRequest | null;
  public subscriptions: Subscription[] = [];
  public tramitesSeleccionados: BandejaTramite[] = [];
  public filtrosTramite: FiltroTramite[] = [];
  protected filtrosTramiteSelec: number = TRAMITE_TIPO_CUADERNO.TRAMITE_TODOS;
  public referenciaModal!: DynamicDialogRef;
  private bandejaBusquedaS!: Subscription;
  private readonly suscripciones: Subscription[] = [];
  protected totalRegistros: number = 0;

  public resetPage: boolean = false;
  public query: any = { limit: 10, page: 1, where: {} };
  public filtro: FiltroPaginacionInterface = {
    page: 1,
    per_page: 10,
  };
  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  constructor(
    private readonly exportarService: ExportarService,
    private readonly dialogService: DialogService,
    private readonly bandejaBusquedaService: BandejaBusquedaService,
    private readonly bandejaTramitesService: BandejaTramitesService,
    protected iconUtil: IconUtil,
    protected stringUtil: StringUtil,
    private readonly bandejaTramitesSharedService: BandejaTramitesSharedService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
  ) {
    this.bandejaTramitesInicial = [];
    this.bandejaTramites = [];
  }

  ngOnInit(): void {
    this.obtenerFiltrosTramite();

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
        this.dataBandeja = data;
        this.obtenerTramitesPendientesParaVisar(data);
      })
    );

  }

  ngOnDestroy(): void {
    if (this.bandejaBusquedaS) this.bandejaBusquedaS.unsubscribe();
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  private obtenerTramitesPendientesParaVisar(request: BandejaTramiteRequest) {
    request.page = this.filtro.page;
    request.perPage = this.filtro.per_page;
    this.bandejaTramites = [];
    this.subscriptions.push(
      this.bandejaTramitesService
        .obtenerTramitesPendientesParaRevisarVisar(request)
        .subscribe({
          next: (resp) => {

            this.bandejaTramites = resp.data.registros;
            this.bandejaTramitesInicial = resp.data.registros;
            this.totalRegistros = resp.data.totalElementosFiltrado;

            this.itemPaginado.data.data = this.bandejaTramites;
            this.itemPaginado.data.total = this.totalRegistros;

            this.bandejaTramitesSharedService.updateBandejaPendienteVisarContador(
              resp.data.totalElementos
            );
          },
          error: (error) => {
            this.modalDialogService.error('Error en el servicio', error.error.message, 'Aceptar');
          },
        })
    );
  }

  public exportarPdfExcel(exportType: TipoArchivoType): void {
    if (this.bandejaTramites.length > 0) {
      const headers = [
        'Enviado por',
        'Número de caso',
        'Etapa',
        'Acto Procesal',
        'Trámite',
        'F. creación',
        'F. envío',
      ];
      const data: any = [];

      this.bandejaTramites.forEach((bandejaTramite: BandejaTramite) => {
        const row = {
          'Enviado por':
            bandejaTramite.tramiteEnviadoPor.nombreCompleto +
            ' \n ' +
            bandejaTramite.tramiteEnviadoPor.dePerfil,
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
            'Trámites pendientes para visar'
          )
        : this.exportarService.exportarAExcel(
            data,
            headers,
            'Trámites pendientes para visar'
          );
      return;
    }
    this.modalDialogService.warning('', `No se encontraron registros para ser exportados a ${exportType}`, 'Aceptar');
  }

  public obtenerFiltrosTramite() {
    this.filtrosTramite = TRAMITE_TIPO_CUADERNO_FILTRO;
  }

  protected filtrar(codigo: number) {
    this.dataBandeja!.idTipoCuaderno = codigo;
    this.obtenerTramitesPendientesParaVisar(this.dataBandeja!);
  }

  public verHistorialTramite(tramite: BandejaTramite): void {
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
  public visarTramite(tramite: any): void {
    this.mostrarFormularioVisado(true, tramite);
  }

  private mostrarFormularioVisado(esMasivo: boolean, tramite: BandejaTramite) {
    this.referenciaModal = this.dialogService.open(PreviewModalComponent, {
      showHeader: false,
      width: '1000px',
      height: '95%',
      data: {
        tramite: tramite,
      }
    });

    this.referenciaModal.onClose.subscribe((data) => {
      this.obtenerTramitesPendientesParaVisar(this.dataBandeja!);
    });
  }

  protected filtroColorTipoCuaderno(fila: any): string {
    const filtro = TRAMITE_TIPO_CUADERNO_FILTRO.find(
      (elm) => elm.codigo === fila.idTipoCuaderno
    );
    if (filtro === undefined) return '';
    return filtro.color!;
  }

  get formFirmaValidation(): boolean {
    return true;
  }

  onPaginate(evento: any) {
    this.filtro.page = evento.page;
    this.filtro.per_page = evento.limit;
    this.query.limit = evento.limit;
    this.query.page = evento.page;
    this.obtenerTramitesPendientesParaVisar(this.dataBandeja!);
  }
}
