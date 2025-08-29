import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { EtiquetaCasoComponent } from '@core/components/consulta-casos/components/carpeta-caso/etiqueta-caso/etiqueta-caso.component';
import { ConsultaCasosGestionService } from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { DelitosYPartesModalComponent } from '@core/components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { TipoVisor } from '@core/components/modals/visor-documental-caso-elevado/model/visor-documento.model';

import { PrevisualizarDocumentoModalComponent } from '@core/components/modals/visor-documental-caso-elevado/previsualizar-documento-modal.component';
import { VisorEfeModalComponent } from '@core/components/modals/visor-efe-modal/visor-efe-modal.component';
import { TipoExportarEnum } from '@core/constants/constants';
import { PerfilJerarquia } from '@core/models/usuario-auth.model';
import { ExportarService } from '@core/services/shared/exportar.service';
import { AsignacionService } from '@core/services/superior/asignacion/asignacion.service';
import { ElevacionActuadosService } from '@core/services/superior/elevacion-actuados/elevacion-actuados.service';
import { rangoFechaXDefecto } from '@core/utils/date';
import { DateMaskModule } from '@directives/date-mask.module';
import {
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import { MaestroService } from '@services/shared/maestro.service';
import {
  Constants,
  DateFormatPipe,
  IconAsset,
  IconUtil,
  MathUtil,
  obtenerCasoHtml,
  StringUtil,
} from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule, TableService } from 'primeng/table';
import { Subscription } from 'rxjs';
import { InformacionCasoComponent } from '@components/modals/informacion-caso/informacion-caso.component';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { AlertaData } from '@interfaces/comunes/alert';
import { Etapa } from '@interfaces/superior/administracion-casos/administracion-casos.model';
import { getEtiquetaConfig } from '@core/utils/utils';
import { ReplacePipe } from 'src/app/replace.pipe';

@Component({
  selector: 'app-casos-observados',
  standalone: true,
  providers: [MessageService, DialogService, DatePipe, TableService],
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
    TableModule,
    ProgressBarModule,
    MenuModule,
    NgxCfngCoreModalDialogModule,
    RouterLink,
    EtiquetaCasoComponent,
    DateFormatPipe,
  ],
  templateUrl: './casos-observados.component.html',
  styleUrl: './casos-observados.component.scss',
})
export class CasosObservadosComponent implements OnInit {
  protected esVisibleFiltros = false;
  protected PerfilJerarquia = PerfilJerarquia;
  private idTipoProcesoSeleccionado: number = 0;

  protected clasificacion: SelectItem[] = [
    {
      value: '0',
      label: 'Principal',
    },
    {
      value: '2',
      label: 'Cuaderno Incidental',
    },
    {
      value: '5',
      label: 'Pestana de Apelación',
    },
  ];

  protected etapas: Etapa[] = [];

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
  protected obtenerCasoHtml = obtenerCasoHtml;

  protected etiquetaClasesCss: { [key: string]: string } = {
    '1': 'bg-teal-100 text-teal-800',
    '2': 'bg-teal-100 text-teal-800',
    '3': 'bg-teal-100 text-teal-800',
    '4': 'bg-purple-100 text-purple-400',
    '5': 'bg-teal-100 text-teal-800',
  };

  protected tituloTootip: string = 'Se mostrará en color:';
  private casoSeleccionado: any;
  public referenciaModal!: DynamicDialogRef;

