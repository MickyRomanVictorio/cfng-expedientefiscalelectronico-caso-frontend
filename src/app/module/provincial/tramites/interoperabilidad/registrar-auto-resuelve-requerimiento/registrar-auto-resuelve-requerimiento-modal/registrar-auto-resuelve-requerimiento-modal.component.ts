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
import { ResolucionAutoResuelveRequerimientoService } from '@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service';
import { IconUtil, StringUtil } from 'ngx-cfng-core-lib';
import { PaginacionInterface } from '@interfaces/comunes/paginacion.interface';
import {GestionCasoService} from "@services/shared/gestion-caso.service";
import {ESTADO_REGISTRO} from "ngx-cfng-core-lib";
import {TramiteService} from "@services/provincial/tramites/tramite.service";

@Component({
  standalone: true,
  selector: 'app-resultado-resolucion-sujeto-procesal',
  templateUrl: './registrar-auto-resuelve-requerimiento-modal.component.html',
  styleUrls: ['./registrar-auto-resuelve-requerimiento-modal.component.scss'],
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
export class RegistrarAutoResuelveRequerimientoModalComponent implements OnInit {
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

  constructor(
    private readonly  dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly resolucionAutoResuelveRequerimientoService: ResolucionAutoResuelveRequerimientoService,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil
  ) {
    this.numeroCaso = this.config.data?.numeroCuadernoCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.sujetosProcesalesBackup = this.config.data?.listSujetosProcesales;
    this.soloLectura = this.config.data?.soloLectura;
    this.idEstadoTramite = this.config.data?.idEstadoTramite;
  }

  ngOnInit(): void {
    this.obtenerSujetosProcesales();
  }

  get habilitarBotonAceptar(): boolean {
    return this.selectedSujetos.length > 0
  }

  private obtenerSujetosProcesales(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 0)
        .subscribe({
          next: (resp) => {
            this.sujetosProcesales = resp
              .map((sujeto: any) => ({...sujeto, sujetoSelected: false}))
              .map((sujeto: any) => {
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
    this.dialogRef.close(this.sujetosProcesalesBackup);
  }

  protected aceptar(): void {
    this.dialogRef.close(this.selectedSujetos);
  }

  /** INTERACCION DE LOS CHECK Y RADIOS **/

  checkFundado: boolean = false;
  checkFundadoParte: boolean = false;
  checkInfundado: boolean = false;
  seleccionarTodosFundado(tipo: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (tipo === 'fundado') {
      this.checkFundado = isChecked;
      this.checkFundadoParte = false;
      this.checkInfundado = false;
    } else if (tipo === 'infundado') {
      this.checkInfundado = isChecked;
      this.checkFundado = false;
      this.checkFundadoParte = false;
    } else if (tipo === 'fundadoparte') {
      this.checkInfundado = false;
      this.checkFundado = false;
      this.checkFundadoParte = isChecked;
    }
    if (isChecked) {
      setTimeout(() => {
        this.sujetosProcesales.forEach((sujeto) => {
          if(!this.soloLectura && sujeto.idTipoRespuestaInstancia1 < 1)
            sujeto.selection = tipo;
        });
        this.verificarElementos()
      }, 0);
    } else {
      setTimeout(() => {
        this.sujetosProcesales.forEach((sujeto) => {
          if(!this.soloLectura && sujeto.idTipoRespuestaInstancia1 < 1)
            sujeto.selection = '';
        });
        this.verificarElementos()
      }, 0);
    }
  }

  onSelectionChange(sujeto: any, value: any): void {
    this.checkFundado = false;
    this.checkInfundado = false;
    this.checkFundadoParte = false;
    sujeto.selection = value;
    this.verificarElementos()
  }

  verificarElementos() {
    this.selectedSujetos = this.sujetosProcesales.filter(
      (sujeto) => sujeto.selection
    );

    this.mostrarMensaje = this.selectedSujetos.some(
      (p: any) => p.selection === 'infundado'
    );
  }

  verificaSeleccionado(sujeto: any, tipo: 'fundado' | 'fundadoparte' | 'infundado'): boolean {
    const tipoRespuestaMap = { 'fundado': 1047, 'fundadoparte': 1492, 'infundado': 1048 };
    const esSeleccionado = sujeto.selection === tipo || sujeto.idTipoRespuestaInstancia1 === tipoRespuestaMap[tipo];
    const esFirmadoORecibido = [ESTADO_REGISTRO.FIRMADO, ESTADO_REGISTRO.RECIBIDO].includes(this.idEstadoTramite);

    return esFirmadoORecibido
      ? this.idActoTramiteCaso === sujeto.idActoTramiteCasoGuardado && esSeleccionado
      : esSeleccionado;
  }

}
