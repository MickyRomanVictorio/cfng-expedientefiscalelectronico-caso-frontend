import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DetalleDevolucion } from '@interfaces/provincial/bandeja-derivacion/enviados/derivado-devueltos/DetalleDevolucion';
import { EnviadosDerivadoAService } from '@services/provincial/bandeja-derivaciones/enviados/enviados-derivadoa.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { EncabezadoModalComponent } from '../encabezado-modal/encabezado-modal.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { DateFormatPipe } from '@pipes/format-date.pipe';

@Component({
  selector: 'app-detalle-devolucion-modal',
  standalone: true,
  imports: [
    CommonModule,
    EncabezadoModalComponent,
    TableModule,
    DateFormatPipe,
    CmpLibModule,
    PaginatorComponent,
  ],
  templateUrl: './detalle-devolucion-modal.component.html',
  styleUrls: ['./detalle-devolucion-modal.component.scss'],
})
export class DetalleDevolucionModalComponent implements OnInit, OnDestroy {
  public numeroCaso: string;
  public idBandejaDerivacion: string;
  public cargandoTabla: boolean = false;
  private subscriptions: Subscription[] = [];

  public detallesDevolucion: DetalleDevolucion[] = [];
  public detallesDevolucionFiltrados: DetalleDevolucion[] = [];

  //paginación
  protected resetPage: boolean = false;
  protected query: any = { limit: 3, page: 1, where: {} }
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  constructor(
    public referenciaModal: DynamicDialogRef,
    private configuracion: DynamicDialogConfig,
    private derivadosService: EnviadosDerivadoAService
  ) {
    this.numeroCaso = this.configuracion.data?.numeroCaso;
    this.idBandejaDerivacion = this.configuracion.data?.idBandejaDerivacion;
  }

  ngOnInit(): void {
    this.obtenerDetalleDevolucion(this.idBandejaDerivacion);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public obtenerDetalleDevolucion(idBandejaDerivacion: string): void {
    this.cargandoTabla = true;
    this.subscriptions.push(
      this.derivadosService.obtenerDetalleDevueltos(idBandejaDerivacion)
        .subscribe({
          next: (resp) => {
            this.cargandoTabla = false;
            console.log(resp);
            this.detallesDevolucion = resp;
            this.detallesDevolucionFiltrados = this.detallesDevolucion;
            this.itemPaginado.data.data = this.detallesDevolucionFiltrados
            this.itemPaginado.data.total = this.detallesDevolucionFiltrados.length
            this.updatePagedItems(this.detallesDevolucionFiltrados, false);
          },
          error: (error) => {
            console.log(error);
            this.cargandoTabla = false;
          },
        })
    );
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
    this.detallesDevolucionFiltrados = data.slice(start, end);
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  public verDocumentoDevolucion() {
    console.log('entro verDocumentoDevolucion')
    /**
     * Botón, esta funcionalidad permite visualizar en una nueva ventana el documento de la devolución del caso (archivo PDF).
     * 
     */
  }

}
