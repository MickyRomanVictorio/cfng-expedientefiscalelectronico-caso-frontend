import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HistorialTramiteModalComponent } from '@components/modals/historial-tramite-modal/historial-tramite-modal.component';
import { PreviewModalComponent } from '@components/modals/preview-modal/preview-modal.component';
import { TRAMITE_TIPO_CUADERNO, TRAMITE_TIPO_CUADERNO_FILTRO } from '@constants/menu';
import { BandejaTramiteRequest } from '@core/interfaces/provincial/bandeja-tramites/BandejaTramiteRequest';
import { BandejaTramitesService } from '@core/services/provincial/bandeja-tramites/bandeja-tramites.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { BandejaTramite } from '@interfaces/provincial/bandeja-tramites/BandejaTramite';
import { FiltroTramite } from '@interfaces/provincial/bandeja-tramites/FiltroTramite';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { BandejaBusqueda, BandejaBusquedaService } from '@services/provincial/bandeja-tramites/bandeja-busqueda.service';
import { ExportarService } from '@services/shared/exportar.service';
import { BANDEJA_ESTADO, CARGO, IconAsset, IconUtil, StringUtil } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService, SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import BandejaTramitesComponent from '../bandeja-tramites.component';
import { DetalleNotificacionComponent } from '../detalle-notificacion/detalle-notificacion.component';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { FiltroPaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { TokenService } from '@core/services/shared/token.service';
import { DOMAIN_FRONT_NOTIFICADOR } from '@environments/environment';
import { DialogModule } from 'primeng/dialog';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { OpcionEditarTramite } from '@core/components/reutilizable/editar-tramite/editar-tramite.component';
import { OpcionEliminarTramite } from '@core/components/reutilizable/eliminar-tramite/eliminar-tramite.component';
import { BandejaTramitesSharedService } from '@core/services/provincial/bandeja-tramites/bandeja-tramites-shared.service';

@Component({
  standalone: true,
  selector: 'app-tramites-firmados',
  templateUrl: './tramites-firmados.component.html',
  styleUrl: './tramites-firmados.component.scss',
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
    DialogModule,
    NgxCfngCoreModalDialogModule,
    OpcionEditarTramite,
    OpcionEliminarTramite,
  ],
  providers: [
    MessageService,
    DialogService,
    NgxCfngCoreModalDialogService
  ],
})
export default class TramitesFirmadosComponent implements OnInit {

  protected bandejaTramites: BandejaTramite[];
  protected bandejaTramitesInicial: BandejaTramite[];

