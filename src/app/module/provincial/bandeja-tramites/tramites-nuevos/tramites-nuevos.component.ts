import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HistorialTramiteModalComponent } from '@components/modals/historial-tramite-modal/historial-tramite-modal.component';
import { EnviarTramiteObjetivoComponent } from '@components/modals/mandar-caso/enviar-tramite-objetivo/enviar-tramite-objetivo.component';
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
import { TokenService } from '@services/shared/token.service';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import {
  CARGO,
  Constants,
  IconUtil,
  StringUtil,
} from 'ngx-cfng-core-lib';

import { JwtHelperService } from '@auth0/angular-jwt';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { OpcionEditarTramite } from '@core/components/reutilizable/editar-tramite/editar-tramite.component';
import { OpcionEliminarTramite } from '@core/components/reutilizable/eliminar-tramite/eliminar-tramite.component';

@Component({
  standalone: true,
  imports: [
    CmpLibModule,
    TableModule,
    CapitalizePipe,
    ToastModule,
    ButtonModule,
    TooltipModule,
    DatePipe,
    PaginatorComponent,
    NgxCfngCoreModalDialogModule,
    OpcionEditarTramite,
    OpcionEliminarTramite
  ],
  selector: 'app-tramites-nuevos',
  templateUrl: './tramites-nuevos.component.html',
  providers: [
    MessageService,
    DialogService,
    NgxCfngCoreModalDialogService
  ],
})
export default class TramitesNuevosComponent implements OnInit, OnDestroy {

  @ViewChild(PaginatorComponent) paginatorComponent!: PaginatorComponent;

  public esFiscal: boolean = false;
  protected bandejaTramites: BandejaTramite[] = [];
  protected bandejaTramitesInicial: BandejaTramite[] = [];
  public subscriptions: Subscription[] = [];
  public filtrosTramite: FiltroTramite[] = [];
  protected filtrosTramiteSelec: number = TRAMITE_TIPO_CUADERNO.TRAMITE_TODOS;
  public referenciaModal!: DynamicDialogRef;
  private bandejaBusquedaS!: Subscription;
  private readonly suscripciones: Subscription[] = [];
  private readonly cargosPermitidos: Array<string> = [CARGO.FISCAL_SUPERIOR, CARGO.FISCAL_PROVINCIAL];
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



  private readonly tokenService = inject(TokenService)
  private readonly messageService = inject(MessageService)
  private readonly exportarService = inject(ExportarService)
  private readonly dialogService = inject(DialogService)
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly bandejaBusquedaService = inject(BandejaBusquedaService)
  private readonly bandejaTramitesService = inject(BandejaTramitesService)
  protected stringUtil = inject(StringUtil)
  protected iconUtil = inject(IconUtil)

  get tituloTabla(): string {
    return this.cargosPermitidos.includes(this.tokenService.getDecoded().usuario.codCargo) ? 'Trámites nuevos' : 'Trámites nuevos que he creado'
  }

