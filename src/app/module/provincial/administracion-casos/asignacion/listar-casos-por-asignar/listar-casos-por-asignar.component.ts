import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { EncabezadoTooltipComponent } from '@components/modals/encabezado-tooltip/encabezado-tooltip.component';
import { AlertaData } from '@interfaces/comunes/alert';
import { PaginacionInterface } from '@interfaces/comunes/paginacion.interface';
import {
  AsignarCasoRequest,
  CasoLeidoRequest,
} from '@interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest';
import { BuscarCasosPorAsignarRequest } from '@interfaces/provincial/administracion-casos/asignacion/BuscarCasosPorAsignarRequest';
import { CasoPorAsignar } from '@interfaces/provincial/administracion-casos/asignacion/CasoPorAsignar';
import { ExportarService } from '@services/shared/exportar.service';
import { MaestroService } from '@services/shared/maestro.service';
import {
  LECTURA_CASO,
  PLAZO_CONSTANTES,
} from '@core/types/efe/provincial/administracion-casos/asignacion/recepcion-casos.type';
import { TipoArchivoType } from '@core/types/exportar.type';
import { ID_TIPO_ORIGEN } from '@core/types/tipo-origen.type';
import { AsignacionConsultasService } from '@services/provincial/asignacion/asignacion-consultas.service';
import { AsignacionTransaccionalService } from '@services/provincial/asignacion/asignacion-transaccional.service';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { AnularCasoModalComponent } from '@components/modals/anular-caso-modal/anular-caso-modal.component';
import { AsuntoObservacionesComponent } from '@components/modals/asunto-observaciones/asunto-observaciones.component';
import { DelitosYPartesModalComponent } from '@components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { DescripcionModalComponent } from '@components/modals/descripcion-modal/descripcion-modal.component';
import { VisorEfeModalComponent } from '@components/modals/visor-efe-modal/visor-efe-modal.component';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { DateMaskModule } from '@directives/date-mask.module';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MenuItem, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription, delay, of } from 'rxjs';
import {
  StringUtil,
  IconUtil,
  IconAsset,
  DateFormatPipe,
} from 'ngx-cfng-core-lib';
import { TokenService } from '@core/services/shared/token.service';
import { EscenarioUno } from '@interfaces/maestros/escenarios.interface';

