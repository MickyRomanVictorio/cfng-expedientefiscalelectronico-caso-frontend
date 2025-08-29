import { Component, OnInit } from '@angular/core';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { SharedModule } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import {SujetosProcesales} from "@interfaces/reusables/sujeto-procesal/sujetos-procesales.interface";
import {Subscription} from "rxjs";
import { IconUtil, StringUtil } from 'dist/ngx-cfng-core-lib';
import {
  ResolucionAutoResuelveRequerimientoService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service";
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import {NombrePropioPipe} from "@pipes/nombre-propio.pipe";
import {ESTADO_REGISTRO} from "ngx-cfng-core-lib";

@Component({
  standalone: true,
  selector: 'app-seleccionar-consentido-resolucion',
  templateUrl: './seleccionar-consentido-resolucion.component.html',
  styleUrls: ['./seleccionar-consentido-resolucion.component.scss'],
    imports: [
        CmpLibModule,
        ProgressBarModule,
        PaginatorComponent,
        CapitalizePipe,
        SharedModule,
        TableModule,
        DropdownModule,
        FormsModule,
        NombrePropioPipe
    ],
})
export class SeleccionarConsentidoResolucionComponent implements OnInit {
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
  public sujetosProcesalesModal: any[] = [];
  public sujetosProcesalesBackup: SujetosProcesales[] = [];
  protected readonly idActoTramiteCaso: string = '';
  private readonly subscriptions: Subscription[] = [];

  public sujetosProcesales: SujetosProcesales[] = [];
  public sujetosProcesalesFiltrados: SujetosProcesales[] = [];
  public sujetosProcesalesSeleccionados: SujetosProcesales[] = [];
  public sujetosSeleccionados: SujetosProcesales[] = [];
  protected soloLectura: boolean = false;
  private selectedSujetos: any = [];
  protected numeroCaso: string = '';
  protected selectAllCheck: boolean = false;
  private idEstadoTramite: number = 0;

  constructor(
    private readonly dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly resolucionAutoResuelveRequerimientoService: ResolucionAutoResuelveRequerimientoService,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil
  ) {
    this.numeroCaso = this.config.data?.numeroCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.sujetosProcesalesBackup = this.config.data?.listSujetosProcesales;
    this.soloLectura = this.config.data?.soloLectura;
    this.idEstadoTramite = this.config.data?.idEstadoTramite;
  }

  ngOnInit(): void {
    this.obtenerSujetosProcesales();
  }

  protected cerrarModal(): void {
    this.dialogRef.close(this.sujetosProcesalesBackup);
  }

  protected aceptar() {
    this.dialogRef.close(this.selectedSujetos);
  }

  protected onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage);
  }

  protected actualizarPaginaRegistros(data: any, reset: boolean) {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = data.slice(start, end);
  }

  get subTitulo(): string {
    return`${this.numeroCaso.endsWith('0') ? 'Número Caso: ' : 'Incidente: '}`;
  }

  get habilitarBotonAceptar(): boolean {
    return this.selectedSujetos.length > 0
  }

  private obtenerSujetosProcesales(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 1)
        .subscribe({
          next: (resp) => {
            this.sujetosProcesales = resp
              .map((sujeto: any) => ({...sujeto, sujetoSelected: false}))
              .map((sujeto: any) => {
                let seleccionadosAnterior: SujetosProcesales[] = this.config.data?.listSujetosProcesales
                if (seleccionadosAnterior.length > 0) {
                  const encontrado = seleccionadosAnterior
                    .find((existe:any) => {
                      if (existe.idActoTramiteResultadoSujeto) {
                        return sujeto.idActoTramiteResultadoSujeto === existe.idActoTramiteResultadoSujeto;
                      } else {
                        return sujeto.idSujetoCaso === existe.idSujetoCaso;
                      }
                    });
                  if (encontrado) {
                    sujeto.flConsentidoInstancia1 = encontrado.flConsentidoInstancia1;
                  }
                }
                if (sujeto.selection !== null || sujeto.tipoRespuesta !== 0) {
                  sujeto.sujetoSelected = true;
                }
                return sujeto;
              });
            this.sujetosProcesalesFiltrados = this.sujetosProcesales;
            this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
            this.itemPaginado.data.total = this.sujetosProcesalesFiltrados.length;
            this.actualizarPaginaRegistros(this.sujetosProcesalesFiltrados, false);
            this.verificarElementos()
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  private normalizarValorConsentido(valor: any): boolean {
    if (typeof valor === 'string') {
      return valor === '1';
    }
    return !!valor;
  }

  verificaSeleccionado(sujeto: any): boolean {
    const esFirmadoORecibido = [ESTADO_REGISTRO.FIRMADO, ESTADO_REGISTRO.RECIBIDO].includes(this.idEstadoTramite);
    const esSeleccionado = this.normalizarValorConsentido(sujeto.flConsentidoInstancia1);

    if (esFirmadoORecibido) {
      return this.idActoTramiteCaso === sujeto.idActoTramiteCasoGuardado && esSeleccionado;
    }
    return esSeleccionado;
  }

  onSelectionChange(item: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    item.flConsentidoInstancia1 = checkbox.checked;

    this.selectAllCheck = this.sujetosProcesalesFiltrados.every(i => this.normalizarValorConsentido(i.flConsentidoInstancia1));

    this.verificarElementos();
  }

  seleccionarTodos(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.selectAllCheck = checkbox.checked;

    this.sujetosProcesales.forEach(item => {
      if ((item.idActoTramiteCasoGuardado === null || this.idActoTramiteCaso === item.idActoTramiteCasoGuardado)) {
        item.flConsentidoInstancia1 = this.selectAllCheck;
      }
    });

    this.verificarElementos();
  }

  verificarElementos() {
    this.selectedSujetos = this.sujetosProcesales.filter(
      (sujeto) => this.normalizarValorConsentido(sujeto.flConsentidoInstancia1)
    );
  }

}
