import { Component, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  RangeOptions,
  MonthOption,
  YearOption, listarActoProcesalXEtapaResponse,
} from '@modules/reportes/reportes/monitoreo-fiscal/models/acto-procesales-por-etapa.model';
import { EstadoCasoComponent } from '@modules/reportes/reportes/monitoreo-fiscal/carga-laboral/estado-caso/estado-caso.component';
import { GraficaComponent } from '@modules/reportes/reportes/monitoreo-fiscal/carga-laboral/grafica/grafica.component';
import { IndicadoresComponent } from '@modules/reportes/reportes/monitoreo-fiscal/carga-laboral/indicadores/indicadores.component';
import { TipoArchivoType } from '@core/types/exportar.type';
import { ExportarService } from '@services/shared/exportar.service';
import { MessageService } from 'primeng/api';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';


import {
  ActoProcesalesPorEtapaService
} from "@modules/reportes/reportes/monitoreo-fiscal/services/acto-procesales-por-etapa.service";
import {JwtHelperService} from "@auth0/angular-jwt";
import {Constants} from "@constants/mesa-turno";


interface ActoProcesal {
  noEtapa: string;
  actoProcesalUltimo: string | null;
  cantidad: number;
}
type ResultadoAgrupado = Record<string, Record<string, number>>;
@Component({
  selector: 'app-acto-procesales-por-etapa',
  standalone: true,
  imports: [
    Button,
    CalendarModule,
    DropdownModule,
    MultiSelectModule,
    PaginatorModule,
    ReactiveFormsModule,
    EstadoCasoComponent,
    GraficaComponent,
    IndicadoresComponent,
    CmpLibModule,
    TabViewModule,
    TableModule,
    ChartModule,
  ],
  providers: [MessageService],
  templateUrl: './acto-procesales-por-etapa.component.html',
  styleUrl: './acto-procesales-por-etapa.component.scss',
})
export default class ActoProcesalesPorEtapaComponent implements OnInit {


  activeTab: number = 0;
  public filterForm: FormGroup;
  public visualizarTablas : boolean = true;

  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly exportarService: ExportarService = inject(ExportarService);
  private readonly messageService: MessageService = inject(MessageService);
  private readonly actoProcesalesPorEtapaService: ActoProcesalesPorEtapaService =
    inject(ActoProcesalesPorEtapaService);

  public rangeOptions: RangeOptions[] = [];
  public yearOptions: YearOption[] = [];
  public mesOptions: MonthOption[] = [];
  public fechaInicio: string | null = '01/01/2025';
  public fechaFin: string | null = '31/12/2025';
  public mostrarMonitoreo: boolean = false;
  public selectedEtapa: any = null;
  public actoProcesalesConcluidos : ActoProcesal[] = [];
  public actoProcesalesProceso : ActoProcesal[] = [];
  public despachoUsuario: string = '';

  actosPorEtapa: Record<string, { actoProcesal: string; cantidad: number }[]> = {};
  actosPorEtapaProceso: Record<string, { actoProcesal: string; cantidad: number }[]> = {};
  etapas: string[] = [];
  etapasProceso: string[] = [];

  enProcesoChart : any;
  concluidoChart : any;

  etapasData = [
    { etapa: 'Calificación', concluidos: 150, enProceso: 50 },
    { etapa: 'Preliminar', concluidos: 100, enProceso: 50 },
    { etapa: 'Preparatoria', concluidos: 100, enProceso: 50 },
    { etapa: 'Intermedia', concluidos: 100, enProceso: 50 },
    { etapa: 'Juzgamiento', concluidos: 100, enProceso: 50 },
  ];


  constructor() {
    this.rangeOptions = [
      { label: 'Anual', value: 'A' },
      { label: 'Mensual', value: 'M' },
      { label: 'Intervalo', value: 'I' },
    ];

    this.filterForm = this.fb.group({
      periodo: [this.rangeOptions[0]],
      fechaInicio: [null],
      fechaFin: [null],
      anio: [null],
      mes: [null],
    });
  }



