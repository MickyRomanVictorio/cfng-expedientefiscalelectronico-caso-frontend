import { NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { SharedModule } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { obtenerIcono } from '@utils/icon';
import { SujetosProcesales } from '@interfaces/reusables/sujeto-procesal/sujetos-procesales.interface';
import { obtenerCasoHtml } from '@utils/utils';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { NombrePropioPipe } from '@pipes/nombre-propio.pipe';

@Component({
  standalone: true,
  templateUrl: './sujetos-apelacion-modal.component.html',
  styleUrls: ['./sujetos-apelacion-modal.component.scss'],
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
    NombrePropioPipe,
  ],
})
export class SujetosApelacionModalComponent implements OnInit {
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
  public sujetosProcesalesBackup: SujetosProcesales[] = [];
  public disableButtonAceptarModalSujetoProcesal: boolean = false;
  protected readonly obtenerIcono = obtenerIcono;

  public sujetosProcesales: SujetosProcesales[] = [];
  public sujetosProcesalesFiltrados: SujetosProcesales[] = [];
  public sujetosProcesalesSeleccionados: SujetosProcesales[] = [];
  public sujetosSeleccionados: SujetosProcesales[] = [];
  protected soloLectura: boolean = false;
  protected mostrarBtnAceptar: Boolean = false;
  protected numeroCaso: string = '';
  protected tituloCaso: SafeHtml = '';
  protected selectAllCheck: Boolean = false;
  protected activaPetitorio: boolean = false;
  protected listaRespuesta: { id: number; nombre: string }[] = [
    { id: 1502, nombre: 'Nulidad' },
    { id: 1503, nombre: 'Revoca' },
  ];
  constructor(
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private sanitizador: DomSanitizer,
    protected tramiteService: TramiteService
  ) {}

  ngOnInit(): void {
    this.numeroCaso = this.config.data?.numeroCaso;
    this.soloLectura = this.config.data?.soloLectura || false;
    this.tituloModal =
      (this.soloLectura ? 'Ver' : 'Seleccionar') +
      ' sujetos a registrar apelación';
    this.tituloDelCaso();
    this.obtenerSujetosProcesales();
    this.disableButtonAceptarModalSujetoProcesal = true;
  }

  public cerrarModal(): void {
    this.dialogRef.close({
      button: 'cancelar',
      data: this.sujetosProcesalesBackup,
    });
  }

  cancelar() {
    this.dialogRef.close({
      button: 'cancelar',
      data: this.sujetosProcesalesBackup,
    });
  }

