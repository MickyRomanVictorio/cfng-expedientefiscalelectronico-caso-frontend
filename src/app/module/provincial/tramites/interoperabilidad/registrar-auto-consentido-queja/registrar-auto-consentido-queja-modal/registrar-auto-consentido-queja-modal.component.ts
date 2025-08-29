import {NgIf} from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {PaginatorComponent} from '@components/generales/paginator/paginator.component';
import {CapitalizePipe} from '@pipes/capitalize.pipe';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {SharedModule} from 'primeng/api';
import {DropdownModule} from 'primeng/dropdown';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {ProgressBarModule} from 'primeng/progressbar';
import {TableModule} from 'primeng/table';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {obtenerIcono} from '@utils/icon';
import {SujetosProcesales} from "@interfaces/reusables/sujeto-procesal/sujetos-procesales.interface";
import {Subscription} from "rxjs";
import {
  ResolucionAutoResuelveRequerimientoService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service";
import {obtenerCasoHtml} from '@utils/utils';
import { NombrePropioPipe } from '@core/pipes/nombre-propio.pipe';
import { ApelacionProcesoInmediato } from '@interfaces/provincial/tramites/fundado-procedente/apelacion-fiscalia';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { Combo } from '@interfaces/comunes/combo';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { SujetosProcesalesPestanas } from '@interfaces/reusables/sujeto-procesal/sujetos-procesales-pestanas.interface';

@Component({
  standalone: true,
  selector: 'app-seleccionar-consentido-apelacion-queja',
  templateUrl: './registrar-auto-consentido-queja-modal.component.html',
  styleUrls: ['./registrar-auto-consentido-queja-modal.component.scss'],
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
    CheckboxModule,
    ReactiveFormsModule
  ],
})
export class RegistrarAutoConsentidoQuejaModalComponent implements OnInit, OnDestroy {
  public tituloModal: SafeHtml | undefined = undefined;
  public query: any = {limit: 10, page: 1, where: {}};
  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  protected formQuejaFiscalia: FormGroup;
  public sujetosProcesalesModal: any[] = [];
  public sujetosProcesalesBackup: SujetosProcesales[] = [];
  public disableButtonAceptarModalSujetoProcesal: boolean = false;
  protected readonly obtenerIcono = obtenerIcono;
  private idActoTramiteCaso: string = '';
  private readonly subscriptions: Subscription[] = [];

  public sujetosProcesales: SujetosProcesales[] = [];
  public sujetosProcesalesFiltrados: any[] = [];
  public sujetosProcesalesSeleccionados: SujetosProcesales[] = [];
  public sujetosSeleccionados: SujetosProcesales[] = [];
  protected listaQuejaFiscalia: Combo[] = [];
  protected apelacionFiscalia!: ApelacionProcesoInmediato;
  protected consentidaQuejaFiscal: boolean = false;
  protected soloLectura: boolean = false;
  protected mostrarBtnAceptar: boolean = false;
  private selectedSujetos: any = [];
  protected numeroCaso: string = '';
  protected tituloCaso: SafeHtml = '';
  protected nivelApelacion: string = ''; //proceso | sujeto
  protected nuApelacionFiscal: number = 0;


