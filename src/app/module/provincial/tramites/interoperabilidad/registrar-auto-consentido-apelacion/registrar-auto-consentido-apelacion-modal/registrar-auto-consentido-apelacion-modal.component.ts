import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
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
import {SujetosProcesales} from "@interfaces/reusables/sujeto-procesal/sujetos-procesales.interface";
import {Subscription} from "rxjs";
import {
  ResolucionAutoResuelveRequerimientoService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service";
import { obtenerCasoHtml } from '@utils/utils';
import {NombrePropioPipe} from "@pipes/nombre-propio.pipe";
import { ApelacionProcesoInmediato } from '@interfaces/provincial/tramites/fundado-procedente/apelacion-fiscalia';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';

@Component({
  standalone: true,
  selector: 'app-seleccionar-consentido-apelacion-queja',
  templateUrl: './registrar-auto-consentido-apelacion-modal.component.html',
  styleUrls: ['./registrar-auto-consentido-apelacion-modal.component.scss'],
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
        NgxCfngCoreModalDialogModule,
    ],
})
export class RegistrarAutoConsentidoApelacionModalComponent implements OnInit, OnDestroy {
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
  private idActoTramiteCaso:  string = '';
  private readonly subscriptions: Subscription[] = [];

  public sujetosProcesales: SujetosProcesales[] = [];
  public sujetosProcesalesFiltrados: SujetosProcesales[] = [];
  public sujetosProcesalesSeleccionados: SujetosProcesales[] = [];
  public sujetosSeleccionados: SujetosProcesales[] = [];
  protected apelacionFiscalia!: ApelacionProcesoInmediato;
  protected soloLectura: boolean = false;
  protected mostrarBtnAceptar: boolean = false;
  private selectedSujetos: any = [];
  protected numeroCaso: string = '';
  protected tituloCaso: SafeHtml = '';
  protected selectAllCheck: boolean = false;
  protected esApelacion: boolean = false;
  protected esQueja: boolean = false;
  protected nombreTramite: string = '';
  protected nivelApelacion: string = ''; //proceso | sujeto
  protected nuApelacionFiscal: number = 0;


  constructor(
    private readonly sanitizador: DomSanitizer,
    private readonly dialogRef: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly resolucionAutoResuelveRequerimientoService: ResolucionAutoResuelveRequerimientoService,
  ) {}

  ngOnInit(): void {
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.numeroCaso = this.config.data?.numeroCaso;
    this.esApelacion = this.config.data?.esApelacion;
    this.esQueja = this.config.data?.esQueja;
    this.nombreTramite = this.esApelacion ? 'apelacion' : this.esQueja ? 'queja' : '';
    this.nivelApelacion = this.numeroCaso.endsWith('0') ? 'proceso' : 'sujeto';

    this.tituloModal = `Seleccionar consentimiento de la apelación`;
    this.tituloDelCaso();
    this.obtenerSujetosProcesales();
    if (!this.esSujeto) {
      this.obtenerApelacionFiscalia();
    }
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

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected get esSujeto(): boolean {
    return this.nivelApelacion === 'sujeto';
  }

  protected get descripcionResultado(): string {
    return this.apelacionFiscalia.descripcionResultado ?? '';
  }

  toggleAllSelection() {
    this.disableButtonAceptarModalSujetoProcesal = this.compareArrays(
      this.sujetosProcesalesModal,
      this.sujetosProcesalesBackup
    );
    /*this.sujetosProcesalesModal.forEach(
      (item) => (item.flagConsentimiento = this.selectAll)
    );*/
  }

  updateSelectAll() {
    this.disableButtonAceptarModalSujetoProcesal = this.compareArrays(
      this.sujetosProcesalesModal,
      this.sujetosProcesalesBackup
    );
    /*this.selectAll = this.sujetosProcesalesModal.every(
      (item) => item.flagConsentimiento
    );*/
  }

  private obtenerApelacionFiscalia(): void {
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerProcesoInmediato(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: ApelacionProcesoInmediato) => {
            this.apelacionFiscalia = resp;
          },
          error: () => {
            this.modalDialogService.error(
              'ERROR',
              'Error al intentar obtener la apelación de la fiscalía al proceso inmediato',
              'Aceptar'
            );
          },
        })
    );
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

  public esIgual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  public compareArrays(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
      if (!this.esIgual(arr1[i], arr2[i])) return false;
    }

    return true;
  }

  private tituloDelCaso(): void {
    const subTituloHtml = `${this.numeroCaso.endsWith('0') ? 'Número de caso: ' : 'Incidente: '} ${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  private obtenerSujetosProcesales(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 1)
        .subscribe({
          next: (resp) => {
            this.sujetosProcesales = this.ordenarDatos(resp)
              .filter((sujeto: any) => (!this.esSujeto && sujeto.idTipoRespuestaPE) || this.esSujeto)
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

  private actualizarValoresSelection(): void {
    if (!this.config.data?.listSujetosProcesales || this.config.data.listSujetosProcesales.length === 0) {
      return;
    }

    const tempMap = new Map<string, boolean>();
    this.config.data.listSujetosProcesales.forEach((sujeto: any) => {
      tempMap.set(sujeto.idSujetoCaso, sujeto.flConsentidoApelacion);
    });

    const sujetosActualizados = this.sujetosProcesalesFiltrados.map((sujeto) => {
      if (tempMap.has(sujeto.idSujetoCaso)) {
        const flConsentidoApelacion = tempMap.get(sujeto.idSujetoCaso);
        sujeto.flConsentidoApelacion = flConsentidoApelacion !== undefined ? flConsentidoApelacion : sujeto.flConsentidoApelacion;
      }
      return sujeto;
    });

    this.sujetosProcesalesFiltrados = sujetosActualizados;
    this.selectedSujetos = [...sujetosActualizados];
    this.sujetosProcesalesBackup = this.config.data.listSujetosProcesales;
  }

  verificarElementos() {
    const seleccionados = this.sujetosProcesalesFiltrados.filter(
      (sujeto) => sujeto.flConsentidoApelacion
    );

    this.mostrarBtnAceptar = seleccionados.some(
      (p: any) => p.flConsentidoApelacion === true
    );
  }


  onSelectionChange(item: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    item.flConsentidoApelacion = checkbox.checked;

    this.selectAllCheck = this.sujetosProcesalesFiltrados.every(i => i.flConsentidoApelacion);

    this.verificarElementos()
  }

  seleccionarTodos(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.selectAllCheck = checkbox.checked;

    this.sujetosProcesalesFiltrados.forEach(item => {
      if((item.flConsentidoApelacion + '') !== '1')
        item.flConsentidoApelacion = this.selectAllCheck;
    });

    this.verificarElementos()
  }

  protected cerrarModal(): void {
    this.dialogRef.close(this.sujetosProcesalesBackup);
  }

  protected cancelar() {
    this.dialogRef.close(this.sujetosProcesalesBackup);
  }

  protected aceptar() {
    const seleccionados = this.sujetosProcesalesFiltrados.filter(
      (sujeto) => sujeto.flConsentidoApelacion
    );
    this.selectedSujetos = seleccionados;
    this.dialogRef.close(this.selectedSujetos);
  }

  ordenarDatos = (datos: any[]) =>
    datos.sort((a, b) =>
      (a.idTipoRespuestaApelacion === 1024 ? 0 : 1) - (b.idTipoRespuestaApelacion === 1024 ? 0 : 1) ||
      (a.nombreCompleto || "").localeCompare(b.nombreCompleto || "")
    );

}
