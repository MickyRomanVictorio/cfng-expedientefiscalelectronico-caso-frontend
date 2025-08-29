import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HistorialTramiteModalComponent } from '@components/modals/historial-tramite-modal/historial-tramite-modal.component';
import { PreviewModalComponent } from '@components/modals/preview-modal/preview-modal.component';
import {
  TRAMITE_TIPO_CUADERNO,
  TRAMITE_TIPO_CUADERNO_FILTRO,
} from '@constants/menu';
import { EnviarTramiteObjetivoComponent } from '@core/components/modals/mandar-caso/enviar-tramite-objetivo/enviar-tramite-objetivo.component';
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
import { CARGO, IconUtil, StringUtil } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { FiltroPaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { BandejaTramitesSharedService } from '@core/services/provincial/bandeja-tramites/bandeja-tramites-shared.service';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { OpcionEliminarTramite } from '@core/components/reutilizable/eliminar-tramite/eliminar-tramite.component';
import { OpcionEditarTramite } from '@core/components/reutilizable/editar-tramite/editar-tramite.component';
import { TokenService } from '@core/services/shared/token.service';

@Component({
  standalone: true,
  selector: 'app-tramites-pendientes-revisar',
  templateUrl: './tramites-pendientes-revisar.component.html',
  imports: [
    ButtonModule,
    CapitalizePipe,
    CmpLibModule,
    TableModule,
    ToastModule,
    DatePipe,
    TooltipModule,
    PaginatorComponent,
    NgxCfngCoreModalDialogModule,
    OpcionEditarTramite,
    OpcionEliminarTramite
  ],
  providers: [DialogService],
})
export default class TramitesPendientesRevisarComponent
  implements OnInit, OnDestroy {
  protected bandejaTramites: BandejaTramite[] = [];
  protected bandejaTramitesInicial: BandejaTramite[] = [];

  public subscriptions: Subscription[] = [];
  public tramitesSeleccionados: BandejaTramite[] = [];
  public filtrosTramite: FiltroTramite[] = [];
  protected filtrosTramiteSelec: number = TRAMITE_TIPO_CUADERNO.TRAMITE_TODOS;
  public referenciaModal!: DynamicDialogRef;
  private bandejaBusquedaS!: Subscription;
  private readonly suscripciones: Subscription[] = [];
  protected totalRegistros: number = 0;
  protected usuario: any;

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
    private readonly exportarService: ExportarService,
    private readonly dialogService: DialogService,
    private readonly bandejaBusquedaService: BandejaBusquedaService,
    private readonly bandejaTramitesService: BandejaTramitesService,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil,
    private readonly bandejaTramitesSharedService: BandejaTramitesSharedService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly tokenService: TokenService,
  ) {
    this.usuario = this.tokenService.getDecoded().usuario;
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
        this.obtenerTramitesPendientesParaRevisar(data);
      })
    );
  }

  ngOnDestroy(): void {
    if (this.bandejaBusquedaS) this.bandejaBusquedaS.unsubscribe();
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  private obtenerTramitesPendientesParaRevisar(request: BandejaTramiteRequest) {
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

            this.bandejaTramitesSharedService.updateBandejaPendienteRevisarContador(
              resp.data.totalElementos
            );
          },
          error: (error) => {
            this.modalDialogService.error('Error en el servicio', error.error.message, 'Aceptar');
          },
        })
    );
  }

  onPaginate(evento: any) {
    this.filtro.page = evento.page;
    this.filtro.per_page = evento.limit;
    this.query.limit = evento.limit;
    this.query.page = evento.page;
    this.obtenerTramitesPendientesParaRevisar(this.dataBandeja!);
  }

  protected exportarPdfExcel(exportType: TipoArchivoType): void {
    if (this.bandejaTramites.length > 0) {
      const headers = [
        'Enviado por',
        'Número de caso',
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
            bandejaTramite.coCaso + '\n' + bandejaTramite.noEtapa,
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
          'Trámites pendientes para revisar'
        )
        : this.exportarService.exportarAExcel(
          data,
          headers,
          'Trámites pendientes para revisar'
        );
      return;
    }
    this.modalDialogService.warning('', `No se encontraron registros para ser exportados a ${exportType}`, 'Aceptar');
  }

  protected volverConsultarDatos() {
    this.bandejaBusquedaService.configuracionXDefecto = {
      ejecutarNuevaBusqueda: true,
      tipoCuadernoId: this.filtrosTramiteSelec,
      ejecutarNuevaBusquedaXTexto: true,
    };
  }

  protected filtrar(codigo: number) {
    this.dataBandeja!.idTipoCuaderno = codigo;
    this.obtenerTramitesPendientesParaRevisar(this.dataBandeja!);
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
          desdePendientesRevisar: true,
        },
      }
    );
  }

  protected previewTramite(tramite: BandejaTramite): void {
    this.referenciaModal = this.dialogService.open(PreviewModalComponent, {
      showHeader: false,
      width: '1000px',
      height: '95%',
      data: {
        tramite: tramite,
        desdePendientesRevisar: true,
      }
    });
  }

  protected enviarTramite(tramite: BandejaTramite): void {
    this.referenciaModal = this.dialogService.open(
      EnviarTramiteObjetivoComponent,
      {
        width: '50em',
        contentStyle: { padding: '15px', 'border-radius': '15px' },
        showHeader: false,
        data: {
          idBandejaActoTramite: tramite.idBandejaActoTramite,
          idCaso: tramite.idCaso,
          numeroCaso: tramite.coCaso,
          idTramite: tramite.idTramite,
          idActoTramiteCaso: tramite.idActoTramiteCaso,
          tramite: tramite.noTramite,
        },
      }
    );
  }

  protected actualizarBandeja(): void {
    this.obtenerTramitesPendientesParaRevisar(this.dataBandeja!)
  }

  protected filtroColorTipoCuaderno(tramite: BandejaTramite): string {
    const filtro = TRAMITE_TIPO_CUADERNO_FILTRO.find(
      (elm) => elm.codigo === tramite.idTipoCuaderno
    );
    if (filtro === undefined) return '';
    return filtro.color!;
  }

  get esFiscalProvincial(): boolean {
    return this.usuario.codCargo === CARGO.FISCAL_PROVINCIAL;
  }

  mostrarEditar(tramite: BandejaTramite): boolean {
    /**const flgConcluido = tramite.flgConcluido ?? '0';
    return this.esFiscalProvincial && (flgConcluido === '0');**/
    return this.esFiscalProvincial;
  }
}