  aceptar() {
    this.dialogRef.close({
      button: 'aceptar',
      data: this.sujetosProcesalesFiltrados,
    });
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
    const subTituloHtml = `${
      this.numeroCaso.endsWith('0') ? 'Número Caso: ' : 'Incidente: '
    } ${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  private obtenerSujetosProcesales(): void {
    this.sujetosProcesales = this.config.data?.listSujetosProcesales;
    this.sujetosProcesales = this.sujetosProcesales
      .map((sujeto: any) => ({ ...sujeto, sujetoSelected: false }))
      .sort((a: any, b: any) => {
        // Ordenar por idTipoRespuestaInstancia1: 1048 primero, luego 1492, y luego el resto
        const order = [1048, 1492];
        const indexA = order.indexOf(a.idTipoRespuestaInstancia1);
        const indexB = order.indexOf(b.idTipoRespuestaInstancia1);

        if (indexA === -1 && indexB === -1) {
          // Ambos no están en el orden prioritario, mantener el orden original
          return 0;
        }
        if (indexA === -1) {
          // Si 'a' no está en el orden prioritario, va después de 'b'
          return 1;
        }
        if (indexB === -1) {
          // Si 'b' no está en el orden prioritario, va después de 'a'
          return -1;
        }
        // Ambos están en el orden prioritario, comparar sus índices
        return indexA - indexB;
      });
    this.sujetosProcesalesFiltrados = this.sujetosProcesales;
    this.sujetosProcesalesSeleccionados = [];
    this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
    this.itemPaginado.data.total = this.sujetosProcesales.length;
    this.actualizarPaginaRegistros(this.sujetosProcesales);

    if (
      this.sujetosProcesales &&
      this.sujetosProcesales.length > 0 &&
      this.config.data?.listSujetosProcesales.length > 0
    ) {
      setTimeout(() => {
        this.actualizarValoresSelection();
        this.verificarElementos();
      }, 100);
    }
  }

  verificarElementos() {
    const ccc = this.sujetosProcesalesFiltrados.filter(
      (sujeto) => sujeto.flApelacion === '1'
    );
    if (ccc.length > 0) {
      this.mostrarBtnAceptar = ccc.every(
        (sujeto) => sujeto.idPetitorio && sujeto.idPetitorio !== 0
      );
      this.sujetosProcesalesFiltrados
        .filter((sujeto) => sujeto.flApelacion === '1')
        .every((sujeto) => sujeto.idPetitorio && sujeto.idPetitorio !== 0);
    } else {
      this.mostrarBtnAceptar = false;
    }
    if (this.soloLectura) {
      this.mostrarBtnAceptar = false;
    }
  }
  private actualizarValoresSelection(): void {
    if (
      !this.config.data?.listSujetosProcesales ||
      this.config.data.listSujetosProcesales.length === 0
    ) {
      console.error('La lista listSujetosProcesales está vacía o no es válida');
      return;
    }

    const tempMap = new Map<string, string>();
    const tempMapResultado = new Map<string, string>();
    this.config.data.listSujetosProcesales.forEach((sujeto: any) => {
      tempMap.set(sujeto.idSujetoCaso, sujeto.flApelacion);
      if (sujeto.idActoTramiteResultadoSujeto && sujeto.idActoTramiteResultadoSujeto !="") {
        tempMapResultado.set(
          sujeto.idActoTramiteResultadoSujeto,
          sujeto.flApelacion
        );
      }
    });

    const sujetosActualizados = this.sujetosProcesalesFiltrados.map(
      (sujeto) => {
        if (
          tempMapResultado.size > 0 &&
          tempMapResultado.has(sujeto.idActoTramiteResultadoSujeto)
        ) {
          const flApelacion = tempMapResultado.get(
            sujeto.idActoTramiteResultadoSujeto
          );
          sujeto.flApelacion =
            flApelacion !== undefined ? flApelacion : sujeto.flApelacion;
        } else {
          if (tempMap.has(sujeto.idSujetoCaso)) {
            const flApelacion = tempMap.get(sujeto.idSujetoCaso);
            sujeto.flApelacion =
              flApelacion !== undefined ? flApelacion : sujeto.flApelacion;
          }
        }

        return sujeto;
      }
    );

    this.sujetosProcesalesFiltrados = sujetosActualizados;
    this.sujetosProcesalesBackup = this.config.data.listSujetosProcesales;
  }

  onSelectionChange(item: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    item.flApelacion = checkbox.checked ? '1' : '0';
    this.activaPetitorio = checkbox.checked;
    if (!checkbox.checked) {
      item.idPetitorio = null;
    }
    this.selectAllCheck = this.sujetosProcesalesFiltrados.every(
      (i) => i.flApelacion === '1'
    );

    this.verificarElementos();
  }

  seleccionarTodos(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.selectAllCheck = checkbox.checked;

    this.sujetosProcesalesFiltrados
      .filter(
        (item) =>
          item.idTipoRespuestaInstancia1 == 1048 ||
          item.idTipoRespuestaInstancia1 == 1492
      )
      .forEach((item) => {
        item.flApelacion = this.selectAllCheck ? '1' : '0';
        if (!checkbox.checked) {
          item.idPetitorio = 0;
        }
      });

    this.verificarElementos();
  }
  onSelectionPetitorio(item: any, event: any): void {
  
    this.sujetosProcesalesFiltrados = this.sujetosProcesalesFiltrados.map(
      (sujeto) => {
        if (sujeto.idSujetoCaso === item.idSujetoCaso && 
          (!item.hasOwnProperty('idActoTramiteResultadoSujeto') || item.idActoTramiteResultadoSujeto === "" || sujeto.idActoTramiteResultadoSujeto === item.idActoTramiteResultadoSujeto)) {
          sujeto.idPetitorio = event.value ? item.idPetitorio : 0;
        }
        return sujeto;
      }
    );
    this.verificarElementos();
  }
}
