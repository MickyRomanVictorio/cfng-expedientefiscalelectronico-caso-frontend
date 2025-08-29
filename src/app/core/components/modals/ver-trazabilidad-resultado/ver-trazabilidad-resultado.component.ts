import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { SujetoProcesalService } from '@core/services/provincial/sujeto-procesal/sujeto-procesal.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-ver-trazabilidad-resultado',
  templateUrl: './ver-trazabilidad-resultado.component.html',
  imports: [CommonModule, CmpLibModule, TableModule, PaginatorComponent, CapitalizePipe],
})
export class VerTrazabilidadResultadoComponent implements OnInit {
  protected caso!: Expediente;
  protected obtenerIcono = obtenerIcono;
  protected listaTrazabilidad: any[] = [];
  protected listaTrazabilidadFiltrado: any[] = [];
  protected iconoRelojSvg: SafeHtml | null = null;
  public suscripciones: Subscription[] = [];
  private idSujetoCaso: string = '';
  protected query: any = { limit: 10, page: 1, where: {} };
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  protected resetPage: boolean = false;

  constructor(
    protected dynamicDialogRef: DynamicDialogRef,
    public dynamicDialogConfig: DynamicDialogConfig,
    private gestionCasoService: GestionCasoService,
    private sujetoProcesalService: SujetoProcesalService
  ) {
    this.idSujetoCaso = this.dynamicDialogConfig.data.idSujetoCaso;
  }

  ngOnInit() {
    this.caso = this.gestionCasoService.casoActual;
    this.getListaTrazabilidas();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((subscription) => subscription.unsubscribe());
  }

  private getListaTrazabilidas() {
    this.suscripciones.push(
      this.sujetoProcesalService
        .obtenerListaTrazabilidad(this.caso.idCaso, this.idSujetoCaso)
        .subscribe((result: any) => {
          this.listaTrazabilidad = result;
          this.listaTrazabilidadFiltrado = this.listaTrazabilidad;

          this.itemPaginado.data.data = this.listaTrazabilidadFiltrado;
          this.itemPaginado.data.total = this.listaTrazabilidad.length;
          this.actualizarPaginaRegistros(this.listaTrazabilidadFiltrado, false);
        })
    );
  }

  protected close() {
    this.dynamicDialogRef.close();
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage);
  }

  actualizarPaginaRegistros(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.listaTrazabilidadFiltrado = data.slice(start, end);
  }
}
