import { CommonModule, DatePipe, DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { Cuadernos } from '@interfaces/reusables/delitos-y-partes/delitos-y-partes.interface';
import { ReusablesConsultaService } from '@services/reusables/reusables-consulta.service';
import { obtenerCasoHtml, } from 'ngx-cfng-core-lib';
import { DynamicDialogConfig, DynamicDialogRef, } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { EncabezadoModalComponent } from '@core/components/modals/encabezado-modal/encabezado-modal.component';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';

@Component({
  selector: 'app-listar-cuadernos-modal',
  standalone: true,
  imports: [CommonModule, EncabezadoModalComponent, TableModule, DatePipe, CapitalizePipe, PaginatorComponent],
  templateUrl: './listar-cuadernos-modal.component.html',
  styleUrl: './listar-cuadernos-modal.component.scss'
})
export class ListarCuadernosModalComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  protected cuadernos: Cuadernos[] = [];
  protected cuadernosFiltrados: Cuadernos[] = [];
  protected isRendered: boolean = false;
  private dialogElement: any;

  protected query: any = { limit: 10, page: 1, where: {} };
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [], pages: 0, perPage: 0, total: 0,
    },
  };

  protected dataMaestra: { idSujetoCaso: string, datosPersonales: string };
  protected datoComplementario = '';

  constructor(
    public referenciaModal: DynamicDialogRef,
    private configuracion: DynamicDialogConfig,
    private reusablesConsultaService: ReusablesConsultaService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.dataMaestra = this.configuracion.data;
    this.datoComplementario = `<h3><strong> Cuadernos del imputado: </strong> <small> ${this.dataMaestra.datosPersonales} </small></h3>`;
  }

  ngOnInit() {
    this.dialogElement = this.document.body.querySelector('.p-dialog-content');

    if (this.dialogElement) {
      this.renderer.addClass(this.dialogElement, 'hidden');
    }

    this.obtenerCuadernos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private obtenerCuadernos(): void {
    this.cuadernos = [];

    this.subscriptions.push(
      this.reusablesConsultaService.obtenerCuadernos(this.dataMaestra.idSujetoCaso)
        .subscribe({
          next: (resp) => {

            let index = 1;
            resp.forEach(x => x.nro = index++);

            this.cuadernos = resp;
            this.cuadernosFiltrados = resp;

            this.itemPaginado.data.data = this.cuadernosFiltrados;
            this.itemPaginado.data.total = this.cuadernos.length;
            this.updatePagedItems();

            this.isRendered = true;
            this.renderer.removeClass(this.dialogElement, 'hidden');
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
    this.cuadernosFiltrados = this.cuadernos.slice(start, end);
  }

  obtenerCasoHtml(numeroCaso: string) {
    return obtenerCasoHtml(numeroCaso);
  }
}
