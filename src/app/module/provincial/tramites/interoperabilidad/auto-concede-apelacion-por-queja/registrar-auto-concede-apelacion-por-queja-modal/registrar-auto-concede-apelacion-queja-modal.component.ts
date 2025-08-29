import { NgForOf, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { SujetoQueja } from '@core/interfaces/provincial/tramites/comun/cuadernos-incidentales/queja-denegatoria-apelacion/sujeto-queja.interface';
import { AutoConcedeApelacionQuejaService } from '@core/services/provincial/cuadernos-incidentales/auto-concede-apelacion-queja/auto-concede-apelacion-queja.service';
import { TokenService } from '@core/services/shared/token.service';
import { SujetosProcesalesPestanas } from '@interfaces/reusables/sujeto-procesal/sujetos-procesales-pestanas.interface';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { ResolucionAutoResuelveRequerimientoService } from '@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml } from '@utils/utils';
import { ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { SharedModule } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ApelacionProcesoInmediato } from '@interfaces/provincial/tramites/fundado-procedente/apelacion-fiscalia';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { Combo } from '@interfaces/comunes/combo';
import { TramiteService } from '@services/provincial/tramites/tramite.service';

@Component({
  standalone: true,
  selector: 'app-registrar-auto-queja-denegatoria-modal',
  templateUrl: './registrar-auto-concede-apelacion-queja-modal.component.html',
  styleUrls: ['./registrar-auto-concede-apelacion-queja-modal.component.scss'],
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
    CheckboxModule,
    ReactiveFormsModule,
  ],
})
export class RegistrarAutoConcedeApelacionQuejaModalComponent implements OnInit, OnDestroy {
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

  protected formQuejaFiscalia: FormGroup;
  public sujetosProcesalesModal: any[] = [];
  public sujetosProcesalesBackup: SujetosProcesalesPestanas[] = [];
  public disableButtonAceptarModalSujetoProcesal: boolean = false;
  protected readonly obtenerIcono = obtenerIcono;
  private idCaso: string = '';
  protected idEstadoTramite: number = 0;
  private idActoTramiteCaso: string = '';
  protected nuPestana: string = '';
  private readonly subscriptions: Subscription[] = [];
  public sujetosProcesales: SujetosProcesalesPestanas[] = [];
  public sujetosProcesalesFiltrados: any[] = [];
  public sujetosProcesalesSeleccionados: SujetosProcesalesPestanas[] = [];
  protected listaQuejaFiscalia: Combo[] = [];
  protected apelacionFiscalia!: ApelacionProcesoInmediato;

  protected soloLectura: boolean = false;
  protected mostrarBtnAceptar: boolean = false;
  private selectedSujetos: any = [];
  protected listaRespuesta: { id: number; nombre: string }[] = [
    { id: 1059, nombre: 'Procedente/Fundado queja' },
    { id: 1060, nombre: 'Improcedente/Infundado queja' },
    { id: 1049, nombre: 'Consentido' },
  ];

  protected numeroCaso: string = '';
  protected tituloCaso: SafeHtml = '';
  protected selectAllCheck: boolean = false;
  protected esApelacion: boolean = false;
  protected esQueja: boolean = false;
  protected nivelApelacion: string = ''; //proceso | sujeto
  protected nuApelacionFiscal: number = 0;

