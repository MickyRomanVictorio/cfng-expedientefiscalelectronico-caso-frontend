import {NgIf} from '@angular/common';
import {Component, HostListener, inject, OnInit} from '@angular/core';
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
import {NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService,} from 'dist/ngx-cfng-core-modal/dialog';

@Component({
  standalone: true,
  selector: 'app-registrar-auto-desistimiento-apelacion-modal',
  templateUrl: './registrar-auto-desistimiento-apelacion-modal-modal.component.html',
  styleUrls: ['./registrar-auto-desistimiento-apelacion-modal-modal.component.scss'],
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
    NgxCfngCoreModalDialogModule
  ],
})
export class RegistrarAutoDesistimientoApelacionModalModalComponent implements OnInit {
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
  protected readonly obtenerIcono = obtenerIcono;
  protected idActoTramiteCaso: string = '';
  protected nuPestana: string = '';
  private subscriptions: Subscription[] = [];

  public sujetosProcesales: SujetosProcesalesPestanas[] = [];
  public sujetosProcesalesFiltrados: any[] = [];
  public sujetosSeleccionados: SujetosProcesalesPestanas[] = [];
  protected soloLectura: boolean = false;
  protected mostrarBtnAceptar: Boolean = false;
  protected listaRespuesta: { id: number; nombre: string }[] = [
    { id: 1506, nombre: 'Fundado' },
    { id: 1504, nombre: 'Infundado' }
  ];

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
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

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    console.log('Escape presionado, devolviendo total de sujetos');
    event.preventDefault();
    event.stopPropagation();
    this.cancelar(); // Reutiliza el método cancelar existente
  }

  ngOnInit(): void {
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.numeroCaso = this.config.data?.numeroCaso;
    this.nuPestana = this.config.data?.nuPestana;
    this.soloLectura = this.config.data?.soloLectura;

    this.nivelApelacion = this.numeroCaso.endsWith('0') ? 'proceso' : 'sujeto';
    this.tituloModal = `Seleccionar resultado del recurso de desistimiento`;
    this.tituloDelCaso();
    this.obtenerSujetosProcesales();
  }

  private tituloDelCaso(): void {
    const subTituloHtml = `${this.numeroCaso.endsWith('0') ? 'Número Caso: ' : 'Incidente: '} ${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  /** PAGINADO **/

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

  /** EVENTOS **/

  onSelectionChange(item: any, drop: DropdownChangeEvent): void {
    item.idTipoRespuestaInstancia2 = drop.value;
    this.selectAllCheck = this.sujetosProcesalesFiltrados.every(i => i.idTipoRespuestaInstancia2);
    this.verificarElementos();
  }

  getTotalSujetosSeleccionados(){
    return this.sujetosProcesalesFiltrados
      .filter(sujeto => sujeto.idTipoRespuestaDesistimiento != null && sujeto.idTipoRespuestaDesistimiento > 0)
      .length;
  }

  verificarElementos() {
    this.mostrarBtnAceptar = this.sujetosProcesalesFiltrados.some(
      (sujeto) => sujeto.idTipoRespuestaDesistimiento
    );
  }

  /** SALIDA DE MODAL **/

  cancelar() {
    this.dialogRef.close(this.getTotalSujetosSeleccionados());
  }

  aceptar() {
    this.subscriptions.push(
      this.pestanaApelacionSujetoService
        .registrarSujetosProcesales(this.idActoTramiteCaso, 'idTipoRespuestaDesistimiento', this.sujetosProcesalesFiltrados)
        .subscribe({
          error: e => this.modalDialogService.error('ERROR EN EL SERVICIO', e.error.message, 'Aceptar')
        })
    );
    this.dialogRef.close(this.getTotalSujetosSeleccionados());
  }

  /** LLAMADA A DATOS **/

  private obtenerSujetosProcesales(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.pestanaApelacionSujetoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 1)
        .subscribe({
          next: (resp) => {
            this.sujetosProcesales = this.sujetosProcesalesFiltrados = resp;

            this.nuApelacionFiscal = this.sujetosProcesales.filter(
              (sujeto: any) => sujeto.flApelacionFiscal === '1'
            ).length;

            this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
            this.itemPaginado.data.total = this.sujetosProcesales.length;
            this.actualizarPaginaRegistros(this.sujetosProcesales);

            if (this.sujetosProcesales && this.sujetosProcesales.length > 0) {
              setTimeout(() => {
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

}
