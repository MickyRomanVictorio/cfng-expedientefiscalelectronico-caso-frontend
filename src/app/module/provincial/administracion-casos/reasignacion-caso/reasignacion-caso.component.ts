import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AlertaData } from '@interfaces/comunes/alert';
import { CasosAsignados } from '@core/interfaces/comunes/casosAsignados';
import { ReasignarCasoRequest } from '@interfaces/provincial/administracion-casos/reasignacion-casos/reasignar-caso-request.interface';
import { ReasignacionService } from '@services/provincial/administracion-casos/reasignacion/reasignacion.service';
import { ExportarService } from '@services/shared/exportar.service';
import { MaestroService } from '@services/shared/maestro.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { AsignacionConsultasService } from '@services/provincial/asignacion/asignacion-consultas.service';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { DateMaskModule } from '@directives/date-mask.module';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { HistorialTramiteModalComponent } from '@components/modals/historial-tramite-modal/historial-tramite-modal.component';
import { FiltrarCasosPorReasignar } from '@interfaces/provincial/administracion-casos/reasignacion-casos/filtrar-casos-por-reasignar.interface';
import {
  FILTRO_TIEMPO,
  HEADER_REASIGNACION,
  LAPSO_TIEMPO,
  MENSAJE,
  MENSAJE_CONFIRM_RESASIGNACION,
  NOMBRE_ARCHIVO,
  SE_ASIGNO_CASO,
  SE_ASIGNO_CASOS,
  TAMANIO_ARCHIVO,
} from '@core/types/efe/provincial/administracion-casos/reasignacion/reasignacion-casos.type';
import { NumeroCasoComponent } from '@components/numero-caso/numero-caso.component';
import { PrevisualizarDocumentoComponent } from '@components/previsualizar-documento/previsualizar-documento.component';
import { VisorEfeModalComponent } from '@components/modals/visor-efe-modal/visor-efe-modal.component';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { ASIGNACION_TEMPORAL, DateFormatPipe } from 'ngx-cfng-core-lib';
import { delay, Subscription } from 'rxjs';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { StringUtil, IconUtil, IconAsset, FileUtil } from 'ngx-cfng-core-lib';
import { DialogModule } from 'primeng/dialog';
import { TokenService } from '@core/services/shared/token.service';
import { AlertaService } from '@services/shared/alerta.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    TableModule,
    DividerModule,
    RadioButtonModule,
    DateMaskModule,
    ToastModule,
    MenuModule,
    NumeroCasoComponent,
    PrevisualizarDocumentoComponent,
    PaginatorComponent,
    DateFormatPipe,
  ],
  selector: 'app-reasignacion-caso',
  templateUrl: './reasignacion-caso.component.html',
  providers: [MessageService, DialogService],
})
export class ReasignacionCasoComponent implements OnInit {
  @ViewChild('archivoEntrada') archivoEntrada?: ElementRef<HTMLInputElement>;

  public mostrarFechaReasignacionTemporal: boolean = true;
  public casosAsignados!: CasosAsignados[];
  public casosPorAsignarFiltrados: CasosAsignados[] = [];
  public casosSeleccionados: CasosAsignados[] = [];
  public casosSeleccionadosAcum: CasosAsignados[] = [];
  public formularioReasignacion: FormGroup;
  public formularioOpcionesReasignacion: FormGroup;
  public fiscalAReasignar = new FormControl(null);
  public fiscalAsignado = new FormControl(null);
  public tiposAsignacion: any[] = [];
  public tiposReasignacion: any[] | undefined;
  public listaFiscalesAsignacion: any[] = [];
  public listaFiscalesReasignacion: any[] = [];
  public suscripciones: Subscription[] = [];
  public referenciaModal!: DynamicDialogRef;
  public mostrarFiltros = false; // true
  public archivoSeleccionado: File | undefined;
  public archivoSeleccionadoB64: string = '';
  public pdfUrl: string | null = null;
  public pesoPermitido: number = 30; //MB
  public resetPage: boolean = false;
  public totalCasosAsignar: number = 0;
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

