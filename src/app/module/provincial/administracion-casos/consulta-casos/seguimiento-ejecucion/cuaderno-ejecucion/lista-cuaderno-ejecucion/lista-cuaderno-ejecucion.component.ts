import { Component, inject } from '@angular/core';
import { FiltroCuadernoEjecucionComponent } from '../filtro-cuaderno-ejecucion/filtro-cuaderno-ejecucion.component';
import { GrillaCuadernosEjecucionComponent } from '../grilla-cuadernos-ejecucion/grilla-cuadernos-ejecucion.component';
import { ButtonModule } from 'primeng/button';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { CuadernoEjecucion, CuadernoEjecucionFiltro } from '@core/interfaces/provincial/cuaderno-ejecucion/cuaderno-ejecucion.interface';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { IconAsset } from 'dist/ngx-cfng-core-lib';
import { Subscription } from 'rxjs';
import { CuadernosEjecucionService } from '@core/services/provincial/cuadernos-ejecucion/cuadernos-ejecucion.service';

@Component({
  selector: 'lista-cuaderno-ejecucion',
  standalone: true,
  imports: [
    ButtonModule,
    PaginatorComponent,
    FiltroCuadernoEjecucionComponent,
    GrillaCuadernosEjecucionComponent
  ],
  providers: [DialogService, NgxCfngCoreModalDialogService],
  templateUrl: './lista-cuaderno-ejecucion.component.html',
  styleUrl: './lista-cuaderno-ejecucion.component.scss'
})
export class ListaCuadernoEjecucionComponent {

  private readonly suscripciones: Subscription[] = []

  private readonly cuadernosEjecucionService = inject(CuadernosEjecucionService)

  protected readonly iconAsset = inject(IconAsset)

  protected listaCuadernos: CuadernoEjecucion[] = []

  protected numeroBusqueda: number = 0

  public resetPage: boolean = false

  protected cantidadRegistrosTotales: number = 0

  private ultimoFiltroAplicado: CuadernoEjecucionFiltro | null = null

  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  }

  public query: any = { limit: 9, page: 1, where: {} }

  ngOnDestroy(): void {
    this.suscripciones.forEach(suscripcion => suscripcion.unsubscribe())
  }

  protected buscarCuadernoEjecucion(filtros: CuadernoEjecucionFiltro): void {
    this.ultimoFiltroAplicado = { ...filtros }
    this.suscripciones.push(
      this.cuadernosEjecucionService.lista(filtros)
        .subscribe({
          next: (rs) => {
            this.resetPage = false
            this.listaCuadernos = [...rs.registros]
            this.cantidadRegistrosTotales = rs.totalElementos
            this.numeroBusqueda++
            this.itemPaginado.data.data = rs.registros
            this.itemPaginado.data.total = rs.totalElementos
          }
        })
    )
  }

  protected onPaginate(evento: any): void {
    this.query.limit = evento.limit
    this.query.page = evento.page
    this.buscarCuadernoEjecucion({
      ...this.ultimoFiltroAplicado!,
      page: evento.page,
      perPage: evento.limit
    })
  }

  protected get textoCantidadCuadernos(): string {
    const total = this.cantidadRegistrosTotales;
    const texto = total === 1
      ? 'cuaderno de ejecución listado'
      : 'cuadernos de ejecución listados';

    return `${total} ${texto}`;
  }
}