  constructor(
    private readonly fb: FormBuilder,
    public config: DynamicDialogConfig,
    private readonly sanitizador: DomSanitizer,
    private readonly dialogRef: DynamicDialogRef,
    private readonly tramiteService: TramiteService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly resolucionAutoResuelveRequerimientoService: ResolucionAutoResuelveRequerimientoService,
  ) {
    this.formQuejaFiscalia = this.fb.group({
      resultadoQueja: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.numeroCaso = this.config.data?.numeroCaso;
    this.nivelApelacion = this.numeroCaso.endsWith('0') ? 'proceso' : 'sujeto';
    this.tituloModal = `Seleccionar consentimiento de la queja`;
    this.tituloDelCaso();
    this.iniciarValores();
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

  protected get resultadoQueja(): string {
    if (!this.apelacionFiscalia || !this.listaQuejaFiscalia) return '';
    return this.listaQuejaFiscalia.find(q => q.id === this.apelacionFiscalia.idRspInstanciaQueja)?.nombre ?? '';
  }

  protected get descripcionResultado(): string {
    return this.apelacionFiscalia.descripcionResultado ?? '';
  }

  protected get fiscalQuejaAudiencia(): boolean {
    return this.apelacionFiscalia && this.apelacionFiscalia.flagRspQueja !== null;
  }

  protected get fiscalQuejaImprocedente(): boolean {
    return this.apelacionFiscalia
      && this.apelacionFiscalia.idRspInstanciaQueja !== null
      && this.apelacionFiscalia.idRspInstanciaQueja === 1060;
  }

  protected get idActoSeleccionado(): string {
    return this.tramiteService.validacionTramite.idActoSeleccionado;
  }

  private tituloDelCaso(): void {
    const subTituloHtml = `${this.numeroCaso.endsWith('0') ? 'Número de caso: ' : 'Incidente: '} ${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  private iniciarValores(): void {
    this.listaQuejaFiscalia = [
      { id: 1059, nombre: 'Procedente/Fundado queja' },
      { id: 1060, nombre: 'Improcedente/Infundado queja' },
      { id: 1049, nombre: 'Consentido' },
    ];
  }

  protected apeloAudiencia(idActoTramiteCasoResultado: string): boolean {
    return this.idActoSeleccionado !== idActoTramiteCasoResultado;
  }

  protected quejaAudiencia(flRspQueja: string): boolean {
    return flRspQueja !== null && flRspQueja === '1';
  }

  protected verCheckbox(item: SujetosProcesalesPestanas): boolean {
    return item.idTipoRespuestaQueja !== null && item.idTipoRespuestaQueja === 1060;
  }

  public esIgual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  private obtenerApelacionFiscalia(): void {
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerProcesoInmediato(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: ApelacionProcesoInmediato) => {
            this.apelacionFiscalia = resp;
            this.formQuejaFiscalia.get('resultadoQueja')?.setValue(resp.idRspInstanciaQueja);
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
                if (sujeto.flConsentidoQueja === '1') {
                  sujeto.isConsentidoQueja = true;
                }
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

  ordenarDatos = (datos: any[]) =>
    datos.sort((a, b) =>
      (a.idTipoRespuestaQueja === 1060 ? 0 : 1) - (b.idTipoRespuestaQueja === 1060 ? 0 : 1) ||
      (a.nombreCompleto || "").localeCompare(b.nombreCompleto || "")
    );

  private actualizarPaginaRegistros(data: any) {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = data.slice(start, end);
  }

  private actualizarValoresSelection(): void {
    if (!this.config.data?.listSujetosProcesales || this.config.data.listSujetosProcesales.length === 0) {
      return;
    }

    const tempMap = new Map<string, boolean>();
    this.config.data.listSujetosProcesales.forEach((sujeto: any) => {
      tempMap.set(sujeto.idSujetoCaso, sujeto.flConsentidoQueja);
    });

    const sujetosActualizados = this.sujetosProcesalesFiltrados.map((sujeto) => {
      if (tempMap.has(sujeto.idSujetoCaso)) {
        const flConsentidoQueja = tempMap.get(sujeto.idSujetoCaso);
        sujeto.flConsentidoQueja = flConsentidoQueja !== undefined ? flConsentidoQueja : sujeto.flConsentidoQueja;
      }
      return sujeto;
    });

    this.sujetosProcesalesFiltrados = sujetosActualizados;
    this.selectedSujetos = [...sujetosActualizados];
    this.sujetosProcesalesBackup = this.config.data.listSujetosProcesales;
  }

  private verificarElementos() {
    const seleccionados = this.sujetosProcesalesFiltrados.filter(
      (sujeto) => sujeto.flConsentidoQueja
    );

    this.mostrarBtnAceptar = seleccionados.some(
      (p: any) => p.isConsentidoQueja === true
    );
  }

  protected alSeleccionarQuejaFiscal(event: any): void {
    if (event.checked) {
      //TODO guardar consentido queja fiscal
    }
  }

  protected onSelectionChange(item: any, event: any): void {
    item.flConsentidoQueja = event.checked ? '1' : '0';
    item.isConsentidoQueja = event.checked;
    this.verificarElementos()
  }

  protected onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  private updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = this.sujetosProcesalesModal.slice(
      start,
      end
    );
  }

  protected aceptar() {
    const seleccionados = this.sujetosProcesalesFiltrados.filter(
      (sujeto) => sujeto.isConsentidoQueja
    );
    this.selectedSujetos = seleccionados;
    this.dialogRef.close(this.selectedSujetos);
  }

  protected cerrarModal(): void {
    this.dialogRef.close(this.sujetosProcesalesBackup);
  }

  protected cancelar() {
    this.dialogRef.close(this.sujetosProcesalesBackup);
  }

}
