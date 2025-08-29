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
import { MultiSelectModule } from 'primeng/multiselect';
import { Constants } from '@constants/mesa-turno';
import { JwtHelperService } from '@auth0/angular-jwt';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ExportarService } from '@services/shared/exportar.service';
import { MessageService } from 'primeng/api';
import {
  DependenciaXDistritoFiscal,
  DistritoFiscal,
  Especialidad,
  FiscalDespachoRequest,
  FiscalDespachoResponse,
  MonthOption,
  ProductividadRequest,
  ProductividadResponse,
  YearOption,
} from '@modules/reportes/reportes/productividad/models/productividad.model';
import { ProductividadService } from '@modules/reportes/reportes/productividad/services/productividad.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { MaestroService } from '@services/shared/maestro.service';
import { MesPipe } from '@modules/reportes/reportes/productividad/pipes/mes.pipe';
import { AnioPipe } from '@modules/reportes/reportes/productividad/pipes/anio.pipe';
import { FormatoFechaPipe } from '@modules/reportes/reportes/productividad/pipes/formatoFecha.pipe';

@Component({
  selector: 'app-productividad',
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
    MesPipe,
    AnioPipe,
    FormatoFechaPipe,
  ],
  providers: [MessageService],
  templateUrl: './productividad.component.html',
  styleUrl: './productividad.component.scss',
})
export default class ProductividadComponent implements OnInit {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly productividadService: ProductividadService =
    inject(ProductividadService);
  private readonly maestroService: MaestroService = inject(MaestroService);
  private readonly exportarService: ExportarService = inject(ExportarService);
  private readonly messageService: MessageService = inject(MessageService);

  public filterForm: FormGroup;
  public results: ProductividadResponse[] = [];
  public especialidades: Especialidad[] = [];
  public distritoFiscales: DistritoFiscal[] = [];
  public dependenciasFiscales: DependenciaXDistritoFiscal[] = [];
  public yearOptions: YearOption[] = [];
  public mesOptions: MonthOption[] = [];
  public dependencia: string = '';
  public codigoCargo: string = '';
  public codigoUsuario: string = '';

  public rangeOptions = [
    { label: 'Anual', value: 'A' },
    { label: 'Mensual', value: 'M' },
    { label: 'Intervalo', value: 'I' },
  ];

  public instanciaOptions = [
    { label: 'PROVINCIAL', value: 1 },
    { label: 'SUPERIOR', value: 2 },
  ];

  public logoUrl = 'assets/images/logo_fiscalia_horizontal_escudo_azul.png';

  constructor() {
    this.filterForm = this.fb.group({
      periodo: [this.rangeOptions[0], Validators.required],
      fechaInicio: [null],
      fechaFin: [null],
      anio: [this.yearOptions[0]],
      mes: [null],
      especialidad: ['001'],
      instancia: [null],
      distritoJudicial: [null],
      dependenciaFiscal: [null],
    });
  }

  ngOnInit() {
    this.generateYearOptions();
    this.generateMonthOptions();
    this.obtenerDatosDelToken();
    this.obtenerEspecialidades();
    this.obtenerDistritosFiscales();
    this.search();
  }

  protected icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  private obtenerEspecialidades(): void {
    this.maestroService.getEspecialidadConsulta().subscribe({
      next: (response) => {
        this.especialidades = response.data;
      },
      error: (error) => {
        console.error('Error al obtener datos:', error);
      },
    });
  }

  private obtenerDistritosFiscales(): void {
    this.maestroService.getListaDistritoFiscal().subscribe({
      next: (response) => {
        this.distritoFiscales = response.data;
      },
      error: (error) => {
        console.error('Error al obtener datos:', error);
      },
    });
  }

  private obtenerDependenciaFiscal(idDistritoFiscal: number): void {
    this.maestroService
      .getDependenciaFiscalxDistrito(idDistritoFiscal)
      .subscribe({
        next: (response) => {
          this.dependenciasFiscales = response.data;
        },
        error: (error) => {
          console.error('Error al obtener datos:', error);
        },
      });
  }

  public onDistritoJudicialChange(event: any): void {
    const distritoId = event.value; // Obtiene el ID del distrito seleccionado
    this.obtenerDependenciaFiscal(distritoId); // Actualiza las dependencias fiscales
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
  }

  private obtenerPayload(): ProductividadRequest {
    const formValues = this.filterForm.value;

    return {
      fechaInicio: formValues.fechaInicio
        ? this.productividadService.formatDate(formValues.fechaInicio)
        : null,
      fechaFin: formValues.fechaFin
        ? this.productividadService.formatDate(formValues.fechaFin)
        : null,
      fechaAnual: formValues.anio ? formValues.anio.value.toString() : null,
      fechaMensual: formValues.mes
        ? String(formValues.mes.value).padStart(2, '0')
        : null,
      especialidad: this.filterForm.get('especialidad')?.value,
      instancia: formValues.instancia?.value,
      distritoJudicial: this.filterForm.get('distritoJudicial')?.value,
      dependenciaFiscal: this.filterForm.get('dependenciaFiscal')?.value,
    };
  }

