import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
import { BandejaTramitesSharedService } from '@core/services/provincial/bandeja-tramites/bandeja-tramites-shared.service';
import { BandejaTramitesService } from '@core/services/provincial/bandeja-tramites/bandeja-tramites.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { Tab } from '@interfaces/comunes/tab';
import { BandejaTramite } from '@interfaces/provincial/bandeja-tramites/BandejaTramite';
import { BANDEJA_ESTADO } from 'ngx-cfng-core-lib';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TabViewModule } from 'primeng/tabview';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [TabViewModule, TabsViewComponent, RouterOutlet],
  selector: 'app-bandeja-tramites',
  templateUrl: './bandeja-tramites.component.html',
  providers: [MessageService, DialogService],
})
export default class BandejaTramitesComponent implements OnInit {
  protected subscriptions: Subscription[] = [];
  protected bandejaTramites: BandejaTramite[] = [];
  protected bandejaTramitesInicial: BandejaTramite[] = [];
  protected referenciaModal!: DynamicDialogRef;
  protected tabs: Tab[] = [];
  protected tabActivo: number = 0;
  public idBandejaEstado = 0;
  protected BANDEJA_ESTADO = BANDEJA_ESTADO;
  protected rutas: Map<number, string>;

  constructor(
    private readonly router: Router,
    private readonly tramiteService: TramiteService,
    private readonly bandejaTramitesService: BandejaTramitesService,
    private readonly bandejaTramitesSharedService: BandejaTramitesSharedService
  ) {
    let urlBase = '/app/bandeja-tramites';
    this.rutas = new Map<number, string>([
      [0, `${urlBase}/nuevos`],
      [1, `${urlBase}/enviados-para-revisar`],
      [2, `${urlBase}/enviados-para-visar`],
      [3, `${urlBase}/pendientes-para-revisar`],
      [4, `${urlBase}/pendientes-para-visar`],
      [5, `${urlBase}/firmados`],
    ]);
  }

  ngOnInit() {
    this.tabsXPerfil();
    this.obtenerTabsPorRol();
    this.bandejaTramitesSharedService.bandejaPendienteRevisarContador$.subscribe(
      (count) => {
        this.tabs.filter(
          (tab) => tab.id === BANDEJA_ESTADO.TRAMITES_PENDIENTES_REVISAR
        )[0].cantidad = count;
        this.tabs.filter(
          (tab) => tab.id === BANDEJA_ESTADO.TRAMITES_PENDIENTES_REVISAR
        )[0].tooltipCantidad =
          'Cantidad total de trámites pendientes para revisar';
      }
    );

    this.bandejaTramitesSharedService.bandejaPendienteVisarContador$.subscribe(
      (count) => {
        this.tabs.filter(
          (tab) => tab.id === BANDEJA_ESTADO.TRAMITES_PENDIENTES_VISAR
        )[0].cantidad = count;
      }
    );

    forkJoin({
      cantidadPendienteRevisar:
        this.bandejaTramitesService.cantidadTramitePendienteParaRevisarVisar(
          461
        ),
      cantidadPendienteVisar:
        this.bandejaTramitesService.cantidadTramitePendienteParaRevisarVisar(
          462
        ),
    }).subscribe({
      next: (response: any) => {
        this.bandejaTramitesSharedService.updateBandejaPendienteRevisarContador(
          response.cantidadPendienteRevisar.data
        );

        this.bandejaTramitesSharedService.updateBandejaPendienteVisarContador(
          response.cantidadPendienteVisar.data
        );
      },
      error: (err) => {
        console.error('Error loading data:', err);
      },
    });
  }

  private tabsXPerfil() {
    let currentRoute = this.router.url;
    const indice = this.encontrarIndice(currentRoute);
    console.log('ruta: ', currentRoute, indice);

    const tabs = [...Tabs];
    this.tabs = tabs;
    this.idBandejaEstado = this.tabs[indice!].id!;
    this.bandejaTramitesSharedService.updateBandejaEstado(this.idBandejaEstado);
  }

  protected encontrarIndice(ruta: string): number | undefined {
    // Convert the Map to an array of [index, route] pairs
    const rutasArray = Array.from(this.rutas.entries());

    // Use find to get the first matching route
    const resultado = rutasArray.find(
      ([_, rutaGuardada]) => rutaGuardada === ruta
    );

    // Return the index if a match is found, otherwise return undefined
    return resultado ? resultado[0] : undefined;
  }

  private obtenerTabsPorRol() {
    this.tramiteService.obtenerTabsPorCargo().subscribe({
      next: (resp) => {
        this.tabs.forEach((tab) => {
          const key = Object.values(resp).find((e) => e === tab.id);
          tab.oculto = !key;
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  protected cambiarTab(indiceTab: number) {
    const urlBase = this.obtenerUrlBase(indiceTab);
    this.bandejaTramites = [];
    this.bandejaTramitesInicial = [];
    this.tabActivo = indiceTab;
    this.idBandejaEstado = this.tabs[indiceTab].id!;
    this.bandejaTramitesSharedService.updateBandejaEstado(this.idBandejaEstado);
    this.router.navigate([`${urlBase}`]);
  }

  protected obtenerUrlBase(indiceTab: number) {
    return this.rutas.get(indiceTab) ?? this.rutas.get(0);
  }
}

const Tabs: Tab[] = [
  {
    id: BANDEJA_ESTADO.TRAMITES_NUEVOS,
    titulo: 'Nuevos',
    ancho: 110,
    rutaPadre: 'nuevos',
  },
  {
    id: BANDEJA_ESTADO.TRAMITES_ENVIADOS_REVISAR,
    titulo: 'Enviados para revisar',
    ancho: 220,
    rutaPadre: 'enviados-para-revisar',
  },
  {
    id: BANDEJA_ESTADO.TRAMITES_ENVIADOS_VISAR,
    titulo: 'Enviados para visar',
    ancho: 210,
    rutaPadre: 'enviados-para-visar',
  },
  {
    id: BANDEJA_ESTADO.TRAMITES_PENDIENTES_REVISAR,
    titulo: 'Pendientes para revisar',
    ancho: 270,
    cantidad: 0,
    rutaPadre: 'pendientes-para-revisar',
  },
  {
    id: BANDEJA_ESTADO.TRAMITES_PENDIENTES_VISAR,
    titulo: 'Pendientes para visar',
    ancho: 240,
    cantidad: 0,
    rutaPadre: 'pendientes-para-visar',
  },
  {
    id: BANDEJA_ESTADO.TRAMITES_FIRMADOS,
    titulo: 'Firmados',
    ancho: 150,
    rutaPadre: 'firmados',
  },
];