  ngOnInit(): void {
    this.filtrosTramite = TRAMITE_TIPO_CUADERNO_FILTRO;

    this.validarPerfilUsuario();
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
        this.obtenerTramitesNuevos(data);
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

  private obtenerTramitesNuevos(request: BandejaTramiteRequest) {
    request.page = this.filtro.page;
    request.perPage = this.filtro.per_page;
    this.bandejaTramites = [];

    this.subscriptions.push(
      this.bandejaTramitesService.obtenerTramitesNuevos(request).subscribe({
        next: (resp) => {
          this.bandejaTramites = resp.data.registros;
          this.bandejaTramitesInicial = resp.data.registros;
          this.totalRegistros = resp.data.totalElementosFiltrado;

          this.itemPaginado.data.data = this.bandejaTramites;
          this.itemPaginado.data.total = this.totalRegistros;
          this.itemPaginado.data.perPage = resp.data.perPage;
          this.buscarTextoSuscripcion();
        },
        error: (error) => {
          this.modalDialogService.error('Error en el servicio', error.error.message, 'Aceptar');
        },
      })
    );
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

  public exportarPdfExcel(exportType: TipoArchivoType): void {
    if (this.bandejaTramites.length > 0) {
      const headers = [
        'Número de caso',
        'Acto Procesal',
        'Trámite',
        'Creado por',
        'Fecha Creación',
      ];
      const data: any[] = [];
      this.bandejaTramites.forEach((tramiteNuevo: BandejaTramite) => {
        const creadoPor =
          (tramiteNuevo.tramiteCreadoPor?.nombreCompleto || 'Desconocido') +
          ' - ' +
          (tramiteNuevo.tramiteCreadoPor?.dePerfil ||
            'Perfil no disponible');

        const row = {
          'Número de caso': tramiteNuevo.coCaso + ' \n ' + tramiteNuevo.noEtapa,
          'Acto Procesal': tramiteNuevo.noActoProcesal,
          Trámite: tramiteNuevo.noTramite,
          'Creado por': creadoPor,
          'Fecha Creación': tramiteNuevo.feCreacion,
        };
        data.push(row);
      });
      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, this.tituloTabla)
        : this.exportarService.exportarAExcel(data, headers, this.tituloTabla);
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
    this.obtenerTramitesNuevos(this.dataBandeja!);
    // this.dataBandeja = this.resetPaginate(this.dataBandeja!);
    // this.obtenerTramitesNuevos(this.dataBandeja);
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

  protected enviarTramite(tramite: BandejaTramite): void {
    this.referenciaModal = this.dialogService.open(
      EnviarTramiteObjetivoComponent,
      {
        width: '50em',
        contentStyle: { padding: '15px', 'border-radius': '15px' },
        showHeader: false,
        data: {
          idBandejaActoTramite: null,
          idCaso: tramite.idCaso,
          numeroCaso: tramite.coCaso,
          idTramite: tramite.idTramite,
          idActoTramiteCaso: tramite.idActoTramiteCaso,
          tramite: tramite.noTramite,
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
        desdeNuevo: true,
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

  onPaginate(evento: any) {
    this.filtro.page = evento.page;
    this.filtro.per_page = evento.limit;
    this.query.limit = evento.limit;
    this.query.page = evento.page;
    this.obtenerTramitesNuevos(this.dataBandeja!);
  }

  private validarPerfilUsuario(): void {
    const helper = new JwtHelperService();
    const token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);

    if (token) {
      const decodedToken = helper.decodeToken(token.token);
      const perfilUsuario = decodedToken.usuario.cargo;

      // Comprobamos si el perfil del usuario es un cargo fiscal
      this.esFiscal = ['FISCAL PROVINCIAL'].includes(perfilUsuario);
    }
  }

  protected actualizarBandeja(): void {
    this.obtenerTramitesNuevos(this.dataBandeja!)
  }

  get esFiscalProvincial(): boolean {
    const usuario = this.tokenService.getDecoded().usuario;
    return usuario.codCargo === CARGO.FISCAL_PROVINCIAL;
  }

  get esFiscalSuperior(): boolean {
    const usuario = this.tokenService.getDecoded().usuario;
    return usuario.codCargo === CARGO.FISCAL_SUPERIOR;
  }

  mostrarEditar(tramite: BandejaTramite): boolean {
    /**const flgConcluido = tramite.flgConcluido ?? '0';
    return this.esFiscalProvincial && (flgConcluido === '0');**/
    return !this.esFiscalSuperior;
  }

  mostrarEliminar(tramite: BandejaTramite): boolean {
    return !this.esFiscalSuperior && tramite.esMiTramite;
  }

  // private resetPaginate(request: BandejaTramiteRequest): BandejaTramiteRequest {
  //   this.filtro = {
  //     page: 1,
  //     per_page: 10,
  //   };
  //   this.query = { limit: 10, page: 1, where: {} };
  //   request.page = this.filtro.page;
  //   request.perPage = this.filtro.per_page;
  //   return request;
  // }
}
