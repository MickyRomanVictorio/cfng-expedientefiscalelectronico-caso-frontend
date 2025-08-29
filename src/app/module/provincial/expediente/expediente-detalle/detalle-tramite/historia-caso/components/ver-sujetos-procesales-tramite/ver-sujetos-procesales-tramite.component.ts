import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { AsociarSujetosDelitosService } from '@core/services/reusables/efe/asociar-sujetos-delitos/asociar-sujetos-delitos.service';
import { TramitesActivosService } from '@core/services/reusables/efe/tramites-activos.service';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ver-sujetos-procesales-tramite',
  standalone: true,
  imports: [
    CmpLibModule,
    TableModule,
    PaginatorComponent
  ],
  templateUrl: './ver-sujetos-procesales-tramite.component.html',
  styleUrl: './ver-sujetos-procesales-tramite.component.scss'
})
export class VerSujetosProcesalesTramiteComponent implements OnInit, OnDestroy {

  private idActoTramiteCaso: string = ''
  private suscripciones: Subscription[] = []

  protected sujetosDelitosTramite: any [] = []
  protected sujetosDelitosTramiteFiltrado: any[] = []

  private configuracion = inject(DynamicDialogConfig)
  private tramitesActivosService = inject(TramitesActivosService)
  protected iconUtil = inject(IconUtil)
  protected referenciaModal = inject(DynamicDialogRef)
  private readonly asociarSujetosDelitosService = inject(AsociarSujetosDelitosService)
  
  protected readonly TIPO_PERSONA_LQRR: number = 6

  //paginación
  protected query: any = { limit: 3, page: 1, where: {} };
  protected resetPage: boolean = false;
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  
  constructor() {
    this.idActoTramiteCaso = this.configuracion.data.idActoTramiteCaso
  }

  ngOnInit(): void {
    this.obtenerSujetosDelitosTramite()
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(suscripcion => suscripcion.unsubscribe())
  }

  private obtenerSujetosDelitosTramite(): void {
    this.sujetosDelitosTramite = []
    this.suscripciones.push(
      this.asociarSujetosDelitosService.obtenerSujetosDelitosAsociadosTramite(this.idActoTramiteCaso).subscribe({
        next: (resp: any) => {
          this.sujetosDelitosTramite = resp
          this.sujetosDelitosTramiteFiltrado = this.sujetosDelitosTramite;
          this.itemPaginado.data.data = this.sujetosDelitosTramiteFiltrado;
          this.itemPaginado.data.total = this.sujetosDelitosTramiteFiltrado.length;
          this.updatePagedItems(this.sujetosDelitosTramiteFiltrado, false);
        },
        error: (error: any) => {
          console.error(error)
        }
      })
    )
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.updatePagedItems(paginacion.data, paginacion.resetPage)
  }

  updatePagedItems(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosDelitosTramiteFiltrado = data.slice(start, end);
  }

  public cerrarModal(): void {
    this.referenciaModal.close();
  }

}