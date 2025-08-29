import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { Component, OnInit, signal } from '@angular/core';
import { obtenerIcono } from '@core/utils/icon';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { obtenerCodigoCasoHtml } from 'ngx-cfng-core-lib';
import { TableModule } from 'primeng/table';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';

@Component({
  selector: 'app-ver-petitorio',
  standalone: true,
  imports: [
    CmpLibModule,
    TableModule,
    PaginatorComponent
  ],
  templateUrl: './ver-petitorio.component.html',
  styleUrl: './ver-petitorio.component.scss'
})
export class VerPetitorioComponent implements OnInit {

  protected obtenerIcono = obtenerIcono;
  protected obtenerCodigoCasoHtml = obtenerCodigoCasoHtml;
  protected caso = signal<any>(null);
  protected paginacionCondicion = { limit: 9, page: 1, where: {} };
  public paginacionConfiguracion: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  constructor(
    protected readonly ref: DynamicDialogRef,
    private readonly configuracion: DynamicDialogConfig
  ){
    this.caso.set(this.configuracion.data);
  }

  ngOnInit(): void {
  }

  protected eventoCambiarPagina(datos: any) {
    this.paginacionCondicion.page = datos.page;
    this.paginacionCondicion.limit = datos.limit;
    this.actualizarListaCasosPaginacion(datos.data);
  }

  private actualizarListaCasosPaginacion(datos: any) {
    const start = (this.paginacionCondicion.page - 1) * this.paginacionCondicion.limit;
    const end = start + this.paginacionCondicion.limit;
    //this.listaCasos = datos.slice(start, end);
  }

}
