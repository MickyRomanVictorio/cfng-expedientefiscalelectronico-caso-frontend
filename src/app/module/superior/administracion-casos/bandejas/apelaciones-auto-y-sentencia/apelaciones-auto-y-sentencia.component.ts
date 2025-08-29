import { noQuotes } from '@utils/utils';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { EtiquetaCasoComponent } from '@core/components/consulta-casos/components/carpeta-caso/etiqueta-caso/etiqueta-caso.component';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { DelitosYPartesModalComponent } from '@core/components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { TipoVisor } from '@core/components/modals/visor-documental-caso-elevado/model/visor-documento.model';
import { PrevisualizarDocumentoModalComponent } from '@core/components/modals/visor-documental-caso-elevado/previsualizar-documento-modal.component';
import { VisorEfeModalComponent } from '@core/components/modals/visor-efe-modal/visor-efe-modal.component';
import { TipoExportarEnum } from '@core/constants/constants';
import {
  EtiquetaClasesCss,
  PlazosLeyenda,
  PlazosLeyendaClasesCss,
  TipoElevacionCodigo,
} from '@core/constants/superior';
import { NumeroExpedientePipe } from '@core/pipes/numero-expediente.pipe';
import { ExportarService } from '@core/services/shared/exportar.service';
import { BandejaFiscaliaSuperiorService } from '@core/services/superior/bandeja/bandeja-fiscalia-superior';
import { ElevacionActuadosService } from '@core/services/superior/elevacion-actuados/elevacion-actuados.service';
import { rangoFechaXDefecto } from '@core/utils/date';
import { DateMaskModule } from '@directives/date-mask.module';
import {
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import { MaestroService } from '@services/shared/maestro.service';
import {
  ActoProcesal,
  Constants,
  DateFormatPipe,
  IconAsset,
  IconUtil,
  MathUtil,
  obtenerCasoHtml,
  obtenerFechaDDMMYYYY,
  StringUtil,
} from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { VerPetitorioComponent } from './ver-petitorio/ver-petitorio.component';
import { tourService } from '@utils/tour';
import { getEtiquetaConfig } from '@core/utils/utils';

@Component({
  selector: 'app-apelaciones-auto-y-sentencia',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    RadioButtonModule,
    CalendarModule,
    DateMaskModule,
    PaginatorComponent,
    DateFormatPipe,
    TableModule,
    ProgressBarModule,
    MenuModule,
    RouterLink,
    NgxCfngCoreModalDialogModule,
    EtiquetaCasoComponent,
    NumeroExpedientePipe,
  ],
  providers: [MessageService, DialogService, DatePipe],
  templateUrl: './apelaciones-auto-y-sentencia.component.html',
  styleUrl: './apelaciones-auto-y-sentencia.component.scss',
})
export class ApelacionesAutoYSentenciaComponent implements OnInit {
  protected esVisibleFiltros = false;
  protected fmrBuscar!: FormGroup;
  protected paginacionCondicion = { limit: 9, page: 1, where: {} };
  public paginacionConfiguracion: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  protected TipoExportarEnum = TipoExportarEnum;
  protected listaCasosOriginal: any[] = [];
  protected listaCasos: any[] = [];
  protected fiscales: SelectItem[] = [];
  protected obtenerCasoHtml = obtenerCasoHtml;
  protected leyendaClasesCss: { [key: string]: string } =
    PlazosLeyendaClasesCss;
  protected etiquetaClasesCss: { [key: string]: string } = EtiquetaClasesCss;
  protected leyenda: PlazosLeyenda[] = [
    {
      codigo: '1',
      nombre: 'Apelación de auto',
      cantidad: 0,
      clasesCss: 'plazo-vencido',
    },
    {
      codigo: '2',
      nombre: 'Apelación de sentencia',
      cantidad: 0,
      clasesCss: 'bg-gray-800',
    },
  ];
  protected tituloTootip: string = 'Se mostrará en color:';
  private casoSeleccionado: any;
  public referenciaModal!: DynamicDialogRef;
  protected plazos: SelectItem[] = this.leyenda.map((leyenda) => ({
    label: leyenda.nombre,
    value: leyenda.codigo,
  }));
  protected fiscaliasPronvinciales: SelectItem[] = [];
  protected despachos: SelectItem[] = [];
  private readonly subscriptions: Subscription[] = [];
  private readonly codDependencia: string;
  protected temporizadorBusqueda: any;
  private tipoVisor: TipoVisor = TipoVisor.AtenderCaso;
  protected opcionesCaso: MenuItem[] = [
    // {
    //   label: 'Visor documental', command: () => this.eventoVisorDocumental()
    // },
    {
      label: 'Atender Caso',
      command: () => this.eventoAtenderCaso(),
    },
    // ,
    // {
    //   label:'Ver petitorio', command: () => this.eventoVerPetitorio()
    // }
  ];
  protected busquedaPorTextoRealizada = false;
  protected tipoProcesos: SelectItem[] = [];
  protected subtipoProcesos: SelectItem[] = [];
  protected etapas: SelectItem[] = [];
  protected cuadernoIncidental: SelectItem[] = [];
  protected tipoApelacion: SelectItem[] = [
    {
      value: '726',
      label: 'Apelación de auto',
    },
    {
      value: '727',
      label: 'Apelación de sentencia',
    },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly maestrosService: MaestroService,
    private readonly dialogService: DialogService,
    private readonly elevacionActuadosService: ElevacionActuadosService,
    private readonly datePipe: DatePipe,
    protected iconUtil: IconUtil,
    protected iconAsset: IconAsset,
    protected stringUtil: StringUtil,
    protected mathUtil: MathUtil,
    protected bandejaFiscaliaSuperiorService: BandejaFiscaliaSuperiorService,
    private readonly exportarService: ExportarService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private tourService: tourService
  ) {
    const helper = new JwtHelperService();
    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);
    const decodedToken = helper.decodeToken(token.token);
    this.codDependencia = decodedToken.usuario.codDependencia;
  }

  ngOnInit(): void {
    this.crearFormulario();
    this.datosInicio();
    this.datosPorDefecto();
  }

  private eventoVisorDocumental() {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      contentStyle: { padding: 0 },
      data: {
        idCaso: this.casoSeleccionado.idCaso,
      },
    });
  }

  protected eventoCambiarPagina(datos: any) {
    this.paginacionCondicion.page = datos.page;
    this.paginacionCondicion.limit = datos.limit;
    this.actualizarListaCasosPaginacion(datos.data);
  }

  private mostrarVisorDocumental(informacion: any, caso: any): void {
    this.referenciaModal = this.dialogService.open(
      PrevisualizarDocumentoModalComponent,
      {
        width: '95%',
        showHeader: false,
        contentStyle: { padding: '0', 'border-radius': '15px' },
        data: {
          informacion: informacion,
          caso: caso,
          tipo: this.tipoVisor,
        },
      }
    );
    this.referenciaModal.onClose.subscribe({
      next: (rs) => {
        if (rs?.respuesta === 'completado') {
          this.buscar();
        }
      },
    });
  }

  //#region Principal
  private datosInicio() {
    this.obtenerTipoProceso();
    this.obtenerFiscaliasXEntidad();
    //
    this.buscar();
  }

  protected eventoExportar(tipoExportar: TipoExportarEnum): void {
    if (this.listaCasosOriginal.length > 0) {
      const headers = [
        'Número de caso',
        'Etapa',
        'Fiscal',
        'F. Registro',
        'Nombre Despacho',
        'Entidad',
        'Semáforo Tiempo',
        'Delitos',
        'Cantidad de Partes',
      ];
      const data: any[] = [];
      this.listaCasosOriginal.forEach((c: any) => {
        const row = {
          'Número de caso': c.codigoCaso, // Código del caso
          Etapa: c.etapa, // Etapa del caso
          Fiscal: c.fiscal, // Nombre del fiscal
          'F. Registro': c.fechaIngreso, // Fecha de ingreso
          'Nombre Despacho': c.nombreDespacho, // Nombre del despacho
          Entidad: c.nombreEntidad, // Nombre de la entidad
          'Semáforo Tiempo': c.semaforoTiempo, // Tiempo del semáforo
          Delitos: c.delitos, // Delitos
          'Cantidad de Partes': c.cantidadPartes, // Cantidad de partes en el caso
        };
        data.push(row);
      });

      tipoExportar === TipoExportarEnum.Pdf
        ? this.exportarService.exportarAPdf(
            data,
            headers,
            'bandeja_casos_actuados'
          )
        : this.exportarService.exportarAExcel(
            data,
            headers,
            'bandeja_casos_actuados'
          );
    }
  }
  protected eventoBuscarSegunTexto(): void {
    clearTimeout(this.temporizadorBusqueda);
    this.temporizadorBusqueda = setTimeout(() => {
      if (this.listaCasosOriginal.length > 0) {
        this.busquedaPorTextoRealizada = true;
      }
      const buscado = this.fmrBuscar.get('buscar')!.value;
      this.buscarPorTexto(buscado);
    }, 400);
  }

  private eventoAtenderCaso() {
    this.tipoVisor = TipoVisor.AtenderCaso;
    this.elevacionActuadosService
      .getInformacionDocumental(
        this.casoSeleccionado.idCaso,
        this.casoSeleccionado.idTipoElevacion,
        this.casoSeleccionado.idActoTramiteCaso
      )
      .subscribe({
        next: (response: any) => {
          if (response.codigoCaso == null) {
            this.modalDialogService.warning(
              '',
              'No se encontraron datos del caso.'
            );
          } else {
            this.mostrarVisorDocumental(response, this.casoSeleccionado);
          }
        },
        error: () => {
          this.modalDialogService.error(
            this.casoSeleccionado.codigoCaso,
            'Hubo un problema al intentar mostrar datos del caso.'
          );
        },
      });
  }
  protected eventoMostrarOcultarFiltros(): void {
    this.esVisibleFiltros = !this.esVisibleFiltros;
    setTimeout(() => {
      if (this.esVisibleFiltros) {
        this.tourService.startTour(this.stepsBusquedaAvanzada);
      }
    }, 500);
  }

  protected startTour(): void {
    setTimeout(() => {
      this.tourService.startTour(this.stepsComponente);
    }, 500);
  }

  private buscarPorTexto(bucarValor: string) {
    this.listaCasos = this.listaCasosOriginal.filter((data) =>
      Object.values(data).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(bucarValor.toLowerCase())
      )
    );
    this.paginacionConfiguracion.data.data = this.listaCasos;
    this.paginacionConfiguracion.data.total = this.listaCasos.length;
    this.actualizarListaCasosPaginacion(this.listaCasos);
    //
    this.contarPlazos(this.listaCasos);
  }

  private datosPorDefecto(): void {
    const fechaRango = rangoFechaXDefecto();
    this.fmrBuscar.patchValue({
      filtroTiempo: '0',
      tipoOrderBy: '0',
      fechaInicio: fechaRango.inicio,
      fechaFin: fechaRango.fin,
    });
  }

  protected eventoLimpiar() {
    this.fmrBuscar.reset();
    this.datosPorDefecto();
  }

  protected eventoBuscar() {
    this.buscar();
  }

  private buscar() {
    let body = { ...this.fmrBuscar.value };
    body = {
      ...body,
      fechaInicio: body.fechaInicio
        ? this.datePipe.transform(body.fechaInicio, 'dd/MM/yyyy')
        : null,
      fechaFin: body.fechaFin
        ? this.datePipe.transform(body.fechaFin, 'dd/MM/yyyy')
        : null,
    };
    this.obtenerDatosCasos(body);
  }

  public eventoCambiarFiltroTiempo(filtroTiempo: any) {
    this.fmrBuscar.get('buscar')!.setValue('');
    let fechaRango = rangoFechaXDefecto(1);
    if (filtroTiempo === '1') fechaRango = rangoFechaXDefecto(6);
    else if (filtroTiempo === '2') fechaRango = rangoFechaXDefecto(1000);
    this.obtenerDatosCasos({
      tipoFecha: '0',
      fechaInicio: obtenerFechaDDMMYYYY(fechaRango.inicio),
      fechaFin: obtenerFechaDDMMYYYY(fechaRango.fin),
    });
  }

  private contarPlazos(caso: any[]) {
    const cantidad = caso.reduce(
      (acc, item) => {
        if (
          [
            TipoElevacionCodigo.ApelacionesAutoPrincipal,
            TipoElevacionCodigo.ApelacionesAutoIncidental,
            TipoElevacionCodigo.ApelacionesAutoExtremos,
          ].includes(item.idTipoElevacion)
        ) {
          acc.apelacionAuto++;
        } else if (
          item.idTipoElevacion === TipoElevacionCodigo.ApelacionesSentencia
        ) {
          acc.apelacionSentencia++;
        }
        return acc;
      },
      { apelacionAuto: 0, apelacionSentencia: 0 }
    );

    this.leyenda[0].cantidad = cantidad.apelacionAuto;
    this.leyenda[1].cantidad = cantidad.apelacionSentencia;
  }

  private crearFormulario(): void {
    const fechaRango = rangoFechaXDefecto();
    this.fmrBuscar = this.fb.group({
      buscar: [''],
      filtroTiempo: ['0'],
      tipoOrderBy: ['0'],
      fechaInicio: [fechaRango.inicio],
      fechaFin: [fechaRango.fin],

      tipoApelacion: [null],
      proceso: [null],
      subtipoProceso: [null],
      cuadernoIncidental: [null],

      fiscaliaProvincial: [null],
      despacho: [null],
      etapa: [null],
      fiscal: [null],
    });
  }
  private obtenerCuadernoIncidental(listaCasos: any[]) {
    this.cuadernoIncidental = [];
    this.listaCasos.forEach((caso: any) => {
      if (caso.idTipoElevacion == 726) {
        const texto = caso.nombreActoProcesal;
        const palabraClave = 'APELACIÓN DE ';
        let nombreCortado = texto;
        const idx = texto.indexOf(palabraClave);
        if (idx !== -1) {
          nombreCortado = texto.substring(idx + palabraClave.length).trim();
        }
        // Verifica si ya existe un elemento con el mismo value o label
        const yaExiste = this.cuadernoIncidental.some(
          (item) =>
            item.value === caso.nombreActoProcesal ||
            item.label === nombreCortado
        );
        if (!yaExiste) {
          this.cuadernoIncidental.push({
            value: caso.nombreActoProcesal,
            label: nombreCortado,
          });
        }
      }
    });
  }
  private obtenerDatosCasos(datos: any) {
    //
    this.leyenda[0].cantidad = 0;
    this.leyenda[1].cantidad = 0;
    //
    this.bandejaFiscaliaSuperiorService
      .obtenerApelacionesAutoYSentencia(datos)
      .subscribe({
        next: (resp: any) => {
          this.listaCasos = resp;
          this.listaCasosOriginal = resp;
          this.obtenerCuadernoIncidental(this.listaCasosOriginal);
          this.paginacionConfiguracion.data.data = this.listaCasos;
          this.paginacionConfiguracion.data.total = this.listaCasos.length;
          this.actualizarListaCasosPaginacion(this.listaCasos);
          //
          this.contarPlazos(this.listaCasosOriginal);
        },
      });
    const buscado = this.fmrBuscar.get('buscar')!.value;
    if (buscado) {
      this.eventoBuscarSegunTexto();
    }
  }

  private actualizarListaCasosPaginacion(datos: any) {
    const start =
      (this.paginacionCondicion.page - 1) * this.paginacionCondicion.limit;
    const end = start + this.paginacionCondicion.limit;
    this.listaCasos = datos.slice(start, end);
  }

  protected eventoOpcionesFila(e: Event, menu: any, caso: any) {
    this.casoSeleccionado = caso;
    e.stopPropagation();
    menu.toggle(e);
  }

  private obtenerFiscaliasXEntidad() {
    this.subscriptions.push(
      this.maestrosService
        .obtenerFiscaliasXEntidad(this.codDependencia)
        .subscribe({
          next: (resp) => {
            this.fiscaliasPronvinciales = resp.data.map(
              (item: { id: any; nombre: any }) => ({
                value: item.id,
                label: item.nombre,
              })
            );
          },
          error: () => {},
        })
    );
  }
  protected eventoCambiarFiscaliaProvincial(item: any) {
    this.obtenerDespachosXFiscalia(item.value);
  }

  private obtenerDespachosXFiscalia(codigoEntidad: string) {
    this.subscriptions.push(
      this.maestrosService.listarDespacho(codigoEntidad).subscribe({
        next: (resp) => {
          this.despachos = resp.map((item: { id: any; nombre: any }) => ({
            value: item.id,
            label: item.nombre,
          }));
        },
        error: () => {},
      })
    );
  }

  protected eventoVerDelitosPartes(e: Event, caso: any) {
    e.stopPropagation();
    this.dialogService.open(DelitosYPartesModalComponent, {
      showHeader: false,
      data: {
        numeroCaso: caso.codigoCaso,
      },
    });
  }

  //
  private obtenerTipoProceso(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerTipoProceso().subscribe({
        next: (resp) => {
          this.tipoProcesos = resp.data.map(
            (item: { id: any; nombre: any }) => ({
              value: item.id,
              label: item.nombre,
            })
          );
        },
        error: (error) => {},
      })
    );
  }

  private obtenerSubtipoProceso(proceso: number) {
    this.subscriptions.push(
      this.maestrosService.obtenerSubtipoProcesos(proceso).subscribe({
        next: (resp) => {
          this.subtipoProcesos = resp.data.map(
            (item: { id: any; nombre: any }) => ({
              value: item.id,
              label: item.nombre,
            })
          );
          this.fmrBuscar.patchValue({
            subtipoProceso: this.subtipoProcesos[0].value,
          });
          this.eventoCambiarSubtipoProceso(this.subtipoProcesos[0].value);
        },
        error: (error) => {},
      })
    );
  }

  protected obtenerEtapas(proceso: number, subtipoProceso: string) {
    this.subscriptions.push(
      this.maestrosService.obtenerEtapas(proceso, subtipoProceso).subscribe({
        next: (resp) => {
          this.etapas = resp.data.map((item: { id: any; nombre: any }) => ({
            value: item.id,
            label: item.nombre,
          }));
        },
        error: (error) => {},
      })
    );
  }

  //
  protected eventoCambiarTipoProceso(idTipoProceso: any) {
    this.resetearSubtipoProceso();
    this.resetearEtapa();
    this.resetearCuadernoIncidental();
    if (idTipoProceso !== null) {
      this.obtenerSubtipoProceso(idTipoProceso);
    }
  }
  //
  protected eventoCambiarEtapa(idEtapa: any) {
    this.resetearCuadernoIncidental();
    if (idEtapa !== null && idEtapa === '02') {
      this.cuadernoIncidental = [{ value: '001', label: 'Allanamiento' }];
    }
  }

  protected eventoCambiarSubtipoProceso(idSubtipoProceso: any) {
    this.resetearEtapa();
    this.resetearCuadernoIncidental();
    if (idSubtipoProceso !== null) {
      const idProceso = this.fmrBuscar.get('proceso')!.value;
      this.obtenerEtapas(idProceso, idSubtipoProceso);
    }
  }

  protected eventoCambiarDespacho(item: any) {
    this.obtenerFiscalesXDespacho(item.value);
  }

  private obtenerFiscalesXDespacho(codDespacho: string) {
    this.subscriptions.push(
      this.maestrosService.obtenerFiscalesXDespacho(codDespacho).subscribe({
        next: (resp) => {
          this.fiscales = resp.data.map(
            (item: { codigo: any; nombre: any }) => ({
              value: item.codigo,
              label: item.nombre,
            })
          );
        },
        error: (error) => {},
      })
    );
  }

  private resetearSubtipoProceso() {
    this.fmrBuscar.get('subtipoProceso')!.reset();
    this.subtipoProcesos = [];
  }

  private resetearEtapa() {
    this.fmrBuscar.get('etapa')!.reset();
    this.etapas = [];
  }

  private resetearCuadernoIncidental() {
    this.fmrBuscar.get('cuadernoIncidental')!.reset();
    this.cuadernoIncidental = [];
  }

  private eventoVerPetitorio() {
    const _ = this.dialogService.open(VerPetitorioComponent, {
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px' },
      data: this.casoSeleccionado,
    });
  }

  getEtiquetaConfig(caso: any) {
    return getEtiquetaConfig(caso);
  }

  stepsBusquedaAvanzada = [
    {
      attachTo: { element: '.tour-a-1', on: 'bottom' },
      title: '1. Fechas',
      text: 'Seleccione un tipo de fecha para realizar la busqueda',
    },
    {
      attachTo: { element: '.tour-a-3', on: 'bottom' },
      title: '2. Filtros',
      text: 'Puede interactuar con todos los filtros disponibles',
    },
    {
      attachTo: { element: '.tour-a-4', on: 'bottom' },
      title: '3. Buscar',
      text: 'Haga clic en el botón para realizar la busqueda',
    },
    {
      attachTo: { element: '.tour-a-5', on: 'bottom' },
      title: '4. Limpiar',
      text: 'Si desea realizar una nueva busqueda, puede restablecer los campos seleccionados haciendo clic en este botón',
    },
  ];

  stepsComponente = [
    {
      attachTo: { element: '.tour-b-1', on: 'bottom' },
      title: '1. Registro de apelación',
      text: 'Aquí puede ver una pestaña de apelación ingresada al despacho de la fiscalía superior',
    },
    {
      attachTo: { element: '.tour-b-2', on: 'bottom' },
      title: '2. Mas opciones',
      text: 'Haga clic en los tres puntos para mostrar las acciones a realizar sobre la pestaña de apelacion',
    },
    {
      attachTo: { element: '.tour-b-3', on: 'bottom' },
      title: '3. Buscar registros',
      text: 'En la caja de busqueda puede buscar por cualquier dato de la tabla',
    },
  ];
}
