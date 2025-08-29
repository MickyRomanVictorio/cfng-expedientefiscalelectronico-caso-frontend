import { CommonModule } from "@angular/common";
import { Component, inject, Input, Output, EventEmitter, HostListener, SimpleChanges, ElementRef } from "@angular/core";
import { RouterModule } from "@angular/router";
import { TabPagos } from "@core/interfaces/reusables/pagos/pagos";
import { CmpLibModule } from "dist/cmp-lib";
import { IconUtil } from "dist/ngx-cfng-core-lib";
@Component({
  selector: 'tabs-view-pagos',
  standalone: true,
  imports: [
  CommonModule,
  CmpLibModule,
  RouterModule
],
  templateUrl: './tabs-view-pagos.component.html',
  styleUrl: './tabs-view-pagos.component.scss'
})
export class TabsViewPagosComponent {
  private readonly elRef = inject(ElementRef);
  private readonly nextButtonWidth = 70;
  private tabsPorPagina = 4;
  protected paginaActual = 0;
  @Input() tabs: TabPagos[] = [];
  @Input() indexSeleccionado: number = 0;
  @Output() onChangeIndex = new EventEmitter<number>();

  @HostListener('window:resize', ['$event']) resizePantalla() {
    this.ajustarTabsVisibles();
  }
  constructor(
    protected iconUtil: IconUtil,
  ) {
  }
  ngOnInit() {
    this.asignarTabId();
    this.resizePantalla();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tabs'] && changes['tabs'].currentValue) {
      this.asignarTabId();
      this.resizePantalla();
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
    const contentWidth = this.obtenerWidthTabView();
    if (!contentWidth) return;
    let totalWidth = 0;
    let visibleTabs = 0;
    const startTabIndex = this.paginaActual * this.tabsPorPagina;
      for (let i = startTabIndex; i < this.tabs.length; i++) {
      const tab = this.tabs[i];
      if (tab.oculto) continue;
      const tabWidth = tab.atrasado?250: 180;
      totalWidth += tabWidth;
      if (totalWidth + this.nextButtonWidth > contentWidth) break;
      visibleTabs++;
    }
      this.tabsPorPagina = Math.min(visibleTabs, 4);

    const totalTabsVisibles = this.tabs.filter(tab => !tab.oculto).length;
    const totalPages = Math.ceil(totalTabsVisibles / this.tabsPorPagina);
    if (this.paginaActual >= totalPages) {
      this.paginaActual = Math.max(0, totalPages - 1);
    }
  }

  protected tabsVisibles() {
    const visibleTabs = this.tabs.filter(tab => !tab.oculto);
    const startIndex = this.paginaActual * this.tabsPorPagina;
    return visibleTabs.slice(startIndex, startIndex + this.tabsPorPagina);
  }

  protected seleccionarPaginaAnterior() {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      const ultimoTabVisible = this.tabsVisibles()[0];
      if (ultimoTabVisible) {
        this.indexSeleccionado = ultimoTabVisible.id!;
        this.onChangeIndex.emit(this.indexSeleccionado);
      }
    }
  }

  protected seleccionarPaginaSiguiente() {
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

  protected seleccionarTab(tabId: number) {
    const globalIndex = this.tabs.findIndex(tab => tab.id === tabId);
    if (this.indexSeleccionado === globalIndex)
      return;
    this.indexSeleccionado = globalIndex;
    this.onChangeIndex.next(globalIndex);
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
