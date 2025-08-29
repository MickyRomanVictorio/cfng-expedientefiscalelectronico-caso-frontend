import { CommonModule } from "@angular/common";
import { Component, OnInit, OnChanges, AfterViewInit, inject, Input, Output, EventEmitter, HostListener, SimpleChanges, ElementRef } from "@angular/core";
import { RouterModule, Router, NavigationEnd } from "@angular/router";
import { Tab } from "@core/interfaces/comunes/tab";
import { TipoIcono } from "@core/types/icono.type";
import { CmpLibModule } from "dist/cmp-lib";
import { iHome, iMail } from "ngx-mpfn-dev-icojs-regular";
import { TooltipModule } from "primeng/tooltip";
import { filter } from "rxjs";

@Component({
  standalone: true,
  selector: 'app-tabs-view',
  templateUrl: './tabs-view.component.html',
  styleUrls: ['./tabs-view.component.scss'],
  imports: [CommonModule, CmpLibModule, RouterModule, TooltipModule],
})
export class TabsViewComponent implements OnInit, OnChanges, AfterViewInit {

  private readonly router = inject(Router);
  private readonly elRef = inject(ElementRef);

  private readonly nextButtonWidth = 70;  // Ancho aproximado del botón siguiente

  private currentRoute!: string;

  private tabsPorPagina = 1;  // Número de pestañas visibles por página
  protected paginaActual = 0; // Página actual

  @Input() tabs: Tab[] = [];
  @Input() indexSeleccionado: number = 0;
  @Input() ajustarAncho: number = 0;
  // @Input() classTab: string = '';
  // @Input() classContainer: string = '';
  @Input() useRouter: boolean = false;
  @Input() desactivarTabs: boolean = false;
  @Output() onChangeIndex = new EventEmitter<number>();

  @HostListener('window:resize', ['$event']) resizePantalla() {
    this.ajustarTabsVisibles();
  }

  ngOnInit() {
    this.asignarTabId();
    this.resizePantalla();

    setTimeout(() => {
      if (this.useRouter) {
        this.currentRoute = this.router.url;

        const indice = this.tabs.findIndex(tab => {
          return this.rutaActiva(tab);
        });

        this.indexSeleccionado = indice;
      }
    }, 0);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tabs'] && this.tabs) {
      this.asignarTabId();
    }
    if (changes['ajustarAncho']) {
      this.ajustarTabsVisibles();
    }
  }

  ngAfterViewInit() {
    this.resizePantalla();
  }

  private asignarTabId() {
    this.tabs.forEach((tab, index) => {
      if (!tab.id) {
        tab.id = index;
      }
    });
  }

  private ajustarTabsVisibles() {
    // Obtener el contenedor de los tabs
    const contentWidth = this.obtenerWidthTabView();

    if (!contentWidth)
      return;

    // Calcular cuántos tabs caben en el ancho del contenedor
    let totalWidth = 0;
    let visibleTabs = 0;

    // Determinar la página actual y el índice de inicio basado en currentPage
    const startTabIndex = this.paginaActual * this.tabsPorPagina;

    // Recorrer los tabs a partir de la página actual
    for (let i = startTabIndex; i < this.tabs.length; i++) {
      const tab = this.tabs[i];

      if (tab.oculto) continue; // Ignorar los tabs ocultos

      // Si el tab no tiene un ancho definido, asignamos un ancho predeterminado (ej. 100px)
      const tabWidth = tab.ancho ?? 100;
      totalWidth += tabWidth;

      // Si el total de los anchos de los tabs más el ancho del siguiente botón supera el ancho del contenedor, detenemos
      if (totalWidth + this.nextButtonWidth > contentWidth) {
        break;
      }

      visibleTabs++;
    }

    // Ajustamos la cantidad de tabs visibles
    this.tabsPorPagina = visibleTabs;

    // Asegurarnos de que la página actual no se salga del rango después de ajustar el tamaño de los tabs
    const totalPages = Math.ceil(this.tabs.length / this.tabsPorPagina);
    if (this.paginaActual >= totalPages) {
      // Si la página actual es mayor que el total de páginas posibles, ajustamos a la última página
      this.paginaActual = totalPages - 1;
    }
  }

  protected tabsVisibles() {
    const visibleTabs = this.tabs.filter(tab => !tab.oculto);
    const startIndex = this.paginaActual * this.tabsPorPagina;  // Calcular el índice de inicio según la página actual y el tamaño de la página

    return visibleTabs.slice(startIndex, startIndex + this.tabsPorPagina);
  }

  protected evtPaginaAnterior() {
    if (this.paginaActual > 0) {
      this.paginaActual--;

      const ultimoTabVisible = this.tabsVisibles()[0];

      if (ultimoTabVisible) {
        this.indexSeleccionado = ultimoTabVisible.id!;
        this.onChangeIndex.emit(this.indexSeleccionado);
      }
    }
  }

  protected evtPaginaSiguiente() {
    if ((this.paginaActual + 1) * this.tabsPorPagina < this.tabs.length) {
      this.paginaActual++;

      const primerTabVisible = this.tabsVisibles()[0];

      if (primerTabVisible) {
        this.indexSeleccionado = primerTabVisible.id!;
        this.onChangeIndex.emit(this.indexSeleccionado);
      }
    }
  }

  protected esUltimaPagina() {
    const visibleTabs = this.tabs.filter(tab => !tab.oculto);

    return (this.paginaActual + 1) * this.tabsPorPagina >= visibleTabs.length;
  }

  protected evtSeleccionarTab(tabId: number) {
    const globalIndex = this.tabs.filter(t => t.oculto == null || !t.oculto).findIndex(tab => tab.id === tabId);
    if (this.indexSeleccionado === globalIndex)
      return;

    this.indexSeleccionado = globalIndex;
    this.onChangeIndex.next(globalIndex);
  }

  // *******************
  protected obtenerIcono(tipoIcono: TipoIcono): any {
    let icono = undefined;

    switch (tipoIcono) {
      case 'home':
        icono = iHome;
        break;

      case 'mail':
        icono = iMail;
        break;
    }

    return icono;
  }

  protected rutaActiva(tab: Tab): boolean {

    const rutaPadre = tab.rutaPadre!;

    const rutas = tab.rutasHijas!?.split(',');
    const rutasPadresActivas = tab.rutaPadre!?.split(',')
    const rutasActivas = rutas?.some((route) => this.currentRoute?.includes(route));

    if (rutaPadre === 'detalle-tramite') {
      return rutasActivas && !this.currentRoute.includes('cuadernos-incidentales');
    }

    if (rutaPadre === 'cuadernos-incidentales') {
      return rutasActivas && this.currentRoute.includes('cuadernos-incidentales');
    }

    if ( rutasPadresActivas.length > 1 ) {
      return rutasPadresActivas.some((rutaPadre) => this.currentRoute?.includes(rutaPadre))
    }

    return this.currentRoute?.includes(rutaPadre);
  }

  private obtenerWidthTabView() {
    const findClosestSibling = (element: HTMLElement, selector: string): HTMLElement | null => {
      let sibling = element.nextElementSibling as HTMLElement;

      while (sibling) {
        if (sibling.matches(selector)) {
          return sibling;
        }

        sibling = sibling.nextElementSibling as HTMLElement;
      }

      return null;
    };

    if (this.elRef.nativeElement) {
      const currentElement = this.elRef.nativeElement;
      const closestTabView = findClosestSibling(currentElement, 'p-tabView');

      if (closestTabView) {
        return closestTabView.offsetWidth;
      }
    }

    return null;
  }
}
