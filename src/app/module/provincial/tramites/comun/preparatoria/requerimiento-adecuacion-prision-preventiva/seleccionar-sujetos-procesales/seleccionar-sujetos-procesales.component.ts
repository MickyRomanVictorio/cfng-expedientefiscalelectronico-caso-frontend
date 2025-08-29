import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { CmpLibModule } from 'dist/cmp-lib';
import { CapitalizePipe, IconUtil, StringUtil } from 'dist/ngx-cfng-core-lib';
import { SharedModule } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { Subscription } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { convertStringToDate } from '@core/utils/date';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { SujetoProcesalesAdecuacion } from '@core/interfaces/provincial/tramites/comun/preparatoria/requerimiento-adecuacion-prision-preventiva';
import { RequerimientoAdecuacionPrisionPreventivaService } from '@core/services/provincial/tramites/comun/preparatoria/requerimiento-adecuacion-prision-preventiva.service';

@Component({
  selector: 'app-seleccionar-sujetos-procesales',
  standalone: true,
  imports: [
    CmpLibModule,
    ProgressBarModule,
    PaginatorComponent,
    CapitalizePipe,
    SharedModule,
    TableModule,
    DropdownModule,
    FormsModule,
    BadgeModule
  ],
  templateUrl: './seleccionar-sujetos-procesales.component.html',
  styleUrl: './seleccionar-sujetos-procesales.component.scss'
})
export class SeleccionarSujetosProcesalesComponent implements OnInit, OnDestroy {

  private readonly subscriptions: Subscription[] = []

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  protected readonly requerimientoService = inject(RequerimientoAdecuacionPrisionPreventivaService)
  protected iconUtil = inject(IconUtil)
  protected stringUtil = inject(StringUtil)
  protected dialogRef = inject(DynamicDialogRef)
  protected config = inject(DynamicDialogConfig)

  public query: any = { limit: 10, page: 1, where: {} };
  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  public resultadosPrisionPreventivaInit: SujetoProcesalesAdecuacion[] = [];
  public resultadosPrisionPreventiva: SujetoProcesalesAdecuacion[] = [];
  public resultadosPrisionPreventivaFiltrados: SujetoProcesalesAdecuacion[] = [];
  private resultadosPrisionPreventivaSeleccionados: SujetoProcesalesAdecuacion[] = [];

  protected readonly idActoTramiteCaso: string = '';
  protected tramiteEnModoEdicion: boolean = false;

  protected numeroCaso: string = '';
  protected selectAllCheck: boolean = false;
  private idEstadoTramite: number = 0;

  constructor() {
    this.numeroCaso = this.config.data?.numeroCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.resultadosPrisionPreventivaInit = this.config.data?.listSujetosProcesales;
    this.tramiteEnModoEdicion = this.config.data?.tramiteEnModoEdicion;
    this.idEstadoTramite = this.config.data?.idEstadoTramite;
  }

  ngOnInit(): void {
    this.obtenerSujetosProcesales();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected cerrarModal(): void {
    this.dialogRef.close(this.resultadosPrisionPreventivaInit);
  }

  protected aceptar() {
    this.dialogRef.close(this.resultadosPrisionPreventivaSeleccionados);
  }

  protected onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage);
  }

  protected actualizarPaginaRegistros(data: any, reset: boolean) {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.resultadosPrisionPreventivaFiltrados = data.slice(start, end);
  }

  get subTitulo(): string {
    return `${this.numeroCaso.endsWith('0') ? 'Número Caso: ' : 'Incidente: '}`;
  }

  get habilitarBotonAceptar(): boolean {
    return this.resultadosPrisionPreventivaSeleccionados.length > 0
  }

  private obtenerSujetosProcesales(): void {
    this.resultadosPrisionPreventiva = [];
    this.subscriptions.push(
      this.requerimientoService
        .obtenerSujetosProcesalesAdecuacion(this.idActoTramiteCaso).subscribe({
          next: resp => {
            this.resultadosPrisionPreventiva = resp;
            this.itemPaginado.data.data = this.resultadosPrisionPreventiva;
            this.itemPaginado.data.total = this.resultadosPrisionPreventiva.length;
            this.actualizarPaginaRegistros(this.resultadosPrisionPreventiva, false);
            this.cargarElementosInit();
            this.verificarElementos();
          },
          error: (err) => {
            this.modalDialogService.error('Error', `Error en el servidor ${err.error.message}`, 'Aceptar');
          },
        })
    )
  }

  onSelectionChange(event: Event, item: SujetoProcesalesAdecuacion): void {
    const checkbox = event.target as HTMLInputElement;
    item.flAdecuacion = checkbox.checked;

    this.selectAllCheck = this.resultadosPrisionPreventivaFiltrados.every(i => i.flAdecuacion);
    this.verificarElementos();
  }

  verificaSeleccionado(resultado: SujetoProcesalesAdecuacion): boolean {
    return resultado.flAdecuacion;
  }

  seleccionarTodos(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.selectAllCheck = checkbox.checked;
    this.resultadosPrisionPreventiva.forEach(r => r.flAdecuacion = this.selectAllCheck);
    this.verificarElementos();
  }

  cargarElementosInit() {
    this.resultadosPrisionPreventiva
      .filter(r => !r.flAdecuacion)
      .forEach(r => {
        r.flAdecuacion = this.resultadosPrisionPreventivaInit.some(i => i.idActoTramiteResultadoSujeto == r.idActoTramiteResultadoSujeto && i.flAdecuacion);
      })
    this.selectAllCheck = this.resultadosPrisionPreventiva.every(i => i.flAdecuacion);
  }

  verificarElementos() {
    this.resultadosPrisionPreventivaSeleccionados = this.resultadosPrisionPreventiva.filter(r => r.flAdecuacion);
  }

  protected plazoVencido(fechaFin: string | null): boolean {
    if (!fechaFin) return false;
    const fechaDate = convertStringToDate(fechaFin, 'DD/MM/YYYY');
    const fechaActual = new Date();
    return !!fechaDate && fechaDate < fechaActual;
  }

  protected textoPlazoOtorgado(unidadMedida: String, plazo: number): string {
    const singular = unidadMedida === 'DIAS' ? 'día' : 'mes';
    const plural = unidadMedida.toLocaleLowerCase();
    const unidad = plazo === 1 ? singular : plural;
    return `${plazo} ${unidad}`;
  }
}