  public search() {
    this.productividadService
      .listarProductividad(this.obtenerPayload())
      .subscribe({
        next: (response) => {
          console.log('response: ', response);
          this.results = response;
        },
        error: (error) => {
          this.results = [];
          console.error('Error al obtener datos:', error);
        },
      });
  }

  public exportarPdfExcel(exportType: TipoArchivoType): void {
    if (this.results.length > 0) {
      const headers = [
        'N°',
        'Distrito Judicial',
        'Instancia',
        'Id Dependencia',
        'Dependencia',
        'Especialidad',
        'Procedencia',
        'Etapa Procesal',
        'Estado del Caso',
        'Periodo',
        'Año',
        'Mes',
        'Despacho',
        'Ingreso',
        'Resuelto',
        'Pendiente',
        'Fecha Ingreso',
        'Dni',
        'Fiscal',
        'Tipo caso final',
        'Distrito',
        'Servidor',
        'Fecha Actual',
        'Id Único',
        'Codigo Caso',
      ];
      const data: any[] = [];

      this.results.forEach((productividadResponse: ProductividadResponse) => {
        const row = {
          'Distrito Judicial': productividadResponse.distritoFiscal,
          Instancia: productividadResponse.instancia,
          'Id Dependencia': productividadResponse.codigoDependencia,
          Dependencia: productividadResponse.dependencia,
          Especialidad: productividadResponse.especialidad,
          Procedencia: productividadResponse.procedencia,
          'Etapa Procesal': productividadResponse.etapa,
          'Estado del Caso': productividadResponse.estadoCaso,
          Periodo: 'NUEVO',
          Año: productividadResponse.procedencia,
          Mes: productividadResponse.procedencia,
          Despacho: productividadResponse.despacho,
          Ingreso: productividadResponse.ingreso,
          Resuelto: productividadResponse.resuelto,
          Pendiente: productividadResponse.pendiente,
          // 'Fecha Ingreso': productividadResponse.fechaIngreso,
          'Fecha Ingreso': this.formatFecha(productividadResponse.fechaIngreso),
          Dni: productividadResponse.dni,
          Fiscal: productividadResponse.fiscal,
          'Tipo caso final': productividadResponse.tipoCasoFinal,
          Distrito: productividadResponse.distrito,
          Servidor: 'EFE',
          'Fecha Actual': this.fechaActual,
          'Id Único': productividadResponse.idCaso,
          'Codigo Caso': productividadResponse.codigoCaso,
        };
        data.push(row);
      });

      const periodo = this.filterForm.get('periodo')?.value?.value;
      let headerDateRange = '';
      if (periodo === 'A') {
        const year = this.filterForm.value.anio
          ? this.filterForm.value.anio.value.toString()
          : 'N/A';
        headerDateRange = `Del 01/01/${year} al 31/12/${year}`;
      } else if (periodo === 'M') {
        const year = this.filterForm.value.anio
          ? this.filterForm.value.anio.value.toString()
          : 'N/A';
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
          headerDateRange = `Del 01/${mesStr}/${year} al ${lastDay}/${mesStr}/${year}`;
        } else {
          headerDateRange = 'N/A';
        }
      } else if (periodo === 'I') {
        const rawFechaInicio = this.filterForm.value.fechaInicio
          ? this.productividadService.formatDate(
              this.filterForm.value.fechaInicio
            )
          : 'N/A';
        const rawFechaFin = this.filterForm.value.fechaFin
          ? this.productividadService.formatDate(this.filterForm.value.fechaFin)
          : 'N/A';
        headerDateRange = `Del ${this.formatDateDisplay(
          rawFechaInicio
        )} al ${this.formatDateDisplay(rawFechaFin)}`;
      }

      exportType === 'PDF'
        ? this.productividadService
            .getBase64Image(this.logoUrl)
            .then((logoBase64) => {
              this.productividadService.exportarAPdf(
                data,
                headers,
                'Productividad',
                'landscape',
                logoBase64,
                '1° FISCALIA PROVINCIAL PENAL CORPORATIVA DE VENTANILLA-LIMA NOROESTE-4 DESPACHO',
                headerDateRange,
                this.results.length,
                'Ronaldo Nazario De Lima',
                new Date().toLocaleDateString('es-PE'),
                new Date().toLocaleTimeString('es-PE')
              );
            })
        : this.exportarService.exportarAExcel(data, headers, 'Productividad');
      return;
    }

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
  }

  public clearFilters() {
    this.filterForm.reset();
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

  get fechaActual() {
    return new Date();
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

  private formatFecha(fecha: string | Date): string {
    let dateObj: Date;
    if (typeof fecha === 'string') {
      dateObj = new Date(fecha);
    } else {
      dateObj = fecha;
    }
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
