// labor-statistics.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

// PrimeNG Imports
import { CalendarModule } from 'primeng/calendar';
import {
  CargaLaboralPorEtapaResponse,
  CargaLaboralRequest,
  CargaLaboralResponse,
  FiscalDespachoRequest,
  FiscalDespachoResponse,
  MonthOption,
  Totales,
  YearOption,
} from '@modules/reportes/reportes/monitoreo-fiscal/models/carga-laboral.model';
import { CargaLaboralService } from '@modules/reportes/reportes/monitoreo-fiscal/services/carga-laboral.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { Constants } from '@constants/mesa-turno';
import { JwtHelperService } from '@auth0/angular-jwt';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { TipoArchivoType } from '@core/types/exportar.type';
import { ExportarService } from '@services/shared/exportar.service';
import { MessageService } from 'primeng/api';
import { IndicadoresComponent } from './indicadores/indicadores.component';
import { EstadoCasoComponent } from './estado-caso/estado-caso.component';
import { GraficaComponent } from './grafica/grafica.component';
import { TablaComponent } from './tabla/tabla.component';
import { TablaIndicadoresComponent } from './tabla-indicadores/tabla-indicadores.component';

interface EstadoCaso {
  etapa: string;
  cantidad: number;
}
@Component({
  selector: 'app-carga-laboral',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    DropdownModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    MultiSelectModule,
    CmpLibModule,
    IndicadoresComponent,
    EstadoCasoComponent,
    GraficaComponent,
    TablaComponent,
    TablaIndicadoresComponent,
  ],
  providers: [MessageService],
  templateUrl: './carga-laboral.component.html',
  styleUrl: './carga-laboral.component.scss',
})
export default class CargaLaboralComponent implements OnInit {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly cargaLaboralService: CargaLaboralService =
    inject(CargaLaboralService);
  private readonly exportarService: ExportarService = inject(ExportarService);
  private readonly messageService: MessageService = inject(MessageService);

  private primeraCarga: boolean = true;
  public mostrarMonitoreo: boolean = false;

  public filterForm: FormGroup;
  public results: CargaLaboralResponse[] = [];
  public cargaPorEtapa: CargaLaboralPorEtapaResponse[] = [];
  public cargaPorEtapaFiltradas: CargaLaboralPorEtapaResponse[] = [];
  public resultsFiscales: FiscalDespachoResponse[] = [];
  public fiscalesSeleccionados!: FiscalDespachoResponse[];
  public yearOptions: YearOption[] = [];
  public mesOptions: MonthOption[] = [];
  public estadosEnTramite: EstadoCaso[] = [];
  public estadosResueltos: EstadoCaso[] = [];
  public totalesPorEtapa: Totales;
  public sinSeleccionFiscales: boolean = false;
  public dependencia: string = '';
  public codigoCargo: string = '';
  public codigoUsuario: string = '';
  public despachoUsuario: string = '';
  public datosGrafico: any;

  public fechaInicio: string | null = '';
  public fechaFin: string | null = '';
  public distritoFiscal: string = '';
  public dependenciaFiscal: string = '';

  public rangeOptions = [
    { label: 'Anual', value: 'A' },
    { label: 'Mensual', value: 'M' },
    { label: 'Intervalo', value: 'I' },
  ];

  protected tablaInfo = {
    fechaInicio: this.fechaInicio,
    fechaFin: this.fechaFin,
    distritoFiscal: this.distritoFiscal,
    dependenciaFiscal: this.dependenciaFiscal,
    getTotalResueltos: () => this.getTotalResueltos(),
    getPorcentajeResueltosFormateado: () =>
      this.getPorcentajeResueltosFormateado(),
    getTotalEnTramite: () => this.getTotalEnTramite(),
    getPorcentajeEnTramiteFormateado: () =>
      this.getPorcentajeEnTramiteFormateado(),
    getGrandTotal: () => this.getGrandTotal(),
  };

  constructor() {
    this.filterForm = this.fb.group({
      periodo: [this.rangeOptions[0], Validators.required],
      fechaInicio: [null],
      fechaFin: [null],
      anio: [this.yearOptions[0]],
      mes: [null],
      fiscales: [null, Validators.required],
    });

    this.totalesPorEtapa = {
      pendientes: 0,
      tramites: 0,
      resueltos: 0,
      total: 0,
    };
  }

