import {NgIf} from '@angular/common';
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
import {SujetosProcesalesPestanas} from "@interfaces/reusables/sujeto-procesal/sujetos-procesales-pestanas.interface";
import {Subscription} from "rxjs";
import {obtenerCasoHtml} from '@utils/utils';
import {
  PestanaApelacionSujetoService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/pestana-apelacion-sujeto.service";
import {NombrePropioPipe} from "@pipes/nombre-propio.pipe";

@Component({
  standalone: true,
  selector: 'app-registrar-auto-resuelve-auto-superior-modal',
  templateUrl: './registrar-auto-resuelve-auto-modal.component.html',
  styleUrls: ['./registrar-auto-resuelve-auto-modal.component.scss'],
  imports: [
    CmpLibModule,
    NgIf,
    ProgressBarModule,
    PaginatorComponent,
    CapitalizePipe,
    SharedModule,
    TableModule,
    DropdownModule,
    FormsModule,
    NombrePropioPipe,
  ],
})
export class RegistrarAutoResuelveAutoModalComponent implements OnInit {
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
  private subscriptions: Subscription[] = [];

  public sujetosProcesales: SujetosProcesalesPestanas[] = [];
  public sujetosProcesalesFiltrados: any[] = [];
  public sujetosProcesalesSeleccionados: SujetosProcesalesPestanas[] = [];
  public sujetosSeleccionados: SujetosProcesalesPestanas[] = [];
  protected soloLectura: boolean = false;
  protected mostrarBtnAceptar: Boolean = false;
  private selectedSujetos: any = [];
  protected listaRespuesta: { id: number; nombre: string }[] = [
    { id: 1, nombre: 'Anula' },
    { id: 2, nombre: 'Confirma' },
    { id: 3, nombre: 'Revoca' }
  ];

  protected numeroCaso: string = '';
  protected tituloCaso: SafeHtml = '';
  protected selectAllCheck: Boolean = false;
  protected esApelacion: Boolean = false;
  protected esQueja: Boolean = false;
  protected nombreTramite: String = '';
  protected nivelApelacion: String = ''; //proceso | sujeto
  protected nuApelacionFiscal: number = 0;
  protected tituloPestania: String = '';
  protected numeroPestania :String = '';

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
    this.numeroPestania = this.config.data?.numeroPestania;
    this.esApelacion = this.config.data?.esApelacion;
    this.esQueja = this.config.data?.esQueja;
    this.nombreTramite = this.esApelacion ? 'apelacion' : this.esQueja ? 'queja' : '';
    this.nivelApelacion = this.numeroCaso.endsWith('0') ? 'proceso' : 'sujeto';

    this.tituloModal = `Seleccionar resultado de la resolución ${this.nombreTramite}`;
    this.tituloPestania = `Pestaña de apelación N°${this.numeroPestania}`;
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
      (sujeto) => sujeto.idTipoRespuestaResolucionInstancia2
    );
    this.selectedSujetos = seleccionados;
    this.dialogRef.close(this.selectedSujetos);
    console.log('this.selectedSujetos',this.selectedSujetos);
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
            console.log("resp",resp);
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
    this.mostrarBtnAceptar = this.sujetosProcesalesFiltrados.some(
      (sujeto) => sujeto.idTipoRespuestaResolucionInstancia2
    );
  }

  private actualizarValoresSelection(): void {
    if (!this.config.data?.listSujetosProcesales || this.config.data.listSujetosProcesales.length === 0) {
      console.error('La lista listSujetosProcesales está vacía o no es válida');
      return;
    }

    const tempMap = new Map<string, boolean>();
    this.config.data.listSujetosProcesales.forEach((sujeto: any) => {
      tempMap.set(sujeto.idSujetoCaso, sujeto.idTipoRespuestaResolucionInstancia2);
    });

    const sujetosActualizados = this.sujetosProcesalesFiltrados.map((sujeto) => {
      if (tempMap.has(sujeto.idSujetoCaso)) {
        const idTipoRespuestaResolucionInstancia2 = tempMap.get(sujeto.idSujetoCaso);
        sujeto.idTipoRespuestaResolucionInstancia2 = idTipoRespuestaResolucionInstancia2 !== undefined ? idTipoRespuestaResolucionInstancia2 : sujeto.idTipoRespuestaResolucionInstancia2;
      }
      return sujeto;
    });

    this.sujetosProcesalesFiltrados = sujetosActualizados;
    this.selectedSujetos = [...sujetosActualizados];
    this.sujetosProcesalesBackup = this.config.data.listSujetosProcesales;
  }

  onSelectionChange(item: any, drop: DropdownChangeEvent): void {
    item.idTipoRespuestaResolucionInstancia2 = drop.value;
    this.selectAllCheck = this.sujetosProcesalesFiltrados.every(i => i.idTipoRespuestaResolucionInstancia2);
    this.verificarElementos();
  }

}