@Component({
  selector: 'app-listar-casos-por-asignar',
  standalone: true,
  imports: [
    CalendarModule,
    CheckboxModule,
    CmpLibModule,
    CommonModule,
    DateFormatPipe,
    DateMaskModule,
    DialogModule,
    DividerModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    FormsModule,
    InputTextModule,
    MenuModule,
    MessagesModule,
    RadioButtonModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    EncabezadoTooltipComponent,
    PaginatorComponent,
  ],
  templateUrl: './listar-casos-por-asignar.component.html',
  providers: [MessageService, DialogService, DatePipe],
})
export class ListarCasosPorAsignarComponent implements OnInit {
  public tooltipVisible: boolean = false;
  public LECTURA_CASO = LECTURA_CASO;
  protected fiscalesPorAsignar = [];
  protected plazos = [];
  protected origen: EscenarioUno[] = [];
  protected leyenda: any[] = [];
  public casosPorAsignar: CasoPorAsignar[] = [];
  public casosPorAsignarFiltrados: CasoPorAsignar[] = [];
  public casosSeleccionados: CasoPorAsignar[] = [];
  public mostrarFiltros = false;
  public totalCasosAsignar: number = 0;
  protected tituloTootip: string = 'Se mostrará en color:';
  protected formularioFiltrarCasos!: FormGroup;
  protected fiscalPorAsignar = new FormControl(null);
  protected referenciaModal!: DynamicDialogRef;
  private subscriptions: Subscription[] = [];
  protected query: any = { limit: 10, page: 1, where: {} };
  protected resetPage: boolean = false;
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  public opcionesMenu!: MenuItem[];
  public emptyMessage: string = 'No se encontraron registros';
  public casoLeidoTemporal: boolean = false;
  public cargoFiscal: string = '';
  constructor(
    private formulario: FormBuilder,
    private maestrosService: MaestroService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private exportarService: ExportarService,
    private datePipe: DatePipe,
    private asignacionConsultaService: AsignacionConsultasService,
    private asignacionTransaccionalService: AsignacionTransaccionalService,
    protected stringUtil: StringUtil,
    protected iconAsset: IconAsset,
    protected iconUtil: IconUtil,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {

    this.cargoFiscal = this.obtenerCargo();
    this.formBuild();
    this.obtenerPlazos();
    this.obtenerOrigen();
    this.obtenerFiscales();
    this.obtenerCasosPorAsignar();
  }
  toggleTooltip: () => void = () => {
    this.tooltipVisible = !this.tooltipVisible;
  };
  showTooltip(): void {
    if (!this.tooltipVisible) {
      this.tooltipVisible = true;
    }
  }
  public obtenerOpcionesMenu(data: any): void {
    this.opcionesMenu = [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarVisorDocumental(data.id, data.numeroCaso);
          this.registarCasoLeido(data.id, data.leido);
        },
      },
      {
        label: 'Ver asuntos y observaciones',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarAsuntoObservaciones(data.id, data.numeroCaso);
          this.registarCasoLeido(data.id, data.leido);
        },
      },
      {
        label: 'Anular caso',
        icon: 'trash-icon',
        disabled:
          data.idOrigen === ID_TIPO_ORIGEN.MUP ||
          data.idOrigen === ID_TIPO_ORIGEN.MD
            ? false
            : true,
        command: () => {
          this.registarCasoLeido(data.id, data.leido);
          this.anularCaso(data.id, data.numeroCaso);
        },
      },
    ];
    if (this.cargoFiscal !== '00000008') {
      this.opcionesMenu = this.opcionesMenu.filter(
        (opcion) => opcion.label !== 'Anular caso'
      );
    }
  }

  private formBuild(): void {
    this.formularioFiltrarCasos = this.formulario.group({
      buscar: [''],
      tiempoAFiltrar: ['ultimoSeisMeses'],
      fechaDesde: [new Date(new Date().setMonth(new Date().getMonth() - 6))],
      fechaHasta: [new Date()],
      plazo: [null],
      origen: [null],
    });
  }

  private obtenerFiscales(): void {
    this.subscriptions.push(
      this.asignacionConsultaService.obtenerFiscales().subscribe({
        next: (resp) => {
          this.fiscalesPorAsignar = resp;
        },
        error: (error) => {},
      })
    );
  }

  private obtenerPlazos(): void {
    this.subscriptions.push(
      this.maestrosService.getTipoPlazo().subscribe({
        next: (resp) => {
          this.plazos = resp.data;
        },
      })
    );
  }

  private obtenerOrigen(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerOrigen().subscribe({
        next: (resp) => {
          this.origen = resp.data.filter(
            (origen: { id: number }) => origen.id !== ID_TIPO_ORIGEN.EFE
          );
        },
      })
    );
  }

  protected obtenerCasosPorAsignar(): void {
    let form = this.formularioFiltrarCasos.getRawValue();
    if (!form.fechaDesde || !form.fechaHasta) {
      this.formularioFiltrarCasos
        .get('tiempoAFiltrar')!
        .setValue('todosLosMeses');
      this.prepararDataBusquedaPorAsignar();
      return;
    }

    let request: BuscarCasosPorAsignarRequest = {
      fechaDesde: this.datePipe.transform(form.fechaDesde, 'dd-MM-yyyy'),
      fechaHasta: this.datePipe.transform(form.fechaHasta, 'dd-MM-yyyy'),
      plazo: form.plazo,
      origen: form.origen,
    };

    this.subscriptions.push(
      this.asignacionConsultaService.obtenerCasosPorAsignar(request)
      .subscribe({
        next: (resp) => {
          if (resp.code === 0) {
            this.casosPorAsignar = resp.data.map((caso: any) => ({
              ...caso,
              seleccionado: false,
            }));
            this.casosPorAsignarFiltrados = this.casosPorAsignar;
            this.casosSeleccionados = [];
            this.itemPaginado.data.data = this.casosPorAsignarFiltrados;
            this.itemPaginado.data.total = this.totalCasosAsignar =
              this.casosPorAsignarFiltrados.length;
            this.obtenerLeyenda(this.casosPorAsignarFiltrados);
            this.actualizarPaginaRegistros(
              this.casosPorAsignarFiltrados,
              false
            );
            const buscado = this.formularioFiltrarCasos.get('buscar')!.value;
            if (buscado) {
              this.filtrarCasos();
            }
          }
        },
        error: (error) => {},
      })
    );
  }

  private obtenerLeyenda(
    casosPorAsignarFiltrados: Array<CasoPorAsignar>
  ): void {
    let nroCasosDentroPlazo = 0;
    let nroCasosPorVencer = 0;
    let nroCasosFueraplazo = 0;

    casosPorAsignarFiltrados.forEach((caso: CasoPorAsignar) => {
      if (caso.semaforoNro === PLAZO_CONSTANTES.DENTRO_PLAZO)
        nroCasosDentroPlazo += 1;
      if (caso.semaforoNro === PLAZO_CONSTANTES.POR_VENCER)
        nroCasosPorVencer += 1;
      if (caso.semaforoNro === PLAZO_CONSTANTES.VENCIDO)
        nroCasosFueraplazo += 1;
    });

    let respuesta = [];
    let leyenda = {
      nombrePlazo: 'Dentro del plazo',
      cantidad: nroCasosDentroPlazo,
    };
    respuesta.push(leyenda);
    leyenda = { nombrePlazo: 'Plazo por vencer', cantidad: nroCasosPorVencer };
    respuesta.push(leyenda);
    leyenda = { nombrePlazo: 'Plazo vencido', cantidad: nroCasosFueraplazo };
    respuesta.push(leyenda);
    this.leyenda = respuesta;
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
    this.mostrarFiltros &&
      this.formularioFiltrarCasos
        .get('tiempoAFiltrar')!
        .setValue('ultimoSeisMeses');
    this.mostrarFiltros && this.prepararDataBusquedaPorAsignar();
  }

  public filtrarCasos(): void {
    let textoBusqueda = this.formularioFiltrarCasos.get('buscar')!.value;
    this.casosPorAsignarFiltrados = this.casosPorAsignar.filter((item) =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(textoBusqueda?.toLowerCase())
      )
    );
    this.emptyMessage =
      'No se encontraron registros con los criterios de búsqueda ingresados';
    this.itemPaginado.data.data = this.casosPorAsignarFiltrados;
    this.itemPaginado.data.total = this.totalCasosAsignar =
      this.casosPorAsignarFiltrados.length;
    this.actualizarPaginaRegistros(this.casosPorAsignarFiltrados, true);
    this.casosSeleccionados = [];
  }

  public limpiarFiltros(): void {
    this.emptyMessage = 'No se encontraron registros';
    this.formBuild();
    this.obtenerCasosPorAsignar();
  }

  public verDelitosPartes(
    numeroCaso: string,
    idCaso: string,
    leido: string
  ): void {
    this.registarCasoLeido(idCaso, leido);
    const verDelitosPartesRef = this.dialogService.open(
      DelitosYPartesModalComponent,
      {
        showHeader: false,
        width: '95%',
        contentStyle: { overflow: 'auto' },
        data: {
          numeroCaso,
        },
      }
    );

    verDelitosPartesRef.onClose.subscribe({
      next: (data) => {
        //this.obtenerCasosPorAsignar()
      },
    });
  }

  public clasificacionCaso(
    numeroCaso: string,
    idCaso: string,
    leido: string,
    clasificacion: string
  ): void {
    this.registarCasoLeido(idCaso, leido);
    this.referenciaModal = this.dialogService.open(DescripcionModalComponent, {
      showHeader: false,
      data: {
        tipo: 'clasificacion',
        idCaso: idCaso,
        caso: numeroCaso,
        titulo: 'Clasificación de caso (Opcional)',
        descripcion: 'Ingrese una descripción rápida del caso',
        contenido: clasificacion,
      },
    });

    this.referenciaModal.onClose.subscribe({
      next: (data) => {
        this.obtenerCasosPorAsignar();
      },
    });
  }

  private anularCaso(idCaso: string, numeroCaso: string): void {
    const anularCasoRef = this.dialogService.open(AnularCasoModalComponent, {
      showHeader: false,
      data: {
        tipo: 'anulacion',
        caso: numeroCaso,
        idCaso: idCaso,
        descripcion:
          'NOTA: Solo se podrá anular un caso cuando es por "error material" que proviene de la MUP o Denuncias a Despacho.',
      },
    });
    anularCasoRef.onClose.subscribe({
      next: (data) => {
        if (data === 'confirm') {
          this.obtenerCasosPorAsignar();
          this.limpiarFiltros();
        }
      },
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

  private mostrarAsuntoObservaciones(idCaso: string, numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(
      AsuntoObservacionesComponent,
      {
        width: '85%',
        contentStyle: { overflow: 'auto' },
        showHeader: false,
        data: {
          numeroCaso: numeroCaso,
          idCaso: idCaso,
          title: 'Asunto Observaciones',
          description: 'Hechos del caso',
        },
      }
    );
  }

  public confirmarAsignacionCaso(): void {
    if (this.cargoFiscal !== '00000008')
      return this.messageService.add({
        severity: 'warn',
        detail: 'Debe tener el cargo de Fiscal para realizar la asignación',
      });
    if (this.casosSeleccionados.length === 0)
      return this.messageService.add({
        severity: 'warn',
        detail: 'Debe seleccionar al menos un caso para realizar la asignación',
      });

    if (this.fiscalPorAsignar.value === null)
      return this.messageService.add({
        severity: 'warn',
        detail: 'Debe seleccionar un fiscal para realizar la asignación',
      });

    let casosPorAsignar: any = [];
    this.casosSeleccionados.forEach((caso: CasoPorAsignar) => {
      let nroCaso = { idCaso: caso.id, numeroCaso: caso.numeroCaso };
      casosPorAsignar.push(nroCaso);
    });

    let fiscal: any = this.fiscalesPorAsignar.filter(
      (fiscal: any) => fiscal.idFiscal === this.fiscalPorAsignar.value
    )[0];
    let casos: string = casosPorAsignar.length;
    let singular: boolean = casosPorAsignar.length === 1;
    let nText: string = singular ? '' : 'n';

    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'quest',
        title: `¿Desea confirmar asignación de ${singular ? 'caso' : 'casos'}?`,
        description: `Se asignará ${casos} ${
          singular ? ' caso ' : ' casos'
        } al fiscal <span class='bold'>${
          fiscal.nombreCompleto
        }</span>. ¿Está seguro de realizar la siguiente acción?`,
        confirmButtonText: 'Confirmar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    this.referenciaModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          let request: AsignarCasoRequest = {
            idFiscal: this.fiscalPorAsignar.value,
            casos: casosPorAsignar,
            tipoAsignacion: '1',
          };
          this.asignarCaso(request, fiscal.nombreCompleto, casos);
        }
      },
    });
  }
  private abrirModalConfirmOrError(
    icon: String,
    title: String,
    description: String
  ): void {
    of(null)
      .pipe(delay(200))
      .subscribe(() => {
        this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon,
            title,
            description,
            confirmButtonText: 'Aceptar',
          },
        } as DynamicDialogConfig<AlertaData>);
      });
  }
  private asignarCaso(
    request: AsignarCasoRequest,
    nombreFiscal: string,
    casos: string
  ): void {
    this.asignacionTransaccionalService
      .asignarCaso(request)
      .pipe(delay(200))
      .subscribe({
        next: (resp) => {
          if (resp.code === 0) {
            this.limpiarFiltros();
            this.obtenerFiscales();
            const sText = request.casos.length === 1 ? '' : 's';
            const asignacionText =
              request.casos.length === 1 ? 'asignó ' : 'asignaron ';
            const titlemodal = `Caso${sText} asignado${sText} correctamente`;
            const descriptionModal = `Se ${asignacionText}  <span class='bold'>${casos}</span>  caso${sText} al fiscal <span class='bold'>${nombreFiscal}</span>.`;
            this.abrirModalConfirmOrError(
              'success',
              titlemodal,
              descriptionModal
            );
          }
        },
        error: (error) => {
          const titlemodal = `Error al intentar realizar la asignación`;
          const descriptionModal =
            `${error.error.message}` || 'Ha ocurrido un error inesperado';
          this.abrirModalConfirmOrError('error', titlemodal, descriptionModal);
          this.messageService.add({
            severity: 'error',
            detail: error.error.message || 'Ha ocurrido un error inesperado',
          });
        },
      });
  }

  private registarCasoLeido(idCaso: String, leido: string): void {
    if (leido == '1') return;

    let request: CasoLeidoRequest = {
      numeroCaso: idCaso,
      idEstadoCaso: 1, // tabla de estados de caso el id 1 es por asignar, y asi filtra al momento de traer los casos
    };
    this.asignacionTransaccionalService.registrarCasoLeido(request).subscribe({
      next: (resp) => {
        if (resp.code === 0) {
          this.casoLeidoTemporal = true;
          this.obtenerCasosPorAsignar();
        }
      },
      error: (error) => {},
    });
  }

  public exportarPdfExcel(exportType: TipoArchivoType): void {
    if (this.casosPorAsignar.length > 0) {
      const headers = [
        'Número de caso',
        'Origen',
        'Tipo Remitente',
        'Remitente',
        'Teléfono Remitente',
        'Correo Remitente',
        'Fecha Ingreso',
        'Hora Ingreso',
      ];
      const data: any[] = [];

      this.casosPorAsignar.forEach((caso: CasoPorAsignar) => {
        const row = {
          'Número de caso': caso.numeroCaso,
          Origen: caso.origen,
          'Tipo Remitente': caso.tipoRemitente,
          Remitente: caso.remitente,
          'Teléfono Remitente': caso.telefono,
          'Correo Remitente': caso.correo,
          'Fecha Ingreso': caso.fechaIngreso,
          'Hora Ingreso': caso.horaIngreso,
        };
        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos por asignar')
        : this.exportarService.exportarAExcel(
            data,
            headers,
            'Casos por asignar'
          );
      return;
    }
    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
  }

  public obtenerClaseTipoOrigen(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase();
  }
  public obtenerNumeroCaso(numeroCaso: string, plazo: string): string {
    return (
      this.stringUtil.obtenerPlazoItem(plazo) +
      this.stringUtil.obtenerNumeroCaso(numeroCaso)
    );
  }

  public prepararDataBusquedaPorAsignar() {
    let fechaInicio = new Date(new Date().setMonth(new Date().getMonth() - 6));
    if (
      this.formularioFiltrarCasos.get('tiempoAFiltrar')!.value ===
      'todosLosMeses'
    )
      fechaInicio = new Date('1999-01-01T00:00:01');

    this.formularioFiltrarCasos.patchValue({
      buscar: '',
      fechaDesde: fechaInicio,
      fechaHasta: new Date(),
      plazo: null,
      origen: null,
    });

    this.obtenerCasosPorAsignar();
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage);
  }

  actualizarPaginaRegistros(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.casosPorAsignarFiltrados = data.slice(start, end);
  }
  validarFechas(controlName: String): void {
    const fechaInicio = this.formularioFiltrarCasos.get('fechaDesde')?.value;
    const fechaFin = this.formularioFiltrarCasos.get('fechaHasta')?.value;

    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      if (controlName === 'fechaDesde') {
        this.formularioFiltrarCasos.get('fechaDesde')?.setValue(null);
        this.formularioFiltrarCasos
          .get('fechaDesde')
          ?.setErrors({ incorrect: true });
      } else {
        this.formularioFiltrarCasos.get('fechaHasta')?.setValue(null);
        this.formularioFiltrarCasos
          .get('fechaHasta')
          ?.setErrors({ incorrect: true });
      }
      this.messageService.add({
        severity: 'warn',
        detail: 'La fecha Inicial no puede ser mayor a la fecha Final',
      });
    }
  }

  public obtenerCargo(): string {
    return this.tokenService.getDecoded().usuario.codCargo;
  }
  copiarAlPortapapeles(valor:string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(valor).then(() => {
      }).catch(err => {
        console.error('Error al copiar al portapapeles:', err);
      });
    }else {
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

}