  constructor(
    public config: DynamicDialogConfig,
    private readonly fb: FormBuilder,
    private tokenService: TokenService,
    private readonly sanitizador: DomSanitizer,
    private readonly dialogRef: DynamicDialogRef,
    private readonly tramiteService: TramiteService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly autoConcedeApelacionQuejaService: AutoConcedeApelacionQuejaService,
    private readonly resolucionAutoResuelveRequerimientoService: ResolucionAutoResuelveRequerimientoService,
  ) {
    this.formQuejaFiscalia = this.fb.group({
      resultadoQueja: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.idCaso = this.config.data?.idCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.idEstadoTramite = this.config.data?.idEstadoTramite;
    this.numeroCaso = this.config.data?.numeroCaso;
    this.esApelacion = this.config.data?.esApelacion;
    this.esQueja = this.config.data?.esQueja;
    this.nuPestana = this.config.data?.nuPestana;
    this.nivelApelacion = this.numeroCaso.endsWith('0') ? 'proceso' : 'sujeto';

    this.tituloModal = `Seleccionar resultado del auto que concede la apelación`;
    this.tituloDelCaso();
    this.iniciarValores();
    this.obtenerSujetosProcesales();
    if (!this.esSujeto) {
      this.obtenerApelacionFiscalia();
    }
    this.disableButtonAceptarModalSujetoProcesal = true;

    if (this.config.data?.soloLectura) {
      this.soloLectura = true;
    }
    this.inicializarSelecciones();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  protected get modoLectura(): boolean {
    return this.tramiteEnModoVisor || this.tramiteEstadoFirmadoRecibido;
  }

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }

  get tramiteEstadoFirmadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO || this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  private iniciarValores(): void {
    this.listaQuejaFiscalia = this.listaRespuesta = [
      { id: 1059, nombre: 'Procedente/Fundado queja' },
      { id: 1060, nombre: 'Improcedente/Infundado queja' },
      { id: 1049, nombre: 'Consentido' },
    ];
    this.formQuejaFiscalia.disable();
  }

  protected get fiscalQuejaAudiencia(): boolean {
    return this.apelacionFiscalia && this.apelacionFiscalia.flagRspQueja !== null;
  }

  protected get fiscalQuejaProcedente(): boolean {
    return this.apelacionFiscalia
      && this.apelacionFiscalia.idRspInstanciaQueja !== null
      && this.apelacionFiscalia.idRspInstanciaQueja === 1059;
  }

  protected get idActoSeleccionado(): string {
    return this.tramiteService.validacionTramite.idActoSeleccionado;
  }

  protected get esSujeto(): boolean {
    return this.nivelApelacion === 'sujeto';
  }

  protected get descripcionResultado(): string {
    return this.apelacionFiscalia.descripcionResultado ?? '';
  }

  protected esMiApelacion(sujeto: SujetoQueja): boolean {
    return (
      sujeto.usuarioApelacion === this.tokenService.getDecoded().usuario.usuario
    );
  }

  protected apeloAudiencia(idActoTramiteCasoResultado: string): boolean {
    return this.idActoSeleccionado !== idActoTramiteCasoResultado;
  }

  protected quejaAudiencia(flRspQueja: string): boolean {
    return flRspQueja !== null && flRspQueja === '1';
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

  aceptar() {
    const seleccionados = this.sujetosProcesalesFiltrados.filter(
      (sujeto) => sujeto.selection
    );
    this.selectedSujetos = seleccionados;
    this.eventoRegistrarSujetosProcesales();
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
    const subTituloHtml = `${this.numeroCaso.endsWith('0') ? 'Número de caso: ' : 'Incidente: '
      } ${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }
  protected esOtroTramiteGuardado(sujeto: SujetoQueja): boolean {
    if (sujeto.idActoTramiteCasoGuardado) {
      return (
        sujeto.idActoTramiteCasoGuardado !== this.idActoTramiteCaso && sujeto.flConcedeApelacion !== "0"
      );
    }
    return false;
  }
  protected esMismoTramite(sujeto: SujetoQueja): boolean {
    if (sujeto.idActoTramiteCasoGuardado) {
      return (
        sujeto.idActoTramiteCasoGuardado == this.idActoTramiteCaso
      );
    }
    return false;
  }
  private obtenerSujetosProcesales(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 1)
        .subscribe({
          next: (resp) => {
            this.sujetosProcesales = resp
              .filter((sujeto: any) => (!this.esSujeto && sujeto.idTipoRespuestaPE) || this.esSujeto)
              .map((sujeto: any) => ({ ...sujeto, flApelacionFiscal: sujeto.flApelacionFiscal === '1', sujetoSelected: false }))
              .map((sujeto: any) => {
                if (sujeto.flConcedeApelacion === '1') {
                  sujeto.isConcedeApelacion = true;
                }

                if (!this.esOtroTramiteGuardado(sujeto)) {
                  sujeto.sujetoSelected = true;
                }
                return sujeto;
              }).sort((a: any, b: any) => {
                const getPriority = (item: any) => {
                  if (item.idTipoRespuestaQueja === 1059 && item.flApelacionFiscal === true) return 1;
                  if (item.flApelacionFiscal === false && item.idTipoRespuestaQueja === 1059) return 2;
                  if (item.flApelacionFiscal === true && item.idTipoRespuestaQueja !== 1059) return 3;
                  return 4;
                };

                const priorityA = getPriority(a);
                const priorityB = getPriority(b);

                if (priorityA !== priorityB) {
                  return priorityA - priorityB;
                }
                // Mostrar primero los elementos con estadoQueja igual a null o 0

                // Ordenar por idTipoRespuestaInstancia1: 1048 primero, luego 1492, y luego el resto
                // const order = [1059, 1060];
                //  const indexA = order.indexOf(a.idTipoRespuestaQueja);
                //  const indexB = order.indexOf(b.idTipoRespuestaQueja);

                if (a.idTipoRespuestaQueja === 1059 && b.idTipoRespuestaQueja !== 1059) {
                  return -1; // 'a' va antes que 'b'
                }
                if (a.idTipoRespuestaQueja === 1060 && b.idTipoRespuestaQueja == 0) {
                  return -1; // 'a' va antes que 'b'
                }
                if (a.idTipoRespuestaQueja !== 1059 && b.idTipoRespuestaQueja === 1059) {
                  return 1; // 'b' va antes que 'a'
                }

                // Dentro de los que tienen idTipoRespuestaInstancia1 = 1024, priorizar por idActoTramiteCasoGuardado
                if (
                  a.idTipoRespuestaQueja === 1059 &&
                  b.idTipoRespuestaQueja === 1059
                ) {
                  const aHasCondition = (a.idActoTramiteCasoGuardado == null) ||
                    a.idActoTramiteCasoGuardado !== null &&
                    a.idActoTramiteCasoGuardado == this.idActoTramiteCaso;

                  const bHasCondition = (b.idActoTramiteCasoGuardado == null) ||
                    b.idActoTramiteCasoGuardado !== null &&
                    b.idActoTramiteCasoGuardado == this.idActoTramiteCaso;

                  if (aHasCondition && !bHasCondition) {
                    return -1; // 'a' va antes que 'b'
                  }
                  if (!aHasCondition && bHasCondition) {
                    return 1; // 'b' va antes que 'a'
                  }
                }

                // Si no cumplen las condiciones anteriores, mantener el orden original
                return 0;
              });
            this.nuApelacionFiscal = this.sujetosProcesales.filter(
              (sujeto: SujetoQueja) => sujeto.usuarioApelacion ===
                this.tokenService.getDecoded().usuario.usuario
            ).length;
            if (this.soloLectura && this.esSujeto) {
              this.sujetosProcesales = this.sujetosProcesales.filter((sujeto) => this.esMismoTramite(sujeto));
              this.nuApelacionFiscal = this.sujetosProcesales.length;
            }

            this.sujetosProcesalesFiltrados = this.sujetosProcesales;
            this.sujetosProcesalesSeleccionados = [];
            this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
            this.itemPaginado.data.total = this.sujetosProcesales.length;
            this.actualizarPaginaRegistros(this.sujetosProcesales);
            this.verificarElementos();
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }
  protected eventoRegistrarSujetosProcesales() {
    if (this.selectedSujetos.length === 0) {
      return;
    }
    const data: any = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      listSujetos: this.selectedSujetos,
    };
    this.subscriptions.push(
      this.autoConcedeApelacionQuejaService
        .registrarResolucion(data)
        .subscribe({
          next: (resp) => {
            if (resp.code === '0') {

              this.dialogRef.close({
                flCheckModal: this.getTotalSujetosSeleccionados() > 0,
              });
            }
          },
          error: (error) => {
            console.log(error);
          },
        })
    );

  }
  cancelar() {
    this.dialogRef.close();
  }

  getTotalSujetosSeleccionados() {
    return this.sujetosProcesalesFiltrados
      .filter(sujeto => sujeto.flConcedeApelacion != '0' && sujeto.isConcedeApelacion && (sujeto.idActoTramiteCasoGuardado == null || sujeto.idActoTramiteCasoGuardado == this.idActoTramiteCaso))
      .length;
  }

  onCheckboxChange(event: any, index: number) {
    this.sujetosProcesales[index].flConcedeApelacion = event.checked ? '1' : '0';
    this.sujetosProcesales[index].isConcedeApelacion = event.checked;
    this.sujetosProcesales[index].sujetoSelected = true;
    this.sujetosProcesales[index].selection = true;
    const totalSeleccionados = this.sujetosProcesalesFiltrados.filter(
      (sujeto) => sujeto.isConcedeApelacion
      // (sujeto) => sujeto.flConcedeApelacion == '1'
    ).length;
    const totalCheckbox = this.sujetosProcesales.length;
    this.todosSeleccionados = totalSeleccionados === totalCheckbox;
    this.verificarElementos();
  }

  sujetosSeleccionados: boolean[] = [];
  // Inicializa el array de selecciones
  todosSeleccionados: boolean = false;
  inicializarSelecciones() {
    this.sujetosSeleccionados = new Array(
      this.sujetosProcesalesFiltrados.length
    ).fill(false);
    this.todosSeleccionados = false;
  }
  toggleSeleccionarTodos(event: any) {
    this.sujetosProcesalesFiltrados = this.sujetosProcesalesFiltrados.map(
      (sujeto, index) => {
        sujeto.flConcedeApelacion = event.checked ? '1' : '0';
        sujeto.isConcedeApelacion = event.checked;
        sujeto.sujetoSelected = true;
        return sujeto;
      }
    );
    this.verificarElementos();
  }

  protected verCheckbox(sujeto: SujetosProcesalesPestanas): boolean {
    //if (sujeto) return false;
    return sujeto.idTipoRespuestaQueja === 1059; //&& sujeto.tieneApelacion === '1';
  }
  verificarElementos() {
    this.mostrarBtnAceptar = this.sujetosProcesales.some(
      (sujeto) => sujeto.selection
    );
  }

  public cerrarModal(): void {
    this.dialogRef.close();
  }

}
