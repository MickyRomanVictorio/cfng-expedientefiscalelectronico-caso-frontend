import { Component, inject, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CmpLibModule } from 'dist/cmp-lib';
import { ButtonModule } from 'primeng/button';
import { TipoClasificador } from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/tipo-clasificador.interface';
import {
  ListaDelitosSujetos,
  SujetoProcesal,
} from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/sujeto-procesal.interface';
import { Subscription } from 'rxjs';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { CuadernosIncidentalesService } from '@core/services/provincial/cuadernos-incidentales/cuadernos-incidentales.service';
import {
  icono,
  IconUtil,
  obtenerCasoHtml,
  RESPUESTA_MODAL,
} from 'dist/ngx-cfng-core-lib';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { Expediente } from '@core/utils/expediente';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';

@Component({
  standalone: true,
  selector: 'app-agregar-sujetos-procesales',
  templateUrl: './agregar-sujetos-cuaderno-incidental.html',
  styleUrls: ['./agregar-sujetos-cuaderno-incidental.scss'],
  imports: [
    CommonModule,
    CmpLibModule,
    ButtonModule,
    FormsModule,
    TableModule,
    MultiSelectModule,
    PaginatorComponent,
  ],
  providers: [NgxCfngCoreModalDialogService],
})
export class AgregarSujetosProcesalesComponent {
  public caso!: Expediente;
  protected listaCuadernoIndicental: TipoClasificador[] = [];
  protected cuadernoIndicentalIdSelecciondo: string | null = null;
  protected listaSujetosProcesales: SujetoProcesal[] = [];
  protected sujetosSeleccionados: SujetoProcesal[] = [];
  private readonly subscriptions: Subscription[] = [];
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
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
    public config: DynamicDialogConfig,
    private gestionCasoService: GestionCasoService,
    private cuadernosIncidentalesService: CuadernosIncidentalesService,
    protected iconUtil: IconUtil,
    public dialogRef: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual;
    if (this.caso.idCasoPadre) {
      this.listarSujetosProcesales();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  codigosCuaderno(datos: string): string {
    const lista = datos.split(',');
    for (let i = 0; i < lista.length; i++) {
      lista[i] = obtenerCasoHtml(lista[i].trim());
    }
    return lista.join(',');
  }

  listarSujetosProcesales() {
    if (this.caso.idCasoPadre && this.caso.idTipoClasificadorExpediente) {
      this.cuadernosIncidentalesService
        .listaSujetosProcesalesXCasoPadre(
          this.caso.idCasoPadre,
          this.caso.idCaso,
          this.caso.idTipoClasificadorExpediente
        )
        .subscribe({
          next: (rs) => {
            this.sujetosSeleccionados = [];
            this.listaSujetosProcesales = rs;
            this.listaSujetosProcesales.forEach((elm) => {
              elm.delitos.forEach((delito) => {
                delito.delitoCompleto = `${delito.delitoGenerico} / ${delito.delitoSubgenerico} / ${delito.delitoEspecifico}`;
              });
              elm.delitosSeleccionados = [];
              if (elm.idSujetoProcesalCarpeta !== null) {
                elm.delitosSeleccionados = this.setearDelitosObtenidos(
                  elm.delitos,
                  elm.delitosProcesalCarpeta
                );
                this.sujetosSeleccionados.push(elm);
              }
            });
            this.itemPaginado.data.data = this.listaSujetosProcesales;
            this.itemPaginado.data.total = this.listaSujetosProcesales.length;
            this.actualizarPaginaRegistros(this.listaSujetosProcesales, false);
          },
        });
    }
  }

  setearDelitosObtenidos(
    listaTotal: ListaDelitosSujetos[],
    listaObtenidos: ListaDelitosSujetos[]
  ): ListaDelitosSujetos[] {
    const obtenidosSet = new Set(
      listaObtenidos.map(
        (delito) =>
          `${delito.idDelitoEspecifico}-${delito.idDelitoGenerico}-${delito.idDelitoSubgenerico}`
      )
    );
    return listaTotal.filter((delito) =>
      obtenidosSet.has(
        `${delito.idDelitoEspecifico}-${delito.idDelitoGenerico}-${delito.idDelitoSubgenerico}`
      )
    );
  }

  quitarDelito(
    sujeto: SujetoProcesal,
    delito: ListaDelitosSujetos,
    event: Event,
    multiSelect: any
  ): void {
    event.stopPropagation();
    sujeto.delitosSeleccionados = sujeto.delitosSeleccionados.filter(
      (d) => d.idDelitoSujeto !== delito.idDelitoSujeto
    );
    multiSelect.hide();
    this.listaSujetosProcesales = [...this.listaSujetosProcesales];
  }

  sujetoSeleccionado(idSujetoCaso: string): boolean {
    return this.sujetosSeleccionados.some(
      (sujeto) => sujeto.idSujetoCaso === idSujetoCaso
    );
  }

  quitarSeleccionSujeto(event: any): void {
    event.data.delitosSeleccionados = [];
  }

  quitarSeleccionSujetoTabla(event: any): void {
    if (event.checked == false) {
      this.listaSujetosProcesales.forEach(
        (sujeto) => (sujeto.delitosSeleccionados = [])
      );
    }
  }
  confirmarAgregarSujetoProcesal() {
    const dialog = this.modalDialogService.question(
      'Modificar cuaderno incidental',
      `¿Está seguro de modificar este cuaderno incidental: <b></b>?`,
      'Continuar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.agregarSujetoProcesal();
        }
      },
    });
  }
  agregarSujetoProcesal() {
    const sujetosProcesales: any[] = [];
    this.listaSujetosProcesales.forEach((elm) => {
      const seleccionado = this.sujetosSeleccionados.find(
        (t) =>
          t.idSujetoCaso === elm.idSujetoCaso &&
          t.idSujetoProcesalCarpeta === elm.idSujetoProcesalCarpeta
      );
      if (seleccionado !== undefined) {
        sujetosProcesales.push({
          idSujetoCaso: elm.idSujetoCaso,
          idSujetoProcesalCarpeta: elm.idSujetoProcesalCarpeta,
          flagAccion: '1',
          delitos: elm.delitosSeleccionados,
        });
      } else if (elm.idSujetoProcesalCarpeta !== null) {
        sujetosProcesales.push({
          idSujetoCaso: elm.idSujetoCaso,
          idSujetoProcesalCarpeta: elm.idSujetoProcesalCarpeta,
          flagAccion: '0',
          delitos: elm.delitosSeleccionados,
        });
      }
    });
    this.cuadernosIncidentalesService
      .modificar({
        idCasoPadre: this.caso.idCaso,
        sujetos: sujetosProcesales,
      })
      .subscribe({
        next: (rs) => {
          this.dialogRef.close(RESPUESTA_MODAL.OK);
          this.modalDialogService.success(
            'Sujetos agregados correctamente',
            `Se agregaron correctamente los sujetos procesales y/o delitos al cuaderno <b>${this.caso.numeroCaso}</b>`,
            'Aceptar'
          );
        },
        error: (error) => {
          this.modalDialogService.error(
            'Error',
            `Se ha producido un error al intentar modificar el cuaderno incidental`,
            'Ok'
          );
          this.dialogRef.close();
        },
      });
  }

  icono(name: string): string {
    return icono(name);
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
    this.listaSujetosProcesales = data.slice(start, end);
  }
}
