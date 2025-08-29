import {Component, inject, OnInit} from '@angular/core';
import {PaginatorComponent} from '@components/generales/paginator/paginator.component';
import {DigitOnlyModule} from '@directives/digit-only.module';
import {SujetosProcesales} from '@interfaces/reusables/sujeto-procesal/sujetos-procesales.interface';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {Message, MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {MessagesModule} from 'primeng/messages';
import {ProgressBarModule} from 'primeng/progressbar';
import {RadioButtonModule} from 'primeng/radiobutton';
import {TableModule} from 'primeng/table';
import {Subscription} from 'rxjs';
import { IconUtil, StringUtil } from 'ngx-cfng-core-lib';
import { PaginacionInterface } from '@interfaces/comunes/paginacion.interface';
import {TramiteService} from "@services/provincial/tramites/tramite.service";
import { AutoSobreseimientoDefinitivoService } from '@core/services/provincial/tramites/comun/juzgamiento/auto-sobreseimiento-definitivo/auto-sobreseimiento.service';

@Component({
  standalone: true,
  selector: 'app-resultado-resolucion-sujeto-procesal-delitos',
  templateUrl: './disposicion-resuelve-retiro-acusacion-modal.component.html',
  styleUrls: ['./disposicion-resuelve-retiro-acusacion-modal.component.scss'],
  imports: [
    DropdownModule,
    InputTextareaModule,
    MessagesModule,
    InputTextModule,
    CmpLibModule,
    ButtonModule,
    InputNumberModule,
    DigitOnlyModule,
    ProgressBarModule,
    TableModule,
    PaginatorComponent,
    RadioButtonModule,
  ],
  providers: [MessageService],
})
export class DisposicionResuelveRetiroAcusacionModalComponent implements OnInit {
  protected query: any = {limit: 10, page: 1, where: {}};
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  protected msgs1: Message[] = [
    {
      severity: 'warn',
      summary: '',
      detail: 'Como fiscal, podrá registrar el escrito de recurso de apelación para los sujetos procesales cuyo resultado es "infundado".',
      icon: 'pi-info-circle',
    },
  ];
  protected mostrarMensaje: boolean = false;
  protected mostrarBtnAceptar: boolean = false;
  private readonly subscriptions: Subscription[] = [];
  protected numeroCaso: string = '';
  private readonly idActoTramiteCaso: string = '';
  public sujetosProcesales: SujetosProcesales[] = [];
  public sujetosProcesalesBackup: SujetosProcesales[] = [];
  public sujetosProcesalesFiltrados: SujetosProcesales[] = [];
  public sujetosProcesalesSeleccionados: SujetosProcesales[] = [];
  protected soloLectura: boolean = false;
  protected selectedSujetos: any = [];
  private readonly tramiteService = inject(TramiteService);
  private idEstadoTramite: number = 0;
  private idCaso: string = '';
  protected esRechazaParcial: boolean = false;
  protected resultadoPrimeraInstancia: string = '';
  constructor(
    private readonly  dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly autoSobreseimientoDefinitivoService: AutoSobreseimientoDefinitivoService,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil
  ) {
    this.numeroCaso = this.config.data?.numeroCuadernoCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.sujetosProcesalesBackup = this.config.data?.listSujetosProcesales;
    this.soloLectura = this.config.data?.soloLectura;
    this.idEstadoTramite = this.config.data?.idEstadoTramite;
    this.idCaso = this.config.data?.idCaso;
    this.esRechazaParcial = this.config.data?.esRechazaParcial || false;
  }

  ngOnInit(): void {
    this.obtenerSujetosProcesales();
    this.resultadoPrimeraInstancia = this.config.data?.esRechazaParcial? "Resultado Parcial por pluralidad de acusados" : "Resultado total por pluralidad de acusados";
  }

  get habilitarBotonAceptar(): boolean {
    return this.selectedSujetos.length > 0
  }

  private obtenerSujetosProcesales(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.autoSobreseimientoDefinitivoService
        .obternerListaSujetoDelitoDispo(this.idCaso, this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            console.log(resp);
            this.sujetosProcesales = resp
              .map((sujeto: any) => ({...sujeto, sujetoSelected: false}))
            /*   .map((sujeto: any) => {
                let seleccionadosAnterior: SujetosProcesales[] = this.config.data?.listSujetosProcesales
                if (seleccionadosAnterior.length > 0) {
                  const encontrado = seleccionadosAnterior.find((existe:any) => sujeto.idSujetoCaso === existe.idSujetoCaso);
                  if (encontrado) {
                    sujeto.selection = encontrado.selection;
                  }
                }
                if (sujeto.selection !== null || sujeto.idTipoRespuestaInstancia1 !== 0) {
                  sujeto.sujetoSelected = true;
                }
                return sujeto;
              }); */
            this.sujetosProcesalesFiltrados = this.sujetosProcesales;
            this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
            this.itemPaginado.data.total = this.sujetosProcesalesFiltrados.length;
            this.actualizarPaginaRegistros(this.sujetosProcesalesFiltrados, false);
          //  this.verificarElementos()
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  get getNumeroCaso(): string {
    return this.numeroCaso;
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage);
  }

  actualizarPaginaRegistros(data: any, reset: boolean) {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = data.slice(start, end);
  }

  protected cerrarModal(): void {
    this.dialogRef.close({modalValidado: null});
  }

  protected aceptar(): void {
    this.selectedSujetos = this.sujetosProcesales.filter(
      (sujeto) => sujeto.selection
    );
    this.eventoRegistrarSujetosProcesales();
    this.dialogRef.close({modalValidado: this.verificarTodosSeleccionados()});
  }

  /** INTERACCION DE LOS CHECK Y RADIOS **/

  checkRectifica: boolean = false;
  checkRatifica: boolean = false;
  seleccionarTodosFundado(tipo: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (tipo === 'rectifica') {
      this.checkRectifica = isChecked;
      this.checkRatifica = false;
    } else {
      this.checkRatifica = isChecked;
      this.checkRectifica = false;
    } 
      setTimeout(() => {
        this.sujetosProcesales.forEach((sujeto) => {
          if(!this.soloLectura)
            sujeto.selection = isChecked ? tipo : '';
          sujeto.flRatifica = tipo === 'ratifica' ? '1' : '0';
          sujeto.flRectifica = tipo === 'rectifica' ? '1' : '0';
        });
        this.verificarElementos()
      }, 0);
   
  }

  onSelectionChange(sujeto: any, value: any): void {
    this.checkRatifica = false;
    this.checkRectifica = false;
    sujeto.selection = value;
    if (value === 'ratifica') {
      sujeto.flRatifica = '1';
      sujeto.flRectifica = '0';
    } else {
        sujeto.flRectifica = '1';
        sujeto.flRatifica = '0';
    } 
    this.verificarElementos()
  }

  verificarElementos() {
    this.selectedSujetos = this.sujetosProcesales.filter(
      (sujeto) => sujeto.selection
    );
  }

  

  verificarTodosSeleccionados(): boolean {
    console.log("cerrado modal", this.sujetosProcesales);
    return this.sujetosProcesales.every(
      (sujeto) =>
      sujeto.selection &&  sujeto.selection !== '' 
    );
  }
 protected eventoRegistrarSujetosProcesales() {
    const data: any = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      listSujetos: this.selectedSujetos,
    };
console.log("data", data);
    this.subscriptions.push(
      this.autoSobreseimientoDefinitivoService
        .registrarDisposicion(data)
        .subscribe({
          next: (resp) => {
            if (resp.code === '0') {
              this.dialogRef.close({
                modalValidado: this.verificarTodosSeleccionados()
              });
            }
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }
}