  public opcionesMenu!: MenuItem[];
  protected valorPasteado: string = '';
  public valorInicial: string = '';
  public nombreFiscal: string = '';
  private nombreFiscalReasignado: string = '';
  constructor(
    private fb: FormBuilder,
    //private spinner: NgxSpinnerService,
    private reasignacionService: ReasignacionService,
    private asignacionConsultaService: AsignacionConsultasService,
    private maestroService: MaestroService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private exportarService: ExportarService,
    protected stringUtil: StringUtil,
    protected iconAsset: IconAsset,
    protected iconUtil: IconUtil,
    protected fileUtil: FileUtil,
    private tokenService: TokenService,
    private readonly alertaService: AlertaService
  ) {
    this.formularioReasignacion = this.fb.group({
      tiempoAFiltrar: ['ultimosMeses'],
      buscar: [''],
      fechaAsignacionInicio: [null],
      fechaAsignacionFin: [null],
      tipoAsignacion: [null],
    });

    this.formularioOpcionesReasignacion = this.fb.group({
      tipoReasignacion: [null],
      motivo: [''],
      fechaReasignacionInicio: [
        { value: null, disabled: true },
        Validators.required,
      ],
      fechaReasignacionFin: [
        { value: null, disabled: true },
        Validators.required,
      ],
    });
  }

  ngOnInit() {
    this.nombreFiscal = this.obtenerNombreFiscal();
    this.cargarFiltrosPorDefecto();
    this.listarCasosAsignados();
    this.cargarTiposAsignacion();
    this.cargarFiscalesAsignados();
    this.iniciarFechasReasignacion();
  }

