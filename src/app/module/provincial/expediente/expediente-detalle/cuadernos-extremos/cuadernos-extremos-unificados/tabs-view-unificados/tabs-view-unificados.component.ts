import { CommonModule } from "@angular/common";
import { Component,  inject, Input, Output, EventEmitter, HostListener, SimpleChanges, ElementRef } from "@angular/core";
import { RouterModule} from "@angular/router";
import { Tab } from "@core/interfaces/comunes/tab";
import { CmpLibModule } from "dist/cmp-lib";
import { IconUtil } from "dist/ngx-cfng-core-lib";
@Component({
  selector: 'app-tabs-view-unificados',
  standalone: true,
  imports: [CommonModule, CmpLibModule, RouterModule],
  templateUrl: './tabs-view-unificados.component.html',
  styleUrl: './tabs-view-unificados.component.scss'
})
export class TabViewUnificadosComponent {
  @Input() tabs: Tab[] = [];
  @Input() indexSeleccionado: number = 0;
  @Input() desactivarTabs: boolean = false;

  @Output() onChangeIndex = new EventEmitter<number>();
  @Output() onNewTab = new EventEmitter<void>();
  @Output() eliminarTabs = new EventEmitter<number>();


  private readonly nextButtonWidth = 70;
  private readonly tabWidth = 275;
  protected paginaActual = 0;
  private tabsPorPagina = 1;

  constructor(private elRef: ElementRef,public iconUtil: IconUtil) {}

  @HostListener('window:resize')
  resizePantalla() {
    this.ajustarTabsVisibles();
  }

  ngOnInit() {
    this.asignarTabId();
    this.resizePantalla();
  }

  ngOnChanges() {
    this.asignarTabId();
    this.resizePantalla();
  }

  private asignarTabId() {
    this.tabs.forEach((tab, index) => {tab.id = index;});
  }

  private ajustarTabsVisibles() {
    const contentWidth = this.obtenerWidthTabView();
    if (!contentWidth) return;

    let totalWidth = 0;
    let visibleTabs = 0;
    const startTabIndex = this.paginaActual * this.tabsPorPagina;

    for (let i = startTabIndex; i < this.tabs.length; i++) {
      totalWidth += this.tabWidth;
      if (totalWidth + this.nextButtonWidth > contentWidth) break;
      visibleTabs++;
    }
    this.tabsPorPagina = Math.max(visibleTabs, 4);

    const totalPages = Math.ceil(this.tabs.length / this.tabsPorPagina);
    if (this.paginaActual >= totalPages) {
      this.paginaActual = totalPages - 1;
    }
  }

  protected tabsVisibles() {
    const startIndex = this.paginaActual * this.tabsPorPagina;
    return this.tabs.slice(startIndex, startIndex + this.tabsPorPagina);
  }

  protected evtPaginaAnterior() {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.indexSeleccionado = this.tabsVisibles()[0]?.id || 0;
      this.onChangeIndex.emit(this.indexSeleccionado);
    }
  }

  protected evtPaginaSiguiente() {
    if ((this.paginaActual + 1) * this.tabsPorPagina < this.tabs.length) {
      this.paginaActual++;
      this.indexSeleccionado = this.tabsVisibles()[0]?.id || 0;
      this.onChangeIndex.emit(this.indexSeleccionado);
    }
  }

  protected esUltimaPagina() {
    return (this.paginaActual + 1) * this.tabsPorPagina >= this.tabs.length;
  }

  protected evtSeleccionarTab(tabId: number) {
    const globalIndex = this.tabs.findIndex(tab => tab.id === tabId);
    if (this.indexSeleccionado === globalIndex) return;
    this.indexSeleccionado = globalIndex;
    this.onChangeIndex.emit(globalIndex);
  }

  private obtenerWidthTabView(): number {
    return this.elRef.nativeElement?.offsetWidth || 0;
  }
  eliminarTab(tabId: number, event: Event) {
   // event.stopPropagation();
    const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
    this.eliminarTabs.emit(tabIndex);
  }
  agregarNuevoTab() {
    this.onNewTab.emit();
    setTimeout(() => {
      const totalTabs = this.tabs.length;
      const totalPages = Math.ceil(totalTabs / this.tabsPorPagina);
      this.indexSeleccionado = totalTabs - 1; 
      if (this.indexSeleccionado >= this.paginaActual * this.tabsPorPagina + this.tabsPorPagina) {
        this.paginaActual = totalPages - 1; 
      }
      this.onChangeIndex.emit(this.indexSeleccionado);
      //this.resizePantalla();
    }, 100);
  }
}