  ngOnInit() {
    this.generateYearOptions();
    this.generateMonthOptions();
    this.obtenerDatosDelToken();
    this.fiscales();
    this.filterForm.patchValue({
      periodo: this.rangeOptions[0],
      anio: this.yearOptions[0],
      mes: null,
      fechaInicio: null,
      fechaFin: null,
    });

    this.manejarSeleccion(1);
    this.cargaLaboral();
    this.cargarPorEtapa();
    this.primeraCarga = true;
    this.updateDisplayDates();
  }

  protected icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  private obtenerDatosDelToken() {
    let usuarioToken: any;
    const helper = new JwtHelperService();
    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);
    const decodedToken = helper.decodeToken(token.token);

    usuarioToken = decodedToken.usuario;

    this.dependencia = usuarioToken.codDependencia;
    this.codigoCargo = usuarioToken.codCargo;
    this.codigoUsuario = usuarioToken.usuario;
    this.despachoUsuario = usuarioToken.codDespacho;
  }

  private obtenerPayload(): CargaLaboralRequest {
    const formValues = this.filterForm.value;

    return {
      fiscales: this.filterForm.get('fiscales')?.value,
      indicadorTodos: this.primeraCarga ? 1 : 0,
      codigoDespacho: this.primeraCarga ? this.despachoUsuario : null,
      fechaInicio: formValues.fechaInicio
        ? this.cargaLaboralService.formatDate(formValues.fechaInicio)
        : null,
      fechaFin: formValues.fechaFin
        ? this.cargaLaboralService.formatDate(formValues.fechaFin)
        : null,
      anio: formValues.anio ? formValues.anio.value.toString() : null,
      mes: formValues.mes
        ? String(formValues.mes.value).padStart(2, '0')
        : null,
    };
  }

  private obtenerFiscalesPayload(): FiscalDespachoRequest {
    return {
      codigoDependencia: this.dependencia,
      codigoCargo: this.codigoCargo,
      codigoDespacho: this.despachoUsuario,
      usuario: this.codigoCargo === '00000009' ? this.codigoUsuario : null,
    };
  }

  public onChangeFiscalesSeleccionados(event: any): void {
    this.fiscalesSeleccionados = event.value;
    console.log(this.fiscalesSeleccionados);
    this.sinSeleccionFiscales = this.fiscalesSeleccionados.length === 0;
  }

  public fiscales() {
    this.cargaLaboralService
      .listarFiscales(this.obtenerFiscalesPayload())
      .subscribe({
        next: (response) => {
          this.resultsFiscales = response;
        },
        error: (error) => {
          console.error('Error al obtener datos:', error);
        },
      });
  }

  public search(): void {
    this.primeraCarga = false;
    this.cargaLaboral();
    this.cargarPorEtapa();
  }

  private cargaLaboral(): void {
    this.cargaLaboralService
      .listarCargaLaboral(this.obtenerPayload())
      .subscribe({
        next: (response) => {
          this.results = response;
          this.distritoFiscal = this.results[0].distritoFiscal;
          this.dependenciaFiscal =
            this.results[0].dependencia + ' ' + this.results[0].despacho;

          this.tablaInfo = {
            ...this.tablaInfo,
            distritoFiscal: this.distritoFiscal,
            dependenciaFiscal: this.dependenciaFiscal,
          };
        },
        error: (error) => {
          console.error('Error al obtener datos:', error);
          if (error.status === 422) {
            this.results = []; // o this.results = null;
            this.distritoFiscal = '';
            this.dependenciaFiscal = '';
          }
        },
      });

    this.updateDisplayDates();
  }

  private cargarPorEtapa(): void {
    this.cargaLaboralService
      .listarCargaLaboralPorEtapa(this.obtenerPayload())
      .subscribe({
        next: (responseData: CargaLaboralPorEtapaResponse[]) => {
          this.cargaPorEtapa = responseData;

          const resumenPorEtapa: Totales = this.obtenerTotales(
            this.cargaPorEtapa
          );
          this.totalesPorEtapa = resumenPorEtapa;
          this.filtrarYOrganizarDatos(this.cargaPorEtapa);
          this.manejarSeleccion(1);
        },
        error: (errorData: Error) => {
          console.error('Error al obtener datos:', errorData);
        },
      });
  }

  public exportarPdfExcel(exportType: TipoArchivoType): void {
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
    }

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
  }

  clearFilters() {
    this.primeraCarga = true;

    this.filterForm.reset({
      periodo: this.rangeOptions[0],
      fechaInicio: null, //new Date('' + this.yearOptions[0].value + '-01-01'),
      fechaFin: null, //new Date('' + this.yearOptions[0].value + '-12-31'),
      anio: this.yearOptions[0],
      mes: null,
      fiscales: null,
      indicadorTodos: this.primeraCarga ? 1 : 0,
      codigoDespacho: this.primeraCarga ? this.despachoUsuario : null,
    });

    this.cargaLaboral();
    this.cargarPorEtapa();
    this.updateDisplayDates();
  }

  public getTotalResueltos(): number {
    return this.results.reduce((sum, record) => sum + record.resueltos, 0);
  }

  private getTotalPorcentajeResueltos(): number {
    if (!this.results.length) return 0;

    return (
      this.results.reduce((sum, record) => {
        // Convertir el string "12.20%" a número 12.20
        const percentage = parseFloat(
          record.porcentajeResuelto.replace('%', '')
        );
        return sum + percentage;
      }, 0) / this.results.length
    ); // Dividir por la cantidad de registros para obtener el promedio
  }

  // Para mostrar el resultado formateado con dos decimales y el símbolo %:
  public getPorcentajeResueltosFormateado(): string {
    return `${this.getTotalPorcentajeResueltos().toFixed(2)}%`;
  }

  public getTotalEnTramite(): number {
    return this.results.reduce((sum, record) => sum + record.tramites, 0);
  }

  private getTotalPorcentajeEnTramite(): number {
    if (!this.results.length) return 0;

    return (
      this.results.reduce((sum, record) => {
        // Convertir el string "12.20%" a número 12.20
        const percentage = parseFloat(
          record.porcentajeTramite.replace('%', '')
        );
        return sum + percentage;
      }, 0) / this.results.length
    ); // Dividir por la cantidad de registros para obtener el promedio
  }

  // Para mostrar el resultado formateado con dos decimales y el símbolo %:
  public getPorcentajeEnTramiteFormateado(): string {
    return `${this.getTotalPorcentajeEnTramite().toFixed(2)}%`;
  }

  getGrandTotal(): number {
    return this.results.reduce((sum, record) => sum + record.total, 0);
  }

  private generateYearOptions() {
    const currentYear = new Date().getFullYear();
    this.yearOptions = Array.from({ length: 5 }, (_, index) => ({
      label: (currentYear - index).toString(),
      value: currentYear - index,
    }));
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

  public manejarSeleccion(tipo: number) {
    this.cargaPorEtapaFiltradas = this.cargaPorEtapa.filter(
      (item) => item.idTipo === tipo
    );
    this.transformarDatos(this.cargaPorEtapaFiltradas);
  }

  protected eventoMostrarOcultarMonitoreo(): void {
    this.mostrarMonitoreo = !this.mostrarMonitoreo;
  }

  private transformarDatos(
    cargaPorEtapaFiltradas: CargaLaboralPorEtapaResponse[]
  ) {
    const etapasAgrupadas = {};

    cargaPorEtapaFiltradas.forEach((item) => {
      const etapa = item.etapa;
      const cantidad = item.cantidad;

      // Si la etapa ya existe en el objeto, sumar la cantidad
      // @ts-ignore
      if (etapasAgrupadas[etapa]) {
        // @ts-ignore
        etapasAgrupadas[etapa] += cantidad;
      } else {
        // Si no existe, crear una nueva entrada
        // @ts-ignore
        etapasAgrupadas[etapa] = cantidad;
      }
    });

    // Extraer las etapas únicas y las cantidades sumadas
    const etapasUnicas = Object.keys(etapasAgrupadas);
    const cantidadesSumadas = Object.values(etapasAgrupadas);

    // Definir los colores para cada etapa
    const colores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

    // Crear el objeto this.datosGrafico
    this.datosGrafico = {
      labels: etapasUnicas, // Las etapas se usan como labels
      datasets: [
        {
          data: cantidadesSumadas, // Las cantidades se usan como datos
          backgroundColor: colores,
          hoverBackgroundColor: colores,
        },
      ],
    };
  }

  private obtenerTotales(data: CargaLaboralPorEtapaResponse[]): Totales {
    const totales: Totales = {
      pendientes: 0,
      tramites: 0,
      resueltos: 0,
      total: 0,
    };

    // Usamos reduce para sumar las cantidades por tipo
    return data.reduce((acc, item) => {
      switch (item.idTipo) {
        case 1:
          acc.pendientes = item.cantidad;
          break;
        case 3:
          acc.tramites += item.cantidad;
          break;
        case 2:
          acc.resueltos += item.cantidad;
          break;
        case 4:
          acc.total += item.cantidad;
          break;
      }
      return acc;
    }, totales);
  }

  public filtrarYOrganizarDatos(datos: CargaLaboralPorEtapaResponse[]): void {
    // Filtrar los datos para idTipo = 3 (trámites) y idTipo = 4 (resueltos)

    console.log('ingreso el siguiente dato :' + datos);
    const tramites = datos.filter((item) => item.idTipo === 3);
    const resueltos = datos.filter((item) => item.idTipo === 2);

    const mapearAEstadoCaso = (
      items: CargaLaboralPorEtapaResponse[]
    ): EstadoCaso[] => {
      const etapasUnicas: { [key: string]: EstadoCaso } = {};

      items.forEach((item) => {
        // @ts-ignore
        if (!etapasUnicas[item.etapa]) {
          // @ts-ignore
          etapasUnicas[item.etapa] = {
            etapa: item.etapa,
            cantidad: item.cantidad,
          };
        } else {
          // Si la etapa ya existe, puedes sumar las cantidades o simplemente mantener la primera
          // @ts-ignore
          etapasUnicas[item.etapa].cantidad += item.cantidad;
        }
      });

      return Object.values(etapasUnicas);
    };

    // Crear los objetos estadosEnTramite y estadosResueltos
    this.estadosEnTramite = mapearAEstadoCaso(tramites);
    this.estadosResueltos = mapearAEstadoCaso(resueltos);

    console.log('Estados en Trámite:', this.estadosEnTramite);
    console.log('Estados Resueltos:', this.estadosResueltos);
  }

  private updateDisplayDates(): void {
    const periodo = this.filterForm.get('periodo')?.value?.value;
    if (periodo === 'A') {
      const year = this.filterForm.value.anio
        ? this.filterForm.value.anio.value
        : new Date().getFullYear();
      this.fechaInicio = `01/01/${year}`;
      this.fechaFin = `31/12/${year}`;
    } else if (periodo === 'M') {
      const year = this.filterForm.value.anio
        ? this.filterForm.value.anio.value
        : new Date().getFullYear();
      const mesValue = this.filterForm.value.mes
        ? this.filterForm.value.mes.value
        : null;
      if (year && mesValue) {
        const mesStr = mesValue.toString().padStart(2, '0');
        const lastDay = new Date(
          parseInt(year),
          parseInt(mesValue),
          0
        ).getDate();
        this.fechaInicio = `01/${mesStr}/${year}`;
        this.fechaFin = `${lastDay}/${mesStr}/${year}`;
      } else {
        this.fechaInicio = '';
        this.fechaFin = '';
      }
    } else if (periodo === 'I') {
      const rawFechaInicio = this.obtenerPayload().fechaInicio;
      const rawFechaFin = this.obtenerPayload().fechaFin;
      this.fechaInicio = rawFechaInicio
        ? this.formatDateDisplay(rawFechaInicio)
        : '';
      this.fechaFin = rawFechaFin ? this.formatDateDisplay(rawFechaFin) : '';
    } else {
      this.fechaInicio = '';
      this.fechaFin = '';
    }

    this.tablaInfo = {
      ...this.tablaInfo,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
    };
  }

  private formatDateDisplay(dateStr: string): string {
    if (!dateStr || dateStr.length !== 8) {
      return dateStr;
    }
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${day}/${month}/${year}`;
  }
}