  public subscriptions: Subscription[] = [];
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
    public prew: BandejaTramitesComponent,
    private readonly bandejaBusquedaService: BandejaBusquedaService,
    private readonly bandejaTramitesService: BandejaTramitesService,
    protected iconUtil: IconUtil,
    protected stringUtil: StringUtil,
    protected tokenService: TokenService,
    protected iconAsset: IconAsset,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly bandejaTramitesSharedService: BandejaTramitesSharedService,
  ) {
    this.bandejaTramites = [];
    this.bandejaTramitesInicial = [];
  }

  ngOnInit(): void {
    this.filtrosTramite = TRAMITE_TIPO_CUADERNO_FILTRO;
    //Suscripción para validar verificar los cambios en el componente de Filtros
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
        this.obtenerTramitesFirmados(data);
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

  private obtenerTramitesFirmados(request: BandejaTramiteRequest) {
    request.page = this.filtro.page;
    request.perPage = this.filtro.per_page;
    this.bandejaTramites = [];
    this.subscriptions.push(
      this.bandejaTramitesService.obtenerTramitesFirmados(request).subscribe({
        next: (resp) => {
          this.bandejaTramites = resp.data.registros;
          this.bandejaTramitesInicial = resp.data.registros;
          this.totalRegistros = resp.data.totalElementos;
          this.buscarTextoSuscripcion();

          this.itemPaginado.data.data = this.bandejaTramites;
          this.itemPaginado.data.total = this.totalRegistros;
          this.itemPaginado.data.perPage = resp.data.perPage;

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
    this.obtenerTramitesFirmados(this.dataBandeja!);
  }

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
    //
    const idTipoCuaderno =
      this.bandejaBusquedaService.configuracion.tipoCuadernoId;
    if (idTipoCuaderno >= 0) {
      this.bandejaTramites = this.bandejaTramites.filter(
        (elm) => elm.idTipoCuaderno === idTipoCuaderno
      );
    }
  }

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

  protected exportarPdfExcel(exportType: TipoArchivoType): void {
    if (this.bandejaTramites.length > 0) {
      const headers = [
        'Firmado por',
        'Número de caso',
        'Acto Procesal',
        'Trámite',
        'F. creación',
        'F. firma',
      ];
      const data: any[] = [];

      this.bandejaTramites.forEach((bandejaTramite: BandejaTramite) => {
        const firmadoPor =
          (bandejaTramite.tramiteEnviadoPor?.nombreCompleto || 'Desconocido') +
          ' - ' +
          (bandejaTramite.tramiteFirmadoPor?.dePerfil ||
            'Perfil no disponible');

        const row = {
          'Firmado por': firmadoPor,
          'Número de caso':
            bandejaTramite.coCaso + '\n' + bandejaTramite.noEtapa,
          'Acto Procesal': bandejaTramite.noActoProcesal,
          Trámite: bandejaTramite.noTramite,
          'F. creación': bandejaTramite.feCreacion,
          'F. firma': bandejaTramite.feFirma,
        };

        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(
          data,
          headers,
          'trámites firmados del despacho'
        )
        : this.exportarService.exportarAExcel(
          data,
          headers,
          'trámites firmados del despacho'
        );
      return;
    }

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
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
    this.obtenerTramitesFirmados(this.dataBandeja!);
  }

  protected verHistorialTramite(tramite: BandejaTramite): void {
    console.log('idBandejaEstado = ', this.bandejaTramitesSharedService.idBandejaEstadoActual);
    this.referenciaModal = this.dialogService.open(
      HistorialTramiteModalComponent,
      {
        showHeader: false,
        data: {
          idCaso: tramite.idCaso,
          numeroCaso: tramite.coCaso,
          idTramite: tramite.idActoTramiteCaso,
          titulo: tramite.noTramite,
          desdePendientesRevisar: this.bandejaTramitesSharedService.idBandejaEstadoActual === BANDEJA_ESTADO.TRAMITES_PENDIENTES_REVISAR,
          desdeFirmados: this.bandejaTramitesSharedService.idBandejaEstadoActual === BANDEJA_ESTADO.TRAMITES_FIRMADOS,
        },
      }
    );
  }

  protected verDetalleDeNotificaciones(
    numeroCaso: string,
    idCaso: string
  ): void {
    const verDetalleNotificacion = this.dialogService.open(
      DetalleNotificacionComponent,
      {
        showHeader: false,
        data: {
          idCaso,
          numeroCaso,
        },
      }
    );
    verDetalleNotificacion.onClose.subscribe({
      error: () => { },
    });
  }

  protected filtroColorTipoCuaderno(tramite: BandejaTramite): string {
    const filtro = TRAMITE_TIPO_CUADERNO_FILTRO.find(
      (elm) => elm.codigo === tramite.idTipoCuaderno
    );
    if (filtro === undefined) {
      return '';
    }

    return filtro.color!;
  }

  protected previewTramite(tramite: BandejaTramite): void {
    this.referenciaModal = this.dialogService.open(PreviewModalComponent, {
      showHeader: false,
      width: '1000px',
      height: '95%',
      data: {
        tramite: tramite,
      }
    });
  }

  verModalNotificar: boolean = false;
  tramitenotificar!: BandejaTramite;

  protected validarNotificacionPartes(tramite: BandejaTramite): void {
    this.subscriptions.push(
      this.bandejaTramitesService.validarNotificacionPartes(tramite.idActoTramiteCaso).subscribe({
        next: (resp) => {
          this.notificarPartes(tramite);
        },
        error: (error) => {
          if (error.error.code == 500) this.modalDialogService.error('Error en el servicio', error.error.message, 'Aceptar');
          else this.modalDialogService.warning('Mensaje del sistema', error.error.message, 'Aceptar');
        },
      })
    );
  }

  private notificarPartes(tramite: BandejaTramite): void {
    this.verModalNotificar = true
    this.tramitenotificar = tramite;
  }

  protected redirigirNotificador(tipo: number) {
    this.verModalNotificar = false;
    const token = this.tokenService.getWithoutBearer();
    window.location.href = `${DOMAIN_FRONT_NOTIFICADOR}/auth/auto?token=${token}&type=${tipo === 1 ? 'notificacion' : 'citacion'}&id=${this.tramitenotificar.idMovimiento}`;
  }

  protected actualizarBandeja(): void {
    this.obtenerTramitesFirmados(this.dataBandeja!)
  }

  get esFiscalProvincial(): boolean {
    const usuario = this.tokenService.getDecoded().usuario;
    return usuario.codCargo === CARGO.FISCAL_PROVINCIAL;
  }
  
  mostrarEditar(tramite: BandejaTramite): boolean {
    const flgConcluido = tramite.flgConcluido ?? '0';
    return this.esFiscalProvincial && (flgConcluido === '0');
  }

  mostrarEliminar(tramite: BandejaTramite): boolean {
    return this.esFiscalProvincial && tramite.esMiTramite;
  }

}