  protected fiscaliasPronvinciales: SelectItem[] = [];
  protected despachos: SelectItem[] = [];
  protected fiscales: SelectItem[] = [];
  private readonly subscriptions: Subscription[] = [];
  private readonly codDependencia: string;
  protected temporizadorBusqueda: any;
  protected opcionesCaso: MenuItem[] = [
    {
      label: 'Visor documental',
      command: () => this.eventoVisorDocumental(),
    },
    {
      label: 'Ver historial del caso',
      command: () => this.abrirModalInformacionCaso(),
    },
    {
      label: 'Ver delitos y partes',
      command: () => this.eventoVerDelitosPartes(),
    },
  ];
  protected totalRegistros = {
    total: 0,
    casos: 0,
    pestanasApelacionPorAsignar: 0,
  };
  /* Particulaes */
  public tipoProcesos: any[] = [];
  public tipoSubProceso: any[] = [];
  protected tipoElevacion: { value: number; label: string }[] = [
    { value: 724, label: 'Elevación de Actuados' },
    { value: 726, label: 'Apelaciones de Auto' },
    { value: 727, label: 'Apelaciones de Sentencia' },
    { value: 725, label: 'Contienda de Competencia' },
    { value: 728, label: 'Elevación en Consulta' },
    { value: 729, label: 'Exclusión Fiscal' },
  ];
  protected busquedaPorTextoRealizada = false;

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
    private readonly exportarService: ExportarService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly asignacionService: AsignacionService,
    private readonly consultaCasosGestionService: ConsultaCasosGestionService
  ) {
    const helper = new JwtHelperService();
    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);
    const decodedToken = helper.decodeToken(token.token);
    this.codDependencia = decodedToken.usuario.codDependencia;
  }

  ngOnInit(): void {
    this.crearFormulario();
    this.obtenerFiscaliasXEntidad();
    this.eventoBuscar();
    this.datosPorDefecto();
    this.obtenerTipoProcesos();
    //this.obtenerTipoElevacion();
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

  private eventoVerDelitosPartes() {
    this.dialogService.open(DelitosYPartesModalComponent, {
      showHeader: false,
      data: {
        numeroCaso: this.casoSeleccionado.codigoCaso,
      },
    });
  }

  protected eventoVerObservaciones(casoSeleccionado: any) {
    this.elevacionActuadosService
      .getInformacionDocumental(
        casoSeleccionado.idCaso,
        casoSeleccionado.idTipoElevacion,
        casoSeleccionado.idActoTramiteCaso
      )
      .subscribe({
        next: (response: any) => {
          if (response.codigoCaso == null) {
            this.modalDialogService.warning(
              '',
              'No se encontraron datos del caso.'
            );
          } else {
            this.mostrarVisorDocumental(response, casoSeleccionado);
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
  protected eventoCambiarDespacho(item: any) {
    this.obtenerFiscalesXDespacho(item.value);
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
          tipo: TipoVisor.VerObservacion,
          observacion: {
            descripcion: caso.observacion,
            fecha: caso.fechaObservacion,
            hora: caso.horaObservacion,
            fiscalQueObserva: informacion.fiscalQueObserva
          },
        },
      }
    );
  }

  protected eventoExportar(tipoExportar: TipoExportarEnum): void {
    if (this.listaCasosOriginal.length > 0) {
      const headers = [
        'Número de caso',
        'Etapa',
        'Tramite de Elevacion',
        'Fiscal',
        'Nombre Despacho',
        'Entidad',
        'Fecha Elevacion',
        'Fecha Observacion',
        'Observacion',
        'Tipo Elevacion',
      ];
      const data: any[] = [];
      this.listaCasosOriginal.forEach((c: any) => {
        const row = {
          'Número de caso': c.codigoCaso,
          Etapa: c.etapa,
          'Tramite de Elevacion': c.tramite,
          Fiscal: c.fiscal,
          'Nombre Despacho': c.despachoFiscalOrigen,
          Entidad: c.nombreEntidad,
          'Fecha Elevacion': c.fechaElevacion + ' ' + c.horaElevacion,
          'Fecha Observacion': c.fechaObservacion + ' ' + c.horaObservacion,
          Observacion: c.observacion,
          'Tipo Elevacion': c.tipoElevacion,
        };
        data.push(row);
      });

      tipoExportar === TipoExportarEnum.Pdf
        ? this.exportarService.exportarAPdf(
            data,
            headers,
            'casos_observados_superior'
          )
        : this.exportarService.exportarAExcel(
            data,
            headers,
            'casos_observados_superior'
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
    this.contarRegistrosCasos(this.listaCasos);
    this.paginacionConfiguracion.data.data = this.listaCasos;
    this.paginacionConfiguracion.data.total = this.listaCasos.length;
    this.actualizarListaCasosPaginacion(this.listaCasos, true);
  }
  protected eventoMostrarOcultarFiltros(): void {
    this.esVisibleFiltros = !this.esVisibleFiltros;
    if (this.esVisibleFiltros) {
      this.fmrBuscar.get('filtroTiempo')!.setValue(null);
    } else {
      this.fmrBuscar.get('filtroTiempo')!.setValue('1');
    }
  }

  private obtenerDatosCasos(datos: any) {
    this.asignacionService.obtenerObservados(datos).subscribe({
      next: (resp: any) => {
        console.log('observados', resp);
        this.listaCasos = resp;
        this.listaCasosOriginal = resp;
        this.paginacionConfiguracion.data.data = this.listaCasos;
        this.paginacionConfiguracion.data.total = this.listaCasos.length;
        this.actualizarListaCasosPaginacion(this.listaCasos, false);
        this.contarRegistrosCasos(this.listaCasosOriginal);
      },
    });
    const buscado = this.fmrBuscar.get('buscar')!.value;
    if (buscado !== '') {
      this.eventoBuscarSegunTexto();
    }
  }
  protected obtenerActoProcesal(textoLegal: string): string {
    if (!textoLegal) return '';
    const palabras = textoLegal.toLowerCase().split(' ');

    const ignorar = ['apelación', 'de'];

    const palabrasRelevantes = palabras.filter(
      (palabra) => !ignorar.includes(palabra)
    );

    if (palabrasRelevantes.length === 0) {
      return (
        textoLegal.charAt(0).toUpperCase() + textoLegal.slice(1).toLowerCase()
      );
    }
    const resultado = palabrasRelevantes.join(' ');
    return resultado.charAt(0).toUpperCase() + resultado.slice(1);
  }
  private contarRegistrosCasos(listaCasos: any[]) {
    //Registros
    this.totalRegistros.total = listaCasos.length;
    this.totalRegistros.casos = listaCasos.filter(
      (elm) => elm.tipoClasificadorExpediente === '000'
    ).length; //Casos
    this.totalRegistros.pestanasApelacionPorAsignar = listaCasos.filter(
      (elm) =>
        elm.tipoClasificadorExpediente === '020' ||
        elm.tipoClasificadorExpediente === '021'
    ).length; //Pestañas de apelación por asignar
  }

  private datosPorDefecto(): void {
    const fechaRango = rangoFechaXDefecto();
    this.fmrBuscar.patchValue({
      filtroTiempo: '1',
      tipoFecha: '1',
      fechaInicio: fechaRango.inicio,
      fechaFin: fechaRango.fin,
    });
  }

  protected eventoLimpiar() {
    this.fmrBuscar.reset();
    this.datosPorDefecto();
  }

  protected eventoBuscar() {
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
  //#endregion

  //#region Eventos para consultar los datos a de los servicios

  public eventoCambiarFiltroTiempo(filtroTiempo: any) {
    this.fmrBuscar.get('buscar')!.setValue('');
    this.obtenerDatosCasos({
      filtroTiempo: filtroTiempo,
    });
  }

  private crearFormulario(): void {
    const fechaRango = rangoFechaXDefecto();
    this.fmrBuscar = this.fb.group({
      buscar: [''],
      filtroTiempo: ['1'],
      tipoFecha: ['1'],
      fechaInicio: [fechaRango.inicio],
      fechaFin: [fechaRango.fin],
      tipoElevacion: [null],
      clasificacion: [null],
      tipoProceso: [null],
      tipoSubProceso: [null],
      etapa: [null],
      fiscaliaProvincial: [null],
      despacho: [null],
      fiscal: [null],
    });
  }

  protected eventoCambiarPagina(datos: any) {
    this.paginacionCondicion.page = datos.page;
    this.paginacionCondicion.limit = datos.limit;
    this.actualizarListaCasosPaginacion(datos.data, datos.resetPage);
  }

  private actualizarListaCasosPaginacion(datos: any, reiniciar: boolean) {
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

  protected eventoCambiarTipoProceso(item: any) {
    const idTipoProceso = item.value;
    this.idTipoProcesoSeleccionado = idTipoProceso;
    if (idTipoProceso !== null) {
      this.obtenerTipoSubProceso(idTipoProceso);
      this.etapas = [];
      this.fmrBuscar.get('etapa')!.setValue(null);
    }
  }

  private obtenerTipoProcesos() {
    this.subscriptions.push(
      this.maestrosService.obtenerTipoProceso().subscribe({
        next: (resp) => (this.tipoProcesos = resp.data),
      })
    );
  }

  protected eventoCambiarTipoSubProceso(item: any) {
    const idTipoSubProceso = item.value;
    if (idTipoSubProceso !== null) {
      this.obtenerEtapaSegunTipoProceso(
        this.idTipoProcesoSeleccionado,
        idTipoSubProceso
      );
    }
  }

  private obtenerTipoSubProceso(idTipoProceso: number) {
    this.subscriptions.push(
      this.maestrosService.obtenerSubtipoProcesos(idTipoProceso).subscribe({
        next: (resp) => (this.tipoSubProceso = resp.data),
      })
    );
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
        error: () => {},
      })
    );
  }

  protected etiquetas2(caso: any) {
    return this.consultaCasosGestionService.getEtiquetaXTipoElevacion(
      caso.idTipoElevacion,
      {
        esContiendaCompetencia: caso.flTipoContienda,
        nuApelacion: caso.nuApelacion,
        nuCuaderno: caso.nuCuaderno,
      },
      '2'
    );
  }

  private abrirModalInformacionCaso(): void {
    if (
      this.casoSeleccionado.codigoCaso !== null &&
      this.casoSeleccionado.idCaso !== null
    ) {
      this.referenciaModal = this.dialogService.open(InformacionCasoComponent, {
        width: '1267px',
        height: '100vh',
        showHeader: false,
        contentStyle: {
          padding: '20',
          'border-radius': '15px',
          'background-color': '#f5f2e0',
        },
        data: {
          numeroCaso: this.casoSeleccionado.codigoCaso,
          idCaso: this.casoSeleccionado.idCaso,
          bandeja: '',
          soloLectura: true,
        },
      });

      this.referenciaModal.onClose.subscribe({
        next: () => this.eventoBuscar(),
        error: (error) => console.error(error),
      });
    } else {
      this.mensajeError('Aviso', 'No se encontró el id del caso');
    }
  }

  private mensajeError(mensaje: string, submensaje: string) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      },
    } as DynamicDialogConfig<AlertaData>);
  }

  private obtenerEtapaSegunTipoProceso(
    idTipoProceso: number,
    idTipoSubProceso: string
  ) {
    this.subscriptions.push(
      this.maestrosService
        .obtenerEtapas(idTipoProceso, idTipoSubProceso)
        .subscribe({
          next: (resp) => (this.etapas = resp.data),
        })
    );
  }
  getEtiquetaConfig(caso: any) {
    return getEtiquetaConfig(caso);
  }
}