  ngOnInit() {

    this.obtenerDatosDelToken();
    this.generateYearOptions();
    this.generateMonthOptions();

    this.filterForm.patchValue({
      periodo: this.rangeOptions[0],
      fechaInicio: [null],
      fechaFin: [null],
      anio: this.yearOptions.find((y) => y.value === new Date().getFullYear()),
      mes: [null],
    });

    this.search();
    //this.procesarDatos();
  }


  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  private obtenerDatosDelToken() {
    let usuarioToken: any;
    const helper = new JwtHelperService();
    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);
    const decodedToken = helper.decodeToken(token.token);

    usuarioToken = decodedToken.usuario;
    this.despachoUsuario = usuarioToken.codDespacho;

    console.log('el despacho del usuario conectado es  : ' + this.despachoUsuario);

  }

  public search(): void {
    const formValues = this.filterForm.value;


    const request = {
      codigoDespacho: this.despachoUsuario,
      fechaIni: formValues.periodo.value ==='I' ? this.formatDate(formValues.fechaInicio) : null,
      fechaFin: formValues.periodo.value ==='I' ? this.formatDate(formValues.fechaFin) : null,
      anio: formValues.anio?.value?.toString() || '',
      mes: formValues.mes?.value?.toString().padStart(2, '0') || '',
    };

    if (this.filterForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        detail: 'Complete todos los campos requeridos',
      });
      return;
    }

    this.actoProcesalesPorEtapaService.listarActoProcesalXEtapa(request).subscribe(
      (response) => {

        this.procesarRespuesta(response);
        this.mostrarMonitoreo = false;
        this.procesarDatos();
      },
      (error) => {
        if (error.status === 422) {
          this.visualizarTablas = false;
        }
      }
    );
  }

  generarGrafico() {

    const actosProcesalesConcluido = [...new Set(this.actoProcesalesConcluidos.map(d => d.actoProcesalUltimo))]; // Obtener etapas únicas

    const cantidadesConcluido = actosProcesalesConcluido.map(actoProcesal =>
      this.actoProcesalesConcluidos.filter(d => d.actoProcesalUltimo === actoProcesal).reduce((sum, d) => sum + d.cantidad, 0)
    );

    this.concluidoChart = {
      labels: actosProcesalesConcluido,
      datasets: [
        {
          label: 'Cantidad de Casos',
          data: cantidadesConcluido,
          backgroundColor: ['#66BB6A'],
          borderColor: '#000000',
          borderWidth: 1,
        },
      ],
    };

    const actosProcesalesEnProceso = [...new Set(this.actoProcesalesProceso.map(d => d.actoProcesalUltimo))]; // Obtener etapas únicas

    const cantidadesEnProceso = actosProcesalesEnProceso.map(actoProcesal =>
      this.actoProcesalesProceso.filter(d => d.actoProcesalUltimo === actoProcesal).reduce((sum, d) => sum + d.cantidad, 0)
    );

    this.enProcesoChart = {
      labels: actosProcesalesEnProceso,
      datasets: [
        {
          label: 'Cantidad de Casos',
          data: cantidadesEnProceso,
          backgroundColor: ['#FFA500'],
          borderColor: '#000000',
          borderWidth: 1,
        },
      ],
    };

  }


  procesarDatos() {
    const agrupado = this.agruparActosPorEtapa(this.actoProcesalesConcluidos);
    const agrupadoProceso = this.agruparActosPorEtapa(this.actoProcesalesProceso);
    this.etapas = Object.keys(agrupado);
    this.etapasProceso = Object.keys(agrupadoProceso);

    // Determinar el número máximo de filas en una tabla
    const maxFilas = Math.max(
      ...this.etapas.map(etapa => Object.keys(agrupado[etapa]).length)
    );

    const maxFilasProceso = Math.max(
      ...this.etapasProceso.map(etapa => Object.keys(agrupadoProceso[etapa]).length)
    );

    this.actosPorEtapa = Object.fromEntries(
      this.etapas.map(etapa => {
        let actos = Object.entries(agrupado[etapa]).map(([actoProcesal, cantidad]) => ({ actoProcesal, cantidad }));

        // Rellenar con filas vacías si es necesario
        while (actos.length < maxFilas) {
          actos.push({ actoProcesal: "", cantidad: 0 });
        }

        return [etapa, actos];
      })
    );

    this.actosPorEtapaProceso = Object.fromEntries(
      this.etapasProceso.map(etapa => {
        let actos = Object.entries(agrupadoProceso[etapa]).map(([actoProcesal, cantidad]) => ({ actoProcesal, cantidad }));

        // Rellenar con filas vacías si es necesario
        while (actos.length < maxFilasProceso) {
          actos.push({ actoProcesal: "", cantidad: 0 });
        }

        return [etapa, actos];
      })
    );

  }


  agruparActosPorEtapa(data: ActoProcesal[]): ResultadoAgrupado {
    return data.reduce((acc, item) => {
      const { noEtapa, actoProcesalUltimo, cantidad } = item;

      if (!acc[noEtapa]) {
        acc[noEtapa] = {};
      }

      const acto = actoProcesalUltimo || "SIN ACTO PROCESAL";
      acc[noEtapa][acto] = (acc[noEtapa][acto] || 0) + cantidad;

      return acc;
    }, {} as ResultadoAgrupado);
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  private procesarRespuesta(
    response: listarActoProcesalXEtapaResponse[]
  ): void {
    const etapasMap = new Map<
      string,
      { concluidos: number; enProceso: number }
    >();

    response.forEach((item) => {
      if (!etapasMap.has(item.noEtapa)) {
        etapasMap.set(item.noEtapa, { concluidos: 0, enProceso: 0 });
      }

      const etapa = etapasMap.get(item.noEtapa)!;

      if (item.noVEestado.toUpperCase() === 'CONCLUIDO') {
        etapa.concluidos += item.cantidad;
      } else {
        etapa.enProceso += item.cantidad;
      }
    });

    this.etapasData = Array.from(etapasMap.entries()).map(
      ([etapa, valores]) => ({
        etapa,
        concluidos: valores.concluidos,
        enProceso: valores.enProceso,
      })
    );

    this.ordenarEtapas();

    //acá grabo los concluidos
    this.actoProcesalesConcluidos = response
      .filter(({ noVEestado }) => noVEestado === "CONCLUIDO")
      .map(({ noEtapa, actoProcesalUltimo, cantidad }) => ({
      noEtapa,
      actoProcesalUltimo,
      cantidad,
    }));

    //acá grabo los en procesos
    this.actoProcesalesProceso = response
      .filter(({ noVEestado }) => noVEestado !== "CONCLUIDO")
      .map(({ noEtapa, actoProcesalUltimo, cantidad }) => ({
        noEtapa,
        actoProcesalUltimo,
        cantidad,
      }));

    this.generarGrafico();


  }

  private ordenarEtapas(): void {
    const ordenPredefinido = [
      'CALIFICACIÓN',
      'PRELIMINAR',
      'PREPARATORIA',
      'INCOACIÓN A PROCESO INMEDIATO',
      'INTERMEDIA',
      'JUZGAMIENTO',
    ];

    this.etapasData.sort((a, b) => {
      return (
        ordenPredefinido.indexOf(a.etapa.toUpperCase()) -
        ordenPredefinido.indexOf(b.etapa.toUpperCase())
      );
    });
  }

  private actualizarFechasVisuales(): void {
    const formValues = this.filterForm.value;
    this.fechaInicio = formValues.fechaInicio
      ? this.formatDisplayDate(formValues.fechaInicio)
      : '01/01/' + formValues.anio?.value;

    this.fechaFin = formValues.fechaFin
      ? this.formatDisplayDate(formValues.fechaFin)
      : '31/12/' + formValues.anio?.value;
  }

  private formatDisplayDate(date: Date): string {
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  clearFilters() {
    // this.primeraCarga = true;

    this.filterForm.reset({
      periodo: this.rangeOptions[0],
      fechaInicio: null, //new Date('' + this.yearOptions[0].value + '-01-01'),
      fechaFin: null, //new Date('' + this.yearOptions[0].value + '-12-31'),
      anio: this.yearOptions[0],
      mes: null,
    });

    /* this.cargaLaboral();
    this.cargarPorEtapa();
    this.updateDisplayDates(); */
  }

  private generateYearOptions() {
    const currentYear = new Date().getFullYear();
    this.yearOptions = Array.from({ length: 5 }, (_, index) => ({
      label: (currentYear - index).toString(),
      value: currentYear - index,
    }));
  }

  get periodoValue() {
    return this.filterForm.get('periodo')?.value?.value;
  }

  public onPeriodoChange(event: any) {
    const periodoValue = event.value.value;

    if (periodoValue === 'A') {
      this.filterForm.get('fechaInicio')?.setValue(null);
      this.filterForm.get('fechaFin')?.setValue(null);
      this.filterForm.get('mes')?.setValue(null);
    } else if (periodoValue === 'M') {
      this.filterForm.get('fechaInicio')?.setValue(null);
      this.filterForm.get('fechaFin')?.setValue(null);
    } else if (periodoValue === 'I') {
      this.filterForm.get('anio')?.setValue(null);
      this.filterForm.get('mes')?.setValue(null);
    }
  }

  private generateMonthOptions() {
    this.mesOptions = [
      { label: 'Enero', value: 1 },
      { label: 'Febrero', value: 2 },
      { label: 'Marzo', value: 3 },
      { label: 'Abril', value: 4 },
      { label: 'Mayo', value: 5 },
      { label: 'Junio', value: 6 },
      { label: 'Julio', value: 7 },
      { label: 'Agosto', value: 8 },
      { label: 'Septiembre', value: 9 },
      { label: 'Octubre', value: 10 },
      { label: 'Noviembre', value: 11 },
      { label: 'Diciembre', value: 12 },
    ];
  }

  protected eventoMostrarOcultarMonitoreo(): void {
    this.mostrarMonitoreo = !this.mostrarMonitoreo;
  }

  public exportarPdfExcel(exportType: TipoArchivoType): void {
    /*
    if (this.results.length > 0) {
      const headers = [
        'Fiscal',
        'Resueltos',
        '% Resueltos',
        'En trámite',
        '% En trámite',
        'Total',
      ];
      const data: any[] = [];

      this.results.forEach((cargaLaboralResponse: CargaLaboralResponse) => {
        const row = {
          Fiscal: cargaLaboralResponse.fiscal,
          Resueltos: cargaLaboralResponse.resueltos,
          '% Resueltos': cargaLaboralResponse.porcentajeResuelto,
          'En trámite': cargaLaboralResponse.tramites,
          '% En trámite': cargaLaboralResponse.porcentajeTramite,
          Total: cargaLaboralResponse.total,
        };
        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(
          data,
          headers,
          'Carga-Laboral-Despacho'
        )
        : this.exportarService.exportarAExcel(
          data,
          headers,
          'Carga-Laboral-Despacho'
        );
      return;
    } */

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
  }

  protected icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  // Función para calcular el total de item.cantidad
  /*getTotalCantidad(items: any[]): number {
    return items.reduce((total, item) => total + (item.cantidad || 0), 0);
  } */

  getTotalCantidad(items: any[]): number {
    return items.reduce((total, item) => {
      // Verifica si item.cantidad es un número válido
      if (typeof item.cantidad === 'number' && !isNaN(item.cantidad)) {
        return total + item.cantidad;
      }
      // Si no es un número válido, ignóralo y devuelve el total acumulado
      return total;
    }, 0);
  }

}
