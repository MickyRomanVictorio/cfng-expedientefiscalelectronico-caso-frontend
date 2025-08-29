import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { SharedModule } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import {Subscription} from "rxjs";
import { IconUtil, StringUtil, UNIDAD_MEDIDA, ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import {NombrePropioPipe} from "@pipes/nombre-propio.pipe";
import {RES_1ERA_INSTANCIA} from "ngx-cfng-core-lib";
import { BadgeModule } from 'primeng/badge';
import { ResultadoProlongacionPrisionPreventivaInterface } from '@interfaces/reusables/prolongacion-prision-preventiva/ProlongacionPrisionPreventivaRequest';
import {
  ProlongacionPrisionPreventivaService
} from '@services/reusables/efe/prolongacion-prision-preventiva/prolongacion-prision-preventiva.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { convertStringToDate } from '@utils/date';

@Component({
  selector: 'app-seleccionar-sujeto-procesal',
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
    NombrePropioPipe,
    BadgeModule
  ],
  templateUrl: './seleccionar-sujeto-procesal.component.html',
  styleUrl: './seleccionar-sujeto-procesal.component.scss'
})
export class SeleccionarSujetoProcesalComponent implements OnInit, OnDestroy {
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

  public resultadosPrisionPreventivaInit: ResultadoProlongacionPrisionPreventivaInterface[] = [];
  public resultadosPrisionPreventiva: ResultadoProlongacionPrisionPreventivaInterface[] = [];
  public resultadosPrisionPreventivaFiltrados: ResultadoProlongacionPrisionPreventivaInterface[] = [];
  private resultadosPrisionPreventivaSeleccionados: ResultadoProlongacionPrisionPreventivaInterface[] = [];
  private readonly subscriptions: Subscription[] = [];

  protected readonly idActoTramiteCaso: string = '';
  protected tramiteEnModoEdicion: boolean = false;

  protected numeroCaso: string = '';
  protected selectAllCheck: boolean = false;
  protected idEstadoTramite: number = 0;

  constructor(
    protected iconUtil: IconUtil,
    protected stringUtil: StringUtil,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private modalDialogService: NgxCfngCoreModalDialogService,
    private prolongacionPrisionPreventivaService: ProlongacionPrisionPreventivaService
  ) {
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

  get esFirmado(): boolean {
    return this.idEstadoTramite == ESTADO_REGISTRO.FIRMADO;
  }

  get subTitulo(): string {
    return`${this.numeroCaso.endsWith('0') ? 'Número Caso: ' : 'Incidente: '}`;
  }

  get habilitarBotonAceptar(): boolean {
    return this.resultadosPrisionPreventivaSeleccionados.length > 0
  }

  private obtenerSujetosProcesales(): void {
    this.resultadosPrisionPreventiva = [];
    this.subscriptions.push(
      this.prolongacionPrisionPreventivaService
        .obtenerResultadosPrisionPreventiva(this.idActoTramiteCaso).subscribe({
        next: resp => {
          this.resultadosPrisionPreventiva = resp.filter(r => !r.reoAusenteContumaz &&
            (r.idTipoResultado == RES_1ERA_INSTANCIA.FUNDADO || r.idTipoResultado == RES_1ERA_INSTANCIA.FUNDADO_PARTE));
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

  onSelectionChange(event: Event, item: ResultadoProlongacionPrisionPreventivaInterface): void {
    const checkbox = event.target as HTMLInputElement;
    item.flProlongado = checkbox.checked;

    this.selectAllCheck = this.resultadosPrisionPreventivaFiltrados.every(i => i.flProlongado);
    this.verificarElementos();
  }

  verificaSeleccionado(resultado: ResultadoProlongacionPrisionPreventivaInterface): boolean {
    return resultado.flProlongado;
  }

  seleccionarTodos(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.selectAllCheck = checkbox.checked;
    this.resultadosPrisionPreventiva.forEach(r => r.flProlongado = this.selectAllCheck);
    this.verificarElementos();
  }

  cargarElementosInit() {
    this.resultadosPrisionPreventiva
      .filter(r => !r.flProlongado)
      .forEach(r => {
        r.flProlongado = this.resultadosPrisionPreventivaInit.some(i => i.idActoTramiteResultadoSujeto == r.idActoTramiteResultadoSujeto && i.flProlongado);
      })
    this.selectAllCheck = this.resultadosPrisionPreventiva.every(i => i.flProlongado);
  }

  verificarElementos() {
    this.resultadosPrisionPreventivaSeleccionados = this.resultadosPrisionPreventiva.filter(r => r.flProlongado);
  }

  protected plazoVencido(fechaFin: string | null): boolean {
    if (!fechaFin) return false;
    const fechaDate = convertStringToDate(fechaFin, 'DD/MM/YYYY');
    const fechaActual = new Date();
    return !!fechaDate && fechaDate < fechaActual;
  }

  protected textoPlazoOtorgado(resultado: ResultadoProlongacionPrisionPreventivaInterface): string {
    const esDia = resultado.idUnidadMedida === UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS;
    const singular = esDia ? 'día' : 'mes';
    const plural = resultado.unidadMedida.toLocaleLowerCase();
    const unidad = resultado.plazoOtorgado === 1 ? singular : plural;
    return `${resultado.plazoOtorgado} ${unidad}`;
  }
}
