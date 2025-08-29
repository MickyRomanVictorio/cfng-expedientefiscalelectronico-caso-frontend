import { JsonPipe, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { RespuestaRecursoApelacionEnum } from '@modules/provincial/tramites/cuaderno-incidental/respuesta-recurso-apelacion.enum';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { AutoResuelveCalificacionApelacionService } from '@services/provincial/cuadernos-incidentales/auto-resuelve-calificacion-apelacion/auto-resuelve-calificacion-apelacion.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { SharedModule } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-resultado-calificacion-apelacion',
  standalone: true,
  templateUrl: './resultado-calificacion-apelacion.component.html',
  imports: [
    CmpLibModule,
    NgIf,
    ProgressBarModule,
    PaginatorComponent,
    CapitalizePipe,
    NgForOf,
    SharedModule,
    TableModule,
    DropdownModule,
    FormsModule,
    JsonPipe,
  ],
})
export class ResultadoCalificacionApelacionComponent implements OnInit {
  private idCaso: string = '';
  protected numeroCaso: string = '';
  private idActoTramiteCaso: string = '';
  protected subscriptions: Subscription[] = [];
  protected tituloModal: SafeHtml | undefined = undefined;
  protected query: any = { limit: 6, page: 1, where: {} };
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  protected respuestasApelacion: any[] = [];
  protected sujetosProcesales: any[] = [];
  protected sujetosProcesalesFiltrados: any[] = [];
  private sujetosProcesalesSeleccionados: any[] = [];
  private sujetosProcesalesSeleccionadosAux: any[] = [];

  protected disableButtonAceptarModalSujetoProcesal: boolean = true;


  protected idRespuesta: any = {
    id: 1050,
    nombre: 'CONCEDE APELACIÓN',
  };

  constructor(
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private autoResuelveCalificacionApelacionService: AutoResuelveCalificacionApelacionService
  ) {}

  ngOnInit(): void {
    this.idCaso = this.config.data?.idCaso;
    this.numeroCaso = this.config.data?.numeroCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.sujetosProcesalesSeleccionados =
      this.config.data?.sujetosProcesalesSeleccionados;
    this.sujetosProcesalesSeleccionadosAux = JSON.parse(
      JSON.stringify(this.sujetosProcesalesSeleccionados)
    );

    this.tituloModal =
      'Seleccionar resultado de la calificación de la apelación';
    this.getRespuestasApelacion();
    this.obtenerSujetosProcesales();
  }

  protected readonly obtenerIcono = obtenerIcono;


  private getRespuestasApelacion(): void {
    this.subscriptions.push(
      this.autoResuelveCalificacionApelacionService
        .listarRespuestasApelacion(this.idActoTramiteCaso)
        .subscribe({
          next: (data: any) => {
            this.respuestasApelacion = data;
          },
        })
    );
  }

  private obtenerSujetosProcesales(): void {
    this.subscriptions.push(
      this.autoResuelveCalificacionApelacionService
        .listarSujetosProcesales(this.idCaso, this.idActoTramiteCaso)
        .subscribe({
          next: (data: any) => {
            this.sujetosProcesales = data;
            this.asignarSujetosSeleccionados();
            this.sujetosProcesalesFiltrados = JSON.parse(
              JSON.stringify(this.sujetosProcesales)
            );

            this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
            this.itemPaginado.data.total = this.sujetosProcesales.length;
            this.validarBotonAceptarModalSujetoProcesal();
          },
        })
    );
  }

  protected eventoCambiarRespuesta(rowIndex: number, idRespuesta: number) {
    console.log(rowIndex, idRespuesta);
    this.validarBotonAceptarModalSujetoProcesal();

    this.agregarSujetosProcesalesSeleccionados({
      rowIndex: rowIndex,
      idRespuesta: idRespuesta,
    });
  }

  private getShowListaFiscaliasSuperior() {
    return this.sujetosProcesalesFiltrados.some(
      (e) => e.idRespuesta == RespuestaRecursoApelacionEnum.CONCEDE_APELACION
    );
  }

  private validarBotonAceptarModalSujetoProcesal() {
    this.disableButtonAceptarModalSujetoProcesal =
      !this.sujetosProcesalesFiltrados.some((e) => e.idRespuesta > 0);
  }

  protected eventoCancelarModalSujetoProcesal() {
    this.dialogRef.close({
      sujetosProcesales: this.sujetosProcesales,
      resultadoValidado: !this.disableButtonAceptarModalSujetoProcesal,
      showListaFiscaliasSuperior: this.getShowListaFiscaliasSuperior(),
      sujetosProcesalesSeleccionados: this.sujetosProcesalesSeleccionados,
    });
  }

  protected eventoAceptarModalSujetoProcesal() {
    this.asignarSujetosSeleccionados();
    this.dialogRef.close({
      sujetosProcesales: this.sujetosProcesales,
      resultadoValidado: !this.disableButtonAceptarModalSujetoProcesal,
      showListaFiscaliasSuperior: this.getShowListaFiscaliasSuperior(),
      sujetosProcesalesSeleccionados: this.sujetosProcesalesSeleccionados,
    });
  }

  private asignarSujetosSeleccionados() {
    if (
      this.sujetosProcesalesSeleccionadosAux &&
      this.sujetosProcesalesSeleccionadosAux.length > 0
    ) {
      this.sujetosProcesales.forEach((item, index) => {
        const selectedItem = this.sujetosProcesalesSeleccionadosAux.find(
          (item) => item.rowIndex === index
        );
        if (selectedItem) item.idRespuesta = selectedItem.idRespuesta;
      });
      this.sujetosProcesalesSeleccionados = JSON.parse(
        JSON.stringify(this.sujetosProcesalesSeleccionadosAux)
      );
    }

  }

  private agregarSujetosProcesalesSeleccionados(data: any) {
    var existeIndex = this.sujetosProcesalesSeleccionadosAux.findIndex(
      (e) => e.rowIndex == data.rowIndex
    );
    if (existeIndex > -1) {
      this.sujetosProcesalesSeleccionadosAux[existeIndex] = data;
    } else {
      this.sujetosProcesalesSeleccionadosAux.push(data);
    }
  }

  verLogs() {
    console.log('this.sujetosProcesales: ', this.sujetosProcesales);
    console.log(
      'this.sujetosProcesalesFiltrados: ',
      this.sujetosProcesalesFiltrados
    );
    console.log(
      'this.sujetosProcesalesSeleccionados: ',
      this.sujetosProcesalesSeleccionados
    );
  }

  protected onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  private updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = this.sujetosProcesales.slice(start, end);
  }
}
