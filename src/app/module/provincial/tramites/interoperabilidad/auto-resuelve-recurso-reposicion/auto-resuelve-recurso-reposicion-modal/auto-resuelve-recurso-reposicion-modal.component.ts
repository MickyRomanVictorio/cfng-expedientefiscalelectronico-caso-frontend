import {NgForOf, NgIf} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {PaginatorComponent} from '@components/generales/paginator/paginator.component';
import {CapitalizePipe} from '@pipes/capitalize.pipe';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {SharedModule} from 'primeng/api';
import {DropdownChangeEvent, DropdownModule} from 'primeng/dropdown';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {ProgressBarModule} from 'primeng/progressbar';
import {TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {obtenerIcono} from '@utils/icon';
import {
  SujetosProcesalesPestanas
} from "@interfaces/reusables/sujeto-procesal/sujetos-procesales-pestanas.interface";
import {Subscription} from "rxjs";
import {obtenerCasoHtml} from '@utils/utils';
import {
  PestanaApelacionSujetoService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/pestana-apelacion-sujeto.service";

PestanaApelacionSujetoService

@Component({
  standalone: true,
  selector: 'app-auto-resuelve-recurso-reposicion-modal-modal',
  templateUrl: './auto-resuelve-recurso-reposicion-modal.component.html',
  styleUrls: ['./auto-resuelve-recurso-reposicion-modal.component.scss'],
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
  ],
})
export class AutoResuelveRecursoReposicionModalComponent implements OnInit {
  public tituloModal: SafeHtml | undefined = undefined;
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
  public sujetosProcesalesBackup: SujetosProcesalesPestanas[] = [];
  public disableButtonAceptarModalSujetoProcesal: boolean = false;
  protected readonly obtenerIcono = obtenerIcono;
  private idCaso: string = '';
  private idActoTramiteCaso: string = '';
  protected nuPestana: string = '';
  private subscriptions: Subscription[] = [];

  public sujetosProcesales: SujetosProcesalesPestanas[] = [];
  public sujetosProcesalesFiltrados: any[] = [];
  public sujetosProcesalesSeleccionados: SujetosProcesalesPestanas[] = [];
  public sujetosSeleccionados: SujetosProcesalesPestanas[] = [];
  protected soloLectura: boolean = false;
  protected mostrarBtnAceptar: Boolean = false;
  private selectedSujetos: any = [];
  protected listaRespuesta: { id: number; nombre: string }[] = [
    { id: 1485, nombre: 'Fundado' },
    { id: 1486, nombre: 'Infundado' }
  ];

  protected numeroCaso: string = '';
  protected tituloCaso: SafeHtml = '';
  protected selectAllCheck: Boolean = false;
  protected esApelacion: Boolean = false;
  protected esQueja: Boolean = false;
  protected nivelApelacion: String = ''; //proceso | sujeto
  protected nuApelacionFiscal: number = 0;

  constructor(
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private pestanaApelacionSujetoService: PestanaApelacionSujetoService,
    private sanitizador: DomSanitizer,
  ) {}

  ngOnInit(): void {

    this.idCaso = this.config.data?.idCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.numeroCaso = this.config.data?.numeroCaso;
    this.esApelacion = this.config.data?.esApelacion;
    this.esQueja = this.config.data?.esQueja;
    this.nuPestana = this.config.data?.nuPestana;
    this.nivelApelacion = this.numeroCaso.endsWith('0') ? 'proceso' : 'sujeto';

    this.tituloModal = `Seleccionar resultado del recurso de reposición`;
    this.tituloDelCaso();
    this.obtenerSujetosProcesales();
    this.disableButtonAceptarModalSujetoProcesal = true;

    if (this.config.data?.listSujetosProcesales && this.config.data?.listSujetosProcesales.length > 0) {
      setTimeout(() => {
        this.actualizarValoresSelection();
        this.verificarElementos();
      }, 100);
    }

    if (this.config.data?.soloLectura) {
      this.soloLectura = true;
    }

  }

  public cerrarModal(): void {
    this.dialogRef.close(this.sujetosProcesalesBackup);
  }

  cancelar() {
    this.dialogRef.close(this.sujetosProcesalesBackup);
  }

  aceptar() {
    const seleccionados = this.sujetosProcesalesFiltrados.filter(
      (sujeto) => sujeto.idTipoRespuestaInstancia2
    );
    this.selectedSujetos = seleccionados;
    this.dialogRef.close(this.selectedSujetos);
  }

  onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = this.sujetosProcesalesModal.slice(
      start,
      end
    );
  }

  actualizarPaginaRegistros(data: any) {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = data.slice(start, end);
  }

  private tituloDelCaso(): void {
    const subTituloHtml = `${this.numeroCaso.endsWith('0') ? 'Número Caso: ' : 'Incidente: '} ${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  private obtenerSujetosProcesales(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.pestanaApelacionSujetoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 1)
        .subscribe({
          next: (resp) => {
            this.sujetosProcesales = resp
              .map((sujeto: any) => ({...sujeto, sujetoSelected: false}))
              .map((sujeto: any) => {
                if (sujeto.selection !== null || sujeto.tipoRespuesta !== 0) {
                  sujeto.sujetoSelected = true;
                }
                return sujeto;
              });

            this.nuApelacionFiscal = this.sujetosProcesales.filter(
              (sujeto: any) => sujeto.flApelacionFiscal === '1'
            ).length;

            this.sujetosProcesalesFiltrados = this.sujetosProcesales;
            this.sujetosProcesalesSeleccionados = [];
            this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
            this.itemPaginado.data.total = this.sujetosProcesales.length;
            this.actualizarPaginaRegistros(this.sujetosProcesales);

            if (this.sujetosProcesales && this.sujetosProcesales.length > 0 && this.config.data?.listSujetosProcesales.length > 0) {
              setTimeout(() => {
                this.actualizarValoresSelection();
                this.verificarElementos();
              }, 100);
            }
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  verificarElementos() {
    console.log('this.sujetosProcesalesFiltrados',this.sujetosProcesalesFiltrados);
    this.mostrarBtnAceptar = this.sujetosProcesalesFiltrados.some(
      (sujeto) => sujeto.idTipoRespuestaReposicion
    );
  }

  private actualizarValoresSelection(): void {
    if (!this.config.data?.listSujetosProcesales || this.config.data.listSujetosProcesales.length === 0) {
      console.error('La lista listSujetosProcesales está vacía o no es válida');
      return;
    }

    const tempMap = new Map<string, boolean>();
    this.config.data.listSujetosProcesales.forEach((sujeto: any) => {
      tempMap.set(sujeto.idSujetoCaso, sujeto.idTipoRespuestaReposicion);
    });

    const sujetosActualizados = this.sujetosProcesalesFiltrados.map((sujeto) => {
      if (tempMap.has(sujeto.idSujetoCaso)) {
        const idTipoRespuestaReposicion = tempMap.get(sujeto.idSujetoCaso);
        sujeto.idTipoRespuestaReposicion = idTipoRespuestaReposicion !== undefined ? idTipoRespuestaReposicion : sujeto.idTipoRespuestaReposicion;
      }
      return sujeto;
    });

    this.sujetosProcesalesFiltrados = sujetosActualizados;
    this.selectedSujetos = [...sujetosActualizados];
    this.sujetosProcesalesBackup = this.config.data.listSujetosProcesales;
  }

  onSelectionChange(item: any, drop: DropdownChangeEvent): void {
    item.idTipoRespuestaInstancia2 = drop.value;
    this.selectAllCheck = this.sujetosProcesalesFiltrados.every(i => i.idTipoRespuestaReposicion);
    this.verificarElementos();
  }

}
