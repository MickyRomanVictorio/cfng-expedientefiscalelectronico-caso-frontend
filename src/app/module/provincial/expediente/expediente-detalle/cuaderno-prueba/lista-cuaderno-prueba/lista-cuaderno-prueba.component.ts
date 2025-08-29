import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { AlertaModalComponent } from '@core/components/modals/alerta-modal/alerta-modal.component';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
import { IconUtil } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { TableModule } from 'primeng/table';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ModalAgregarDocumentoComponent } from '../modal-agregar-documento/modal-agregar-documento.component';
import { ModalVisualizarDocumentoCuadernoPruebasComponent } from '../modal-visualizar-documento-cuaderno-pruebas/modal-visualizar-documento-cuaderno-pruebas.component';
import { CuadernoPrueba } from './interfaces/cuaderno-prueba';
import { ModificarCodigoCuadernoPruebaRequest } from './interfaces/modificar-codigo-cuaderno-prueba-request';
import { CuadernosPruebaService } from './services/cuadernos-prueba.service';

@Component({
  selector: 'app-lista-cuaderno-prueba',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CmpLibModule,
    FormsModule,
    PaginatorComponent,
    InputMaskModule,
  ],
  templateUrl: './lista-cuaderno-prueba.component.html',
  styleUrl: './lista-cuaderno-prueba.component.scss',
  providers: [DialogService],
})
export class ListaCuadernoPruebaComponent implements OnInit {
  protected referenciaModal!: DynamicDialogRef;
  protected codigoCuadernoPruebaOriginal: string = '';
  protected codigoCuadernoPrueba: string = '';
  protected listaCuardernoPrueba: CuadernoPrueba[] = [];
  protected listaCuardernoPruebaOriginal: CuadernoPrueba[] = [];
  protected esEditarCuadernoPrueba: boolean = false;
  protected caso!: Expediente;

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

  constructor(
    protected iconUtil: IconUtil,
    private readonly dialogService: DialogService,
    private readonly cuadernoPruebaService: CuadernosPruebaService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly casoService: Casos
  ) {
    this.caso = this.gestionCasoService.casoActual;
    console.log('caso: ', this.caso);
  }

  ngOnInit(): void {
    this.obtenerCodigoCuadernoPruebas();
    this.listarDocumentosCuadernoPruebas();
  }

  private obtenerCodigoCuadernoPruebas() {
    if (this.caso) {
      this.cuadernoPruebaService
        .obtenerCodigoCuadernoPruebas(this.caso.idCaso)
        .subscribe({
          next: (resp) => {
            console.log('resp: ', resp);
            this.codigoCuadernoPruebaOriginal = resp.data;
            this.codigoCuadernoPrueba = this.codigoCuadernoPruebaOriginal;
          },
          error: (err) => {
            console.log('err: ', err);
          },
        });
    }
  }

  private listarDocumentosCuadernoPruebas() {
    if (this.caso) {
      this.cuadernoPruebaService
        .listarDocumentosCuadernoPruebas(this.caso.idCaso)
        .subscribe({
          next: (resp) => {
            console.log('resp: ', resp);
            this.listaCuardernoPruebaOriginal = resp.data;
            this.listaCuardernoPrueba = this.listaCuardernoPruebaOriginal;

            this.itemPaginado.data.data = this.listaCuardernoPrueba;
            this.itemPaginado.data.total = this.listaCuardernoPrueba.length;
          },
          error: (err) => {
            console.log('err: ', err);
          },
        });
    }
  }

  private eventoModificarCodigoCuadernoPrueba() {
    if (this.codigoCuadernoPrueba != null && this.codigoCuadernoPrueba != '') {
      const ref = this.dialogService.open(AlertaModalComponent, {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'warning',
          title: `¿Confirma que desea modificar el código de cuaderno de prueba?`,
          description: ``,
          confirmButtonText: 'Confirmar',
          confirm: true,
        },
      });
      ref.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.modificarCodigoCuadernoPrueba();
          } else {
            this.codigoCuadernoPrueba = this.codigoCuadernoPruebaOriginal;
            this.esEditarCuadernoPrueba = false;
          }
        },
      });
    }
  }

  private modificarCodigoCuadernoPrueba() {
    const request: ModificarCodigoCuadernoPruebaRequest = {
      idCaso: this.caso.idCaso,
      codigoCuadernoPruebas: this.codigoCuadernoPrueba,
    };

    this.cuadernoPruebaService
      .modificarCodigoCuadernoPrueba(request)
      .subscribe({
        next: (resp) => {
          console.log('resp: ', resp);
          this.esEditarCuadernoPrueba = false;
        },
        error: (err) => {
          console.log('err: ', err);
        },
      });
  }

  private obtenerDocumentos(idActoTramiteCaso: string): Observable<string[]> {
    return this.casoService.actoTramiteDetalleCaso(idActoTramiteCaso).pipe(
      map((resp) => resp.idDocumentos),
      catchError((error) => {
        console.error('Error fetching documents:', error);
        return throwError(() => new Error('Failed to fetch documents'));
      })
    );
  }

  protected eventoVisualizarDocumento(item: CuadernoPrueba): void {
    this.obtenerDocumentos(item.idActoTramiteCaso).subscribe({
      next: (idDocumentos) => {
        this.referenciaModal = this.dialogService.open(
          ModalVisualizarDocumentoCuadernoPruebasComponent,
          {
            showHeader: false,
            width: '95%',
            height: '95%',
            data: {
              idDocumentos: idDocumentos,
            },
          } as DynamicDialogConfig<any>
        );
      },
      error: (err) => {
        console.error('Error opening modal:', err);
      },
    });
  }

  protected mostrarModalAgregarDocumento() {
    // console.log('item: ', item);
    this.referenciaModal = this.dialogService.open(
      ModalAgregarDocumentoComponent,
      {
        showHeader: false,
        width: '600px',
        height: '610px',
        data: {},
      } as DynamicDialogConfig<any>
    );
  }

  protected toggleEditarCuadernoPrueba() {
    if (this.esEditarCuadernoPrueba) this.eventoModificarCodigoCuadernoPrueba();
    else this.esEditarCuadernoPrueba = !this.esEditarCuadernoPrueba;
  }

  onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.listaCuardernoPrueba = this.listaCuardernoPruebaOriginal.slice(
      start,
      end
    );
  }
}