  private iniciarFechasReasignacion(): void {
    this.formularioOpcionesReasignacion
      .get('fechaReasignacionInicio')
      ?.disable();
    this.formularioOpcionesReasignacion.get('fechaReasignacionFin')?.disable();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  public obtenerOpcionesMenu(data: any): void {
    this.opcionesMenu = [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarVisorDocumental(data.idCaso, data.numeroCaso);
        },
      },
      {
        label: 'Detalles del caso',
        icon: 'file-search-icon',
        command: () => {
          this.verHistorialTramite(data);
        },
      },
    ];
  }

  protected verHistorialTramite(data: any): void {
    this.referenciaModal = this.dialogService.open(
      HistorialTramiteModalComponent,
      {
        showHeader: false,
        contentStyle: { padding: '0', 'border-radius': '15px' },
        data: {
          idCaso: data.idCaso,
          numeroCaso: data.numeroCaso,
          idTramite: data.idActoTramiteCaso,
          titulo: data.tramite,
        },
      }
    );
  }

  get mostrarOpcionesReasignacion(): boolean {
    return true;
    //return this.casosSeleccionados.length > 0 && this.fiscalAsignado.value
  }

  get esTipoAsignacionTemporal(): boolean {
    return (
      this.formularioOpcionesReasignacion.get('tipoReasignacion')!.value ===
      ASIGNACION_TEMPORAL
    );
  }

  private cargarFiltrosPorDefecto(): void {
    // this.mostrarFiltros = true;
    this.obtenerFechasUltimosMeses();
  }

  private obtenerFechasUltimosMeses(): void {
    this.formularioReasignacion.get('fechaAsignacionFin')!.setValue(new Date());
    this.formularioReasignacion
      .get('fechaAsignacionInicio')!
      .setValue(new Date(new Date().setMonth(new Date().getMonth() - 6)));
  }

  public limpiarFiltros(): void {
    this.formularioReasignacion.reset();
    this.fiscalAsignado = new FormControl(null);
    this.obtenerFechasUltimosMeses();
    this.formularioReasignacion.get('tiempoAFiltrar')!.setValue('ultimosMeses');
    this.formularioOpcionesReasignacion.reset();
    this.fiscalAReasignar = new FormControl(null);
    this.listarCasosAsignados();
    this.archivoSeleccionado = undefined;
    this.archivoSeleccionadoB64 = '';
    this.pdfUrl = null;
  }

  public filtrarCasos(): void {
    let textoBusqueda = this.formularioReasignacion.get('buscar')!.value;
    this.valorInicial = textoBusqueda;
    this.casosPorAsignarFiltrados = this.casosAsignados.filter((item) =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(textoBusqueda?.toLowerCase())
      )
    );

    this.itemPaginado.data.data = this.casosPorAsignarFiltrados;
    this.itemPaginado.data.total = this.totalCasosAsignar =
      this.casosPorAsignarFiltrados.length;
    this.actualizarPaginaRegistros(this.casosPorAsignarFiltrados, true);
    this.casosSeleccionados = [];
  }

  protected listarCasosAsignados(): void {
    const formularioReasignacion = this.formularioReasignacion.getRawValue();
    if (
      !formularioReasignacion.fechaAsignacionInicio ||
      !formularioReasignacion.fechaAsignacionFin
    ) {
      this.formularioReasignacion
        .get('tiempoAFiltrar')!
        .setValue('todosLosMeses');
      this.prepararDataBusquedaPorAsignar();
      return;
    }

    const filtrarCasos: FiltrarCasosPorReasignar = {
      fiscalAsignado: this.fiscalAsignado.value || null,
      ultimosMeses:
        this.formularioReasignacion.get('tiempoAFiltrar')!.value ===
        'ultimosMeses'
          ? FILTRO_TIEMPO.ULTIMOS_MESES
          : FILTRO_TIEMPO.TODO,
      fechaInicio: formularioReasignacion.fechaAsignacionInicio || null,
      fechaFin: formularioReasignacion.fechaAsignacionFin || null,
      extendido: this.mostrarFiltros,
      tipoAsignacion: formularioReasignacion.tipoAsignacion || null,
    };
    this.suscripciones.push(
      this.reasignacionService
        .listarCasosAsignados(filtrarCasos)
        .subscribe((resultado) => {
          this.casosAsignados = resultado;
          this.casosPorAsignarFiltrados = this.casosAsignados;
          this.casosSeleccionados = [];
          this.itemPaginado.data.data = this.casosPorAsignarFiltrados;
          this.itemPaginado.data.total = this.totalCasosAsignar =
            this.casosPorAsignarFiltrados.length;
          this.actualizarPaginaRegistros(this.casosPorAsignarFiltrados, false);
          const buscado = this.formularioReasignacion.get('buscar')!.value;
          if (buscado) {
            this.filtrarCasos();
          }
          // buscar && this.filtrarCasosAsignadosPorCampo()
          //buscar && this.filtrarReasignarCasosPorCampo();
          // const criterioBusqueda = this.formularioReasignacion.get('buscar')!.value;
          // criterioBusqueda && this.filtrarCasosAsignados(criterioBusqueda);
        })
    );
  }

  public prepararDataBusquedaPorAsignar() {
    let fechaInicio = new Date(new Date().setMonth(new Date().getMonth() - 6));
    if (
      this.formularioReasignacion.get('tiempoAFiltrar')!.value ===
      'todosLosMeses'
    )
      fechaInicio = new Date('1999-01-01T00:00:01');

    this.formularioReasignacion.patchValue({
      buscar: '',
      fechaDesde: fechaInicio,
      fechaHasta: new Date(),
      plazo: null,
      origen: null,
    });

    this.listarCasosAsignados();
  }

  public obtenerClaseDeTipoAsignacion(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase();
  }

  private cargarTiposAsignacion(): void {
    this.suscripciones.push(
      this.maestroService.getTipoAsignacion().subscribe((resultado) => {
        this.tiposAsignacion = resultado.data;
        this.tiposReasignacion = resultado.data;
      })
    );
  }

  private cargarFiscalesAsignados(): void {
    this.suscripciones.push(
      this.asignacionConsultaService
        .obtenerFiscales()
        .subscribe((result: any) => {
          this.listaFiscalesReasignacion = result;
          this.listaFiscalesAsignacion = result;
        })
    );
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
    this.mostrarFiltros &&
      this.formularioReasignacion
        .get('tiempoAFiltrar')!
        .setValue('ultimosMeses');
    // this.listarCasosAsignados();
  }

  public eventoCambiarTipoReasignacion(idTipoReasignacion: number): void {
    if (idTipoReasignacion !== ASIGNACION_TEMPORAL) {
      this.formularioOpcionesReasignacion
        .get('fechaReasignacionInicio')!
        .setValue(null);
      this.formularioOpcionesReasignacion
        .get('fechaReasignacionFin')!
        .setValue(null);
      this.formularioOpcionesReasignacion
        .get('fechaReasignacionInicio')
        ?.disable();
      this.formularioOpcionesReasignacion
        .get('fechaReasignacionFin')
        ?.disable();
    } else {
      this.formularioOpcionesReasignacion
        .get('fechaReasignacionInicio')
        ?.enable();
      this.formularioOpcionesReasignacion.get('fechaReasignacionFin')?.enable();
    }
  }

  public eventoCambiarFiscalAsignado(idFiscal: string): void {
    this.listarCasosAsignados();
    this.listaFiscalesReasignacion = [...this.listaFiscalesAsignacion];
    this.listaFiscalesReasignacion = this.listaFiscalesReasignacion.filter(
      (fiscal) => fiscal.idFiscal !== idFiscal
    );
  }

  public reasignarCaso(): void {
    const motivoReasignacion =
      this.formularioOpcionesReasignacion.get('motivo')!.value;
    const tipoReasignacion =
      this.formularioOpcionesReasignacion.get('tipoReasignacion')!.value;
    const fechaInicio = this.formularioOpcionesReasignacion.get(
      'fechaReasignacionInicio'
    )!.value;
    const fechaFin = this.formularioOpcionesReasignacion.get(
      'fechaReasignacionFin'
    )!.value;
    /*if (this.fiscalAsignado.value === null)
      return this.messageService.add({
        severity: 'warn',
        detail: MENSAJE.SELECT_FISCAL_ASIGNADO
      })
    */
    if (tipoReasignacion === null)
      return this.messageService.add({
        severity: 'warn',
        detail: MENSAJE.SELECT_TIPO_REASIGNACION,
      });

    if (this.casosSeleccionados.length === 0)
      return this.messageService.add({
        severity: 'warn',
        detail: MENSAJE.SELECT_MINIMO_UN_CASO,
      });

    if (this.fiscalAReasignar.value === null)
      return this.messageService.add({
        severity: 'warn',
        detail: MENSAJE.SELECT_FISCAL_REASIGNAR,
      });

    if (motivoReasignacion === null || motivoReasignacion === '')
      return this.messageService.add({
        severity: 'warn',
        detail: MENSAJE.SELECT_MOTIVO_REASIGNACION,
      });
    if (motivoReasignacion.length > 300)
      return this.messageService.add({
        severity: 'warn',
        detail: MENSAJE.SELECT_MOTIVO_REASIGNACION,
      });

    if (tipoReasignacion === ASIGNACION_TEMPORAL) {
      if (fechaInicio === null)
        return this.messageService.add({
          severity: 'warn',
          detail: MENSAJE.SELECT_FECHA_INICIO,
        });
      if (fechaFin === null)
        return this.messageService.add({
          severity: 'warn',
          detail: MENSAJE.SELECT_FECHA_FIN,
        });
    }
    if (fechaInicio && fechaFin && fechaInicio >= fechaFin) {
      return this.messageService.add({
        severity: 'warn',
        detail: MENSAJE.ERROR_FECHA_INI_FIN,
      });
    }

    let casosPorAsignar: any = [];
    this.casosSeleccionadosAcum.forEach(
      ({ idCaso, numeroCaso }: CasosAsignados) => {
        let casoPorAsignar = { idCaso, numeroCaso };
        casosPorAsignar.push(casoPorAsignar);
      }
    );
    const fiscal = this.listaFiscalesReasignacion.find(
      (f) => f.idFiscal === this.fiscalAReasignar.value
    );
    this.nombreFiscalReasignado = fiscal ? fiscal.nombreCompleto : '';
    let casos: string = casosPorAsignar.length;
    let singular: boolean = casosPorAsignar.length === 1;
    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '50%',
      showHeader: false,
      data: {
        icon: 'quest',
        title: `¿Desea confirmar reasignación?`,
        description: `Se asignará ${casos} ${
          singular ? ' caso ' : ' casos'
        } al fiscal <span class='bold'>${
          this.nombreFiscalReasignado
        }</span>. ¿Está seguro de realizar la siguiente acción?`,
        confirmButtonText: 'Aceptar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    let fechaInicioReasignacionTemporal: Date | null = null;
    let fechaFinReasignacionTemporal: Date | null = null;

    if (tipoReasignacion === ASIGNACION_TEMPORAL) {
      fechaInicioReasignacionTemporal = fechaInicio;
      fechaFinReasignacionTemporal = fechaFin;
    }

    this.referenciaModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          let request: ReasignarCasoRequest = {
            idFiscal: this.fiscalAReasignar.value,
            casos: casosPorAsignar,
            tipoAsignacion: tipoReasignacion,
            motivoReasignacion,
            fechaInicioReasignacionTemporal,
            fechaFinReasignacionTemporal,
            archivoPorSubir: this.archivoSeleccionadoB64,
            archivoNombre: this.archivoSeleccionado?.name || '',
          };

          this.confirmarReasignarCaso(request);
          this.casosSeleccionadosAcum = [];
        }
      },
    });
  }

  private confirmarReasignarCaso(request: ReasignarCasoRequest): void {
    this.suscripciones.push(
      this.reasignacionService
        .reasignarCaso(request)
        .pipe(delay(200))
        .subscribe({
          next: (resp) => {
            this.limpiarFiltros();
            //this.spinner.hide()
            if (resp.code === 0) {
              const sText = 's';

              const titlemodal = `Caso${sText} reasignado${sText} correctamente`;
              const descriptionModal = `Se reasigno  <span class='bold'>${request.casos.length}</span>  caso${sText} al fiscal <span class='bold'>${this.nombreFiscalReasignado}</span>.`;

              this.referenciaModal = this.dialogService.open(
                AlertaModalComponent,
                {
                  width: '50%',
                  showHeader: false,
                  data: {
                    icon: 'success',
                    title: titlemodal,
                    description: descriptionModal,
                    confirmButtonText: 'Aceptar',
                  },
                } as DynamicDialogConfig<AlertaData>
              );

              this.cargarFiscalesAsignados();
            }
            // this.listarCasosAsignados();
            //this.spinner.hide()
          },

          error: (error) => {
            this.dialogService.open(AlertaModalComponent, {
              width: '600px',
              showHeader: false,
              data: {
                icon: 'error',
                title: `Error al intentar realizar la asignación`,
                description: `${error.error.message}`,
                confirmButtonText: 'Aceptar',
              },
            } as DynamicDialogConfig<AlertaData>);
            //this.spinner.hide();
            this.messageService.add({
              severity: 'error',
              detail: `Ha ocurrido un error inesperado`,
            });
          },
        })
    );
  }

  public exportarPdfExcel(exportType: TipoArchivoType): void {
    if (this.casosAsignados.length > 0) {
      const headers = HEADER_REASIGNACION;
      const data: any[] = [];

      this.casosAsignados.forEach((caso: CasosAsignados) => {
        const row = {
          'Número de caso': caso.numeroCaso,
          Etapa: caso.etapa,
          'Acto Procesal': caso.actoProcesal,
          Trámite: caso.tramite,
          'Fiscal Asignado': caso.fiscalAsignado,
          'Fecha Ingreso': caso.fechaIngreso,
          'Fecha Asignación': caso.fechaAsignacion,
        };
        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, NOMBRE_ARCHIVO)
        : this.exportarService.exportarAExcel(data, headers, NOMBRE_ARCHIVO);
      return;
    }

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
  }

  private mostrarVisorDocumental(idCaso: string, numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      contentStyle: { padding: 0 },
      data: {
        caso: idCaso,
        numeroCaso: numeroCaso,
        idCaso: idCaso,
        title: 'Visor documental del caso:',
        description: 'Hechos del caso',
      },
    });
  }

  public abrirArchivoParaSubirlo($event: MouseEvent): void {
    $event.preventDefault();
    this.archivoEntrada?.nativeElement.click();
  }

  public async alSeleccionarArchivo($event: Event): Promise<void> {
    this.messageService.clear();
    const input = $event.target as HTMLInputElement;
    const archivoSeleccionado = this.archivoEntrada?.nativeElement.files?.[0];
    if (
      !archivoSeleccionado ||
      archivoSeleccionado.type !== 'application/pdf'
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Seleccione un archivo válido. Solo se aceptan archivos PDF',
        life: LAPSO_TIEMPO,
      });
      input.value = '';
      return;
    }
    if (!this.tienePesoPermitido(archivoSeleccionado)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `El archivo no debe pesar más de ${this.pesoPermitido}MB`,
        life: LAPSO_TIEMPO,
      });
      return;
    }
    this.archivoSeleccionado = archivoSeleccionado;
    if (archivoSeleccionado) {
      this.archivoSeleccionadoB64 = await this.fileUtil.archivoFileToB64(
        this.archivoSeleccionado
      );
      this.pdfUrl = `${this.fileUtil.trustUrlB64(this.archivoSeleccionadoB64)}`;
    }
  }

  private tienePesoPermitido(archivo: File): boolean {
    const maxSizeInBytes = this.pesoPermitido * 1024 * 1024; // 30MB
    return archivo.size <= maxSizeInBytes;
  }

  public obtenerPesoFormateado(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    let k = TAMANIO_ARCHIVO;
    let sizes = ['Bytes', 'KB', 'MB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${
      sizes[i] ?? 'MB'
    }`;
  }

  public verArchivoSubido() {
    this.dialogService.open(PrevisualizarDocumentoComponent, {
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px' },
      data: {
        pdfUrl: this.pdfUrl,
        nombreArchivo: this.archivoSeleccionado?.name,
      },
    });
  }

  public borrarArchivoSubido() {
    this.pdfUrl = null;
    this.archivoSeleccionado = undefined;
    this.archivoSeleccionadoB64 = '';
  }
  onHeaderCheckboxToggle(event: any): void {
    if (event.checked) {
      this.casosSeleccionadosAcum = [
        ...this.casosSeleccionadosAcum,
        ...this.casosSeleccionados.filter(
          (caso) => !this.casosSeleccionadosAcum.includes(caso)
        ),
      ];
    } else {
      this.casosSeleccionadosAcum = this.casosSeleccionadosAcum.filter((caso) =>
        this.casosSeleccionados.includes(caso)
      );
    }
  }
  onPaginate(paginacion: PaginacionInterface) {
    this.casosSeleccionados = this.casosSeleccionadosAcum;
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage);
  }
  onRowSelect(event: any): void {
    this.casosSeleccionadosAcum.push(event.data);
  }

  onRowUnselect(event: any): void {
    this.casosSeleccionadosAcum = this.casosSeleccionadosAcum.filter(
      (caso) => caso !== event.data
    );
  }

  actualizarPaginaRegistros(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.casosPorAsignarFiltrados = data.slice(start, end);
  }
  validarFechas(control: AbstractControl, inicio: boolean): void {
    const fechaInicio = control.get('fechaReasignacionInicio')?.value;
    const fechaFin = control.get('fechaReasignacionFin')?.value;

    if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
      if (inicio) {
        control.get('fechaReasignacionInicio')?.setValue(null);
      } else {
        control.get('fechaReasignacionFin')?.setValue(null);
      }
      return this.messageService.add({
        severity: 'warn',
        detail: MENSAJE.ERROR_FECHA_INI_FIN,
      });
    }
  }
  copiarAlPortapapeles(valor: string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(valor)
        .then(() => {})
        .catch((err) => {
          console.error('Error al copiar al portapapeles:', err);
        });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = valor;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
      }
      document.body.removeChild(textArea);
    }
  }
  public obtenerNombreFiscal(): string {
    return this.tokenService.getDecoded().usuario.fiscal;
  }
}
