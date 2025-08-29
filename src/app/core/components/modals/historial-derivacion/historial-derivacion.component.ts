import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { InformacionCasoService } from '@services/provincial/bandeja-derivaciones/informacion-caso/informacion-caso.service';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
@Component({
  standalone: true,
  selector: 'app-historial-derivacion',
  templateUrl: './historial-derivacion.component.html',
  imports: [
    CmpLibModule,
    SharedModule,
    TableModule,
    CommonModule,
    ButtonModule,
    PaginatorComponent,
  ],
})
export class HistorialDerivacionComponent {
  protected tituloModal: SafeHtml | undefined = undefined;
  protected obtenerIcono = obtenerIcono;
  protected listHistorialDerivacion: any[] = [];
  protected listHistorialDerivacionTemp: any[] = [];
  private suscripciones: Subscription[] = [];
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
  protected titulo: string = 'Historial de Derivación Caso: ';

  protected numeroCaso: string = '';
  protected idCaso: string = '';

  constructor(
    public referenciaModal: DynamicDialogRef,
    private configuracion: DynamicDialogConfig,
    private sanitizador: DomSanitizer,
    private dialogService: DialogService,
    private informacionCasoService: InformacionCasoService
  ) {
    this.numeroCaso = this.configuracion.data?.numeroCaso;
    this.idCaso = this.configuracion.data?.idCaso;
  }

  ngOnInit(): void {
    this.obtenerTitulo();
    this.getHistorialDerivacion();
  }

  getHistorialDerivacion() {
    this.suscripciones.push(
      this.informacionCasoService
        .obtenerHistorialDerivaciones(this.idCaso)
        .subscribe({
          next: (resp) => {
            this.listHistorialDerivacion = resp;
            this.listHistorialDerivacionTemp = this.listHistorialDerivacion;
            this.itemPaginado.data.data = this.listHistorialDerivacion;
            this.itemPaginado.data.total = this.listHistorialDerivacion.length;
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.listHistorialDerivacion = this.listHistorialDerivacionTemp.slice(
      start,
      end
    );
  }

  private obtenerTitulo(): void {
    const tituloHtml = `${this.titulo} ${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloModal = this.sanitizador.bypassSecurityTrustHtml(tituloHtml);
  }

  public cerrarModal(): void {
    this.referenciaModal.close();
  }
}
