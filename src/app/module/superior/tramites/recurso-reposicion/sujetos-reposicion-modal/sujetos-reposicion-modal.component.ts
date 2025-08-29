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
import {NombrePropioPipe} from "@pipes/nombre-propio.pipe";

@Component({
  standalone: true,
  templateUrl: './sujetos-reposicion-modal.component.html',
  styleUrls: ['./sujetos-reposicion-modal.component.scss'],
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
export class SujetosReposicionModalComponent implements OnInit {
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
  protected nuApelacionFiscal: number = 0;

  constructor(
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private sanitizador: DomSanitizer,
    protected tramiteService: TramiteService
  ) {}

  ngOnInit(): void {
    this.numeroCaso = this.config.data?.numeroCaso;
    this.tituloModal = 'Seleccionar recurso de reposición';
    this.tituloDelCaso();
    this.obtenerSujetosProcesales();
    this.disableButtonAceptarModalSujetoProcesal = true;

    if (this.config.data?.soloLectura) {
      this.soloLectura = true;
    }
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
    this.sujetosProcesales = this.config.data?.listSujetosProcesales
      .map((sujeto: any) => ({ ...sujeto, sujetoSelected: false }))
      .map((sujeto: any) => {
        if (sujeto.selection !== null || sujeto.tipoRespuesta !== 0) {
          sujeto.sujetoSelected = true;
         // sujeto.flReposicion = '1';
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

    this.mostrarBtnAceptar = this.sujetosProcesalesFiltrados.some(
      (sujeto) =>
        sujeto.flReposicion == '1' 
    );
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
    this.config.data.listSujetosProcesales.forEach((sujeto: any) => {
      tempMap.set(sujeto.idSujetoCaso, sujeto.flReposicion);
    });

    const sujetosActualizados = this.sujetosProcesalesFiltrados.map(
      (sujeto) => {
        if (tempMap.has(sujeto.idSujetoCaso)) {
          const flReposicion = tempMap.get(sujeto.idSujetoCaso);
          sujeto.flReposicion =
          flReposicion !== undefined ? flReposicion : sujeto.flReposicion;
        }
        return sujeto;
      }
    );

    this.sujetosProcesalesFiltrados = sujetosActualizados;
    this.sujetosProcesalesBackup = this.config.data.listSujetosProcesales;
  }

  onSelectionChange(item: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    item.flReposicion = checkbox.checked ? '1' : '0';
  
    this.selectAllCheck = this.sujetosProcesalesFiltrados.every(
      (i) => i.flReposicion === '1'
    );

    this.verificarElementos();
  }

  seleccionarTodos(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.selectAllCheck = checkbox.checked;

    this.sujetosProcesalesFiltrados.forEach((item) => {
      item.flReposicion = this.selectAllCheck ? '1' : '0';
 
    });

    this.verificarElementos();
  }

}
