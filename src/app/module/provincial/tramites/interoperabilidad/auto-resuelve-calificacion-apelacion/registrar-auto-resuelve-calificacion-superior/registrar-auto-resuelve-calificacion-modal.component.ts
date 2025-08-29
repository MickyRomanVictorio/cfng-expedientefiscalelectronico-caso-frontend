import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { SujetosProcesalesPestanas } from '@interfaces/reusables/sujeto-procesal/sujetos-procesales-pestanas.interface';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { ResolucionAutoResuelveRequerimientoService } from '@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { Message, SharedModule } from 'primeng/api';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { concatMap, Subscription } from 'rxjs';
import { MessagesModule } from 'primeng/messages';
import { NombrePropioPipe } from '@pipes/nombre-propio.pipe';
import { PestanaApelacionSujetoService } from '@services/provincial/tramites/interoperabilidad/resolucion-auto/pestana-apelacion-sujeto.service';
import {
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
  CfeDialogRespuesta
} from 'dist/ngx-cfng-core-modal/dialog';
import { Combo } from '@interfaces/comunes/combo';
import { ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';
import { ID_N_RSP_APELACION } from '@core/types/efe/provincial/tramites/especial/respuesta-apelacion.type';
import { SujetoApelanteIncoacion } from '@interfaces/provincial/tramites/fundado-procedente/sujeto-apelante';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { ApelacionRequest } from '@interfaces/provincial/tramites/fundado-procedente/apelacion';
import { ID_N_TIPO_APELACION_SUJETO } from '@core/types/efe/provincial/tramites/especial/tipo-apelacion-sujeto.type';
import { GenericResponse, GenericResponseModel } from '@interfaces/comunes/GenericResponse';
import {
  ApelacionesResultadosService
} from '@services/provincial/tramites/especiales/registrar-resultado-audiencia/fundada-procedente/apelaciones-resultados.service';
import {
  ApelacionFiscalia,
  ApelacionProcesoInmediato
} from '@interfaces/provincial/tramites/fundado-procedente/apelacion-fiscalia';
import { PaginacionInterface } from '@interfaces/comunes/paginacion.interface';

@Component({
  standalone: true,
  selector: 'app-registrar-auto-resuelve-calificacion-modal',
  templateUrl: './registrar-auto-resuelve-calificacion-modal.component.html',
  styleUrls: ['./registrar-auto-resuelve-calificacion-modal.component.scss'],
  imports: [
    CmpLibModule,
    ProgressBarModule,
    PaginatorComponent,
    CapitalizePipe,
    SharedModule,
    TableModule,
    DropdownModule,
    FormsModule,
    MessagesModule,
    NombrePropioPipe,
    NgxCfngCoreModalDialogModule,
    ReactiveFormsModule,
  ],
})
export class RegistrarAutoResuelveCalificacionModalComponent implements OnInit, OnDestroy {
  @Output() cambioValidaciones = new EventEmitter<any>();
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
  protected readonly obtenerIcono = obtenerIcono;
  private idCaso: string = '';
  protected idEstadoTramite: number = 0;
  protected idActoTramiteCaso: string = '';
  protected nuPestana: string = '';
  private readonly subscriptions: Subscription[] = [];

  //TODO validación temporal con uso de id de acto para saber si son a nivel de sujeto
  private idsSujeto: string[] = ['000172'];
  protected formApelacionFiscalia: FormGroup;
  protected formApelacionProceso: FormGroup;
  public sujetosProcesalesModal: any[] = [];
  public sujetosProcesalesBackup: SujetosProcesalesPestanas[] = [];
  public disableButtonAceptarModalSujetoProcesal: boolean = false;
  public sujetosProcesales: SujetosProcesalesPestanas[] = [];
  public sujetosProcesalesFiltrados: any[] = [];
  public sujetosProcesalesSeleccionados: SujetosProcesalesPestanas[] = [];
  public sujetosSeleccionados: SujetosProcesalesPestanas[] = [];
  protected listaSujetosApelantes: SujetoApelanteIncoacion[] = [];
  protected listaResultadoApelaciones: Combo[] = [];
  protected listaApelacionFiscalia: Combo[] = [];
  protected apelacionFiscalia!: ApelacionProcesoInmediato;
  protected soloLectura: boolean = false;
  protected mostrarBtnAceptar: boolean = false;
  private selectedSujetos: any = [];
  protected listaRespuesta: { id: number; nombre: string }[] = [
    { id: 1062, nombre: 'Concede apelación' },
    { id: 1024, nombre: 'Deniega apelación' },
    { id: 1061, nombre: 'Consentido' },
  ];

  protected numeroCaso: string = '';
  protected tituloCaso: SafeHtml = '';
  protected selectAllCheck: boolean = false;
  protected esApelacion: boolean = false;
  protected esQueja: boolean = false;
  protected nivelApelacion: string = ''; //proceso | sujeto
  protected nuApelacionFiscal: number = 0;
  protected msgs1: Message[] = [
    {
      severity: 'warn',
      summary: '',
      detail:
        'Los sujetos procesales a quienes se registra con resultado de la apelación "Concede apelación", serán gestionados en una nueva pestaña en la sección de "Apelaciones".',
      icon: 'pi-info-circle',
    },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly sanitizador: DomSanitizer,
    private readonly dialogRef: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private readonly tramiteService: TramiteService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly apelacionesResultadosService: ApelacionesResultadosService,
    private readonly pestanaApelacionSujetoService: PestanaApelacionSujetoService,
    private readonly resolucionAutoResuelveRequerimientoService: ResolucionAutoResuelveRequerimientoService,
  ) {

    this.formApelacionFiscalia = this.fb.group({
      resultadoApelacion: [null, [Validators.required]],
    });
    this.formApelacionProceso = this.fb.group({
      sujetoApelo: ['', [Validators.required]],
      resultadoApelacion: ['', [Validators.required]],
      idTipoParteSujeto: [null, [Validators.required]],
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

    this.tituloModal = `Seleccionar resultado de la calificación de la apelación`;
    this.tituloDelCaso();
    this.obtenerSujetosProcesales(false);
    this.iniciarValores();
    this.listarApelantes();
    if (!this.esSujeto) {
      this.obtenerApelacionFiscalia();
    }

    this.disableButtonAceptarModalSujetoProcesal = true;

    if (this.config.data?.listSujetosProcesales &&
      this.config.data?.listSujetosProcesales.length > 0) {
      setTimeout(() => {
        this.actualizarValoresSelection();
        this.verificarElementos();
      }, 100);
    }

    if (this.config.data?.soloLectura) {
      this.soloLectura = true;
      this.formApelacionFiscalia.disable();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected get idActo(): string {
    return this.tramiteService.validacionTramite.idActoSeleccionado;
  }

  protected get esSujeto(): boolean {
    return this.nivelApelacion === 'sujeto' || this.idsSujeto.includes(this.idActo);
  }

  protected get apelacionInvalida(): boolean {
    return this.formApelacionProceso.invalid;
  }

  protected get descripcionResultado(): string {
    return this.apelacionFiscalia.descripcionResultado ?? '';
  }

  protected get modoLectura(): boolean {
    return this.tramiteEnModoVisor || this.tramiteEstadoFirmadoRecibido;
  }

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }

  protected get idActoSeleccionado(): string {
    return this.tramiteService.validacionTramite.idActoSeleccionado;
  }

  protected apeloAudiencia(idActoTramiteCasoResultado: string): boolean {
    return this.idActoSeleccionado !== idActoTramiteCasoResultado;
  }

  get tramiteEstadoFirmadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO || this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  getTotalSujetosSeleccionados() {
    return this.sujetosProcesalesFiltrados.filter(
      (sujeto) =>
        ((this.esSujeto && sujeto.idTipoRespuestaApelacion != null && sujeto.idTipoRespuestaApelacion > 0) ||
        (!this.esSujeto && sujeto.idTipoRespuestaPE != null && sujeto.idTipoRespuestaPE > 0))
        &&
        (sujeto.idActoTramiteCasoGuardado == null ||
          sujeto.idActoTramiteCasoGuardado == this.idActoTramiteCaso)
    ).length;
  }

  getTotalSujetosConsentido() {
    return this.sujetosProcesalesFiltrados.filter(
      (sujeto) =>
        ((this.esSujeto && sujeto.idTipoRespuestaApelacion != null && sujeto.idTipoRespuestaApelacion == 1062) ||
          (!this.esSujeto && sujeto.idTipoRespuestaPE != null && sujeto.idTipoRespuestaPE == 1062)) &&
        (sujeto.idActoTramiteCasoGuardado == null ||
          sujeto.idActoTramiteCasoGuardado == this.idActoTramiteCaso)
    ).length;
  }

  private tituloDelCaso(): void {
    const subTituloHtml = `${
      this.numeroCaso.endsWith('0') ? 'Número de caso: ' : 'Incidente: '
    } ${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  private iniciarValores(): void {
    this.listaApelacionFiscalia = this.listaResultadoApelaciones = [
      {
        id: ID_N_RSP_APELACION.CONCEDE,
        nombre: 'CONCEDE APELACIÓN',
      },
      {
        id: ID_N_RSP_APELACION.DENIEGA,
        nombre: 'DENIEGA APELACIÓN',
      },
      {
        id: ID_N_RSP_APELACION.CONSENTIDO,
        nombre: 'CONSENTIDO',
      },
    ];
    this.msgs1[0].detail =  !this.esSujeto ?
      'Los sujetos procesales a quienes se registra con respuesta de recurso de apelación "Concede apelación", serán gestionado en una nueva pestaña en la sección de "Apelaciones".' :
      'Los sujetos procesales a quienes se registra con resultado de la apelación "Concede apelación", serán gestionados en una nueva pestaña en la sección de "Apelaciones".';
  }

  private listarApelantes(): void {
    this.subscriptions.push(
      this.apelacionesResultadosService.listarApelantes(this.idCaso).subscribe({
        next: (resp) => {
          this.listaSujetosApelantes = resp.data;
        },
      })
    );
  }

  private obtenerApelacionFiscalia(): void {
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerProcesoInmediato(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: ApelacionProcesoInmediato) => {
            this.apelacionFiscalia = resp;
            this.formApelacionFiscalia.get('resultadoApelacion')?.setValue(resp.idRspInstancia);
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

  protected seleccionarApelante(): void {
    const sujeto = this.listaSujetosApelantes.find(
      (s) =>
        s.idSujetoCaso === this.formApelacionProceso.get('sujetoApelo')?.value
    );
    this.formApelacionProceso.get('idTipoParteSujeto')?.setValue(sujeto?.idTipoParteSujeto);
  }

  protected onChangeResultadoApelacionFiscalia(): void {
    let data = this.formApelacionFiscalia.getRawValue();

    if (data.resultadoApelacion !== null) {
      let request: ApelacionFiscalia = {
        idActoTramiteCaso: this.apelacionFiscalia.idActoTramiteCaso,
        idRspInstancia: data.resultadoApelacion
      };
      this.guardarResultadoApelacion(request);
    }
  }

  guardarResultadoApelacion(request: ApelacionFiscalia) {
    this.subscriptions.push(
      this.apelacionesResultadosService
        .registrarApelacionDeLaFiscalia(request)
        .subscribe({
          next: (resp: GenericResponse) => {},
          error: () => {
            this.modalDialogService.error(
              'ERROR',
              'Error al intentar registrar la apelación de la fiscalía',
              'Aceptar'
            );
          },
        })
    );
  }

  protected guardarApelacionProcesoInmediato(): void {
    const form = this.formApelacionProceso.getRawValue();
    const request: ApelacionRequest = {
      idTipoApelacion: ID_N_TIPO_APELACION_SUJETO.PROCESO_INMEDIATO,
      idActoTramiteCaso: this.idActoTramiteCaso,
      idSujetoCaso: form.sujetoApelo,
      idRspInstancia: form.resultadoApelacion,
      idTipoParteSujeto: form.idTipoParteSujeto
    };
    this.selectedSujetos = [{
      idSujetoCaso: form.sujetoApelo,
      idTipoParteSujeto: form.idTipoParteSujeto,
      idActoTramiteResultadoSujeto: null,
      idTipoRespuestaApelacion: form.resultadoApelacion
    }];
    this.subscriptions.push(
      this.apelacionesResultadosService.registrarApelacion(request)
        .pipe(concatMap(() => this.pestanaApelacionSujetoService
          .registrarSujetosProcesales(
            this.idActoTramiteCaso,
            'idTipoRespuestaApelacion',
            this.selectedSujetos
          )))
        .subscribe({
        next: (resp: GenericResponse) => {
          this.formApelacionProceso.reset();
          this.modalDialogService.success('ÉXITO', 'Apelación registrada', 'Aceptar');
          this.obtenerSujetosProcesales(true);
        },
        error: () => {
          this.modalDialogService.error(
            'ERROR',
            'Error al intentar registrar la apelación de la fiscalía al proceso inmediato',
            'Aceptar'
          );
        },
      })
    );
  }

  private obtenerSujetosProcesales(emitir: boolean): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 1)
        .subscribe({
          next: (resp) => {
            this.sujetosProcesales = resp
              .filter((sujeto: any) => (!this.esSujeto && sujeto.idTipoRespuestaPE) || this.esSujeto)
              .map((sujeto: any) => ({ ...sujeto, sujetoSelected: false }))
              .map((sujeto: any) => {
                if (sujeto.selection !== null || sujeto.tipoRespuesta !== 0) {
                  sujeto.sujetoSelected = true;
                }
                return sujeto;
              })
              .sort((a: any, b: any) => {
                // 1. Priorizar por flApelacionFiscal = '1'
                if (
                  a.flApelacionFiscal === '1' &&
                  b.flApelacionFiscal !== '1'
                ) {
                  return -1; // 'a' va antes que 'b'
                }
                if (
                  a.flApelacionFiscal !== '1' &&
                  b.flApelacionFiscal === '1'
                ) {
                  return 1; // 'b' va antes que 'a'
                }
                // Priorizar por idTipoRespuestaInstancia1 = 1048
                if (
                  a.idTipoRespuestaInstancia1 === 1048 &&
                  b.idTipoRespuestaInstancia1 !== 1048
                ) {
                  return -1; // 'a' va antes que 'b'
                }
                if (
                  a.idTipoRespuestaInstancia1 !== 1048 &&
                  b.idTipoRespuestaInstancia1 === 1048
                ) {
                  return 1; // 'b' va antes que 'a'
                }

                // Dentro de los que tienen idTipoRespuestaInstancia1 = 1048, priorizar por idActoTramiteCasoGuardado
                if (
                  a.idTipoRespuestaInstancia1 === 1048 &&
                  b.idTipoRespuestaInstancia1 === 1048
                ) {
                  const aHasCondition =
                    a.idActoTramiteCasoGuardado == null ||
                    (a.idActoTramiteCasoGuardado !== null &&
                      a.idActoTramiteCasoGuardado == this.idActoTramiteCaso);
                  const bHasCondition =
                    b.idActoTramiteCasoGuardado == null ||
                    (b.idActoTramiteCasoGuardado !== null &&
                      b.idActoTramiteCasoGuardado == this.idActoTramiteCaso);

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
              (sujeto: any) => sujeto.flApelacionFiscal === '1'
            ).length;

            this.sujetosProcesalesFiltrados = this.sujetosProcesales;
            this.sujetosProcesalesSeleccionados = [];
            this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
            this.itemPaginado.data.total = this.sujetosProcesales.length;
            this.actualizarPaginaRegistros(this.sujetosProcesales);
            emitir && this.onListaCambio();
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
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  private actualizarPaginaRegistros(data: any): void {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = data.slice(start, end);
  }

  private actualizarValoresSelection(): void {
    if (
      !this.config.data?.listSujetosProcesales ||
      this.config.data.listSujetosProcesales.length === 0
    ) {
      return;
    }

    const tempMap = new Map<string, boolean>();
    const tempMap2 = new Map<string, boolean>();
    this.config.data.listSujetosProcesales.forEach((sujeto: any) => {
      tempMap.set(sujeto.idSujetoCaso, sujeto.idTipoRespuestaApelacion);
      tempMap2.set(sujeto.idSujetoCaso, sujeto.selection);
    });

    const sujetosActualizados = this.sujetosProcesalesFiltrados.map(
      (sujeto) => {
        if (tempMap.has(sujeto.idSujetoCaso)) {
          const idTipoRespuestaApelacion = tempMap.get(sujeto.idSujetoCaso);
          sujeto.idTipoRespuestaApelacion =
            idTipoRespuestaApelacion !== undefined
              ? idTipoRespuestaApelacion
              : sujeto.idTipoRespuestaApelacion;
          sujeto.selection = tempMap2.get(sujeto.idSujetoCaso);
        }
        return sujeto;
      }
    );

    this.sujetosProcesalesFiltrados = sujetosActualizados;
    this.selectedSujetos = [...sujetosActualizados];
    this.sujetosProcesalesBackup = this.config.data.listSujetosProcesales;
  }

  private verificarElementos(): void {
    this.mostrarBtnAceptar = this.sujetosProcesalesFiltrados.some(
      (sujeto) => sujeto.selection
    );
  }

  private onListaCambio() {
    if (this.config.data.emitirValidaciones) {
      this.config.data.emitirValidaciones({
        flCheckModal: this.getTotalSujetosSeleccionados() > 0,
        flElevacionSuperior: this.getTotalSujetosConsentido() > 0,
      });
    }
  }

  protected onSelectionChange(item: any, drop: DropdownChangeEvent): void {
    item.idTipoRespuestaApelacion = drop.value;
    item.selection = true;
    this.verificarElementos();
  }

  protected confirmarEliminarResultado(idApelacionResultado: string, idActoTramiteCasoResultado: string): void {
    if (this.apeloAudiencia(idActoTramiteCasoResultado) || this.soloLectura) return;
    const dialog = this.modalDialogService.warning(
      'QUITAR REGISTRO',
      `¿Está seguro de quitar de la lista el registro de quién apeló?`,
      'Aceptar',
      true,
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.eliminarResultado(idApelacionResultado, idActoTramiteCasoResultado);
        }
      },
    });
  }

  protected eliminarResultado(idApelacionResultado: string, idActoTramiteCasoResultado: string): void {
    if (this.apeloAudiencia(idActoTramiteCasoResultado)) return;
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService.eliminarApelacionResultado(idApelacionResultado).subscribe({
        next: resp => {
          this.modalDialogService.success('ÉXITO', 'Se quitó correctamente el registro de la lista', 'Aceptar');
          this.obtenerSujetosProcesales(true);
        },
        error: () => {
          this.modalDialogService.error(
            'ERROR',
            'Error al intentar eliminar la apelación de la fiscalía al proceso inmediato',
            'Aceptar'
          );
        },
      })
    );
  }

  protected onPaginate(evento: PaginacionInterface): void {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems(evento.data);
  }

  private updatePagedItems(data: any): void {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = data.slice(start, end);
  }

  protected cancelar(): void {
    this.dialogRef
      .close
      // flCheckModal: this.getTotalSujetosSeleccionados() > 0,
      //  flElevacionSuperior: this.getTotalSujetosConsentido() > 0,
      ();
  }

  protected aceptar(): void {
    const seleccionados = this.sujetosProcesalesFiltrados.filter(
      (sujeto) => sujeto.idTipoRespuestaApelacion && sujeto.selection
    );
    this.selectedSujetos = seleccionados;

    this.subscriptions.push(
      this.pestanaApelacionSujetoService
        .registrarSujetosProcesales(
          this.idActoTramiteCaso,
          'idTipoRespuestaApelacion',
          this.selectedSujetos
        )
        .subscribe({
          next: () => {
            this.dialogRef.close({
              flCheckModal: this.getTotalSujetosSeleccionados() > 0,
              flElevacionSuperior: this.getTotalSujetosConsentido() > 0,
            });
          },
          error: (error) => {
            this.modalDialogService.error(
              'ERROR EN EL SERVICIO',
              error.error.message,
              'Aceptar'
            );
          },
        })
    );
  }
}
