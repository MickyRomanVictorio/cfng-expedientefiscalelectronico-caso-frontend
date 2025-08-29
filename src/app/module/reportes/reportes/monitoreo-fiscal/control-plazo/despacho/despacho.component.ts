import { TabViewModule } from 'primeng/tabview';
import { BandejaComponent } from './../bandeja/bandeja.component';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  PLATFORM_ID,
  inject, OnInit,
} from '@angular/core';
import { isPlatformBrowser, NgClass, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateMaskModule } from '@directives/date-mask.module';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

import { MultiSelectModule } from 'primeng/multiselect';

import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { obtenerIcono } from '@utils/icon';
import {
  ActoProcesalResponse,
  DespachoResponse,
  EtapasResponse,
  Fiscal,
  FiscalDespachoResponse,
  FiscaliaResponse,
  ReporteFiltrosRequest,
  ResumenResponseItem,
  TramiteResponse,
} from '../../models/carga-laboral.model';
import { CargaLaboralService } from '@modules/reportes/reportes/monitoreo-fiscal/services/carga-laboral.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Constants } from '@constants/mesa-turno';
import {
  FiscalDespachoRequest,
  MonthOption,
  YearOption,
} from '@modules/reportes/reportes/monitoreo-fiscal/models/carga-laboral.model';
import { CasoPorRecepcionar } from '@core/interfaces/provincial/recepcion/CasoPorRecepcionar';
import { ExportarService } from '@core/services/shared/exportar.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { MessageService } from 'primeng/api';
import { NOMBRES_CABECERA_RECEPCION } from '@core/types/efe/provincial/administracion-casos/asignacion/recepcion-casos.type';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { EncabezadoTooltipComponent } from '@core/components/modals/encabezado-tooltip/encabezado-tooltip.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChartModule } from 'primeng/chart';
import { BandejaSuperiorComponent } from '../bandeja-superior/bandeja-superior.component';
import { ProductividadService } from '@modules/reportes/reportes/productividad/services/productividad.service';
import { filter } from 'rxjs';
import { CardModule } from 'primeng/card';
import {CargoFiscalEnum} from "@modules/reportes/reportes/monitoreo-fiscal/enums/cargo-fiscal-enum";

@Component({
  selector: 'app-despacho',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    BandejaComponent,
    BandejaSuperiorComponent,
    CalendarModule,
    CmpLibModule,
    DateMaskModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    MultiSelectModule,
    EncabezadoTooltipComponent,
    ChartModule,
    CardModule,
  ],
  templateUrl: './despacho.component.html',
  styleUrls: ['./despacho.component.scss'],
})
export class DespachoComponent implements OnInit{
  private readonly productividadService: ProductividadService =
    inject(ProductividadService);

  @Input() tabActivo: number = 0;
  @Output() enviarFlitroBuscarRequest = new EventEmitter<string>();
  activeTab: number = 0;

  filteredResumenData: any[] = [];
  filteredDetalleData: any[] = [];
  filteredSuperiorData: any[] = [];

  resumenData: any[] = [];
  detalleData: any[] = [];
  superiorData: any[] = [];

  public fechaInicio: string | null = '';
  public fechaFin: string | null = '';


  filterForm: FormGroup;
  mostrarFiltros: boolean = true;
  mostrarMonitoreo: boolean = false;

  rangeOptions = [
    { label: 'Anual', value: 'A' },
    { label: 'Mensual', value: 'M' },
    { label: 'Intervalo', value: 'I' },
  ];

  yearOptions: any[] = [];

  mesOptions = [
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

  public fiscalesPrimeraCarga: boolean = true;
  public origenes: any[] = [];
  public fechaDesdeInicial: Date | null = null;
  public fechaHastaInicial: Date | null = null;
  public resultsFiscales: FiscalDespachoResponse[] = [];
  public resultsEtapas: EtapasResponse[] = [];
  public resultsActo: ActoProcesalResponse[] = [];
  public resultsTramite: TramiteResponse[] = [];
  public resultsFiscalias: FiscaliaResponse[] = [];
  public resultsDespachos: DespachoResponse[] = [];
  private readonly cargaLaboralService: CargaLaboralService =
    inject(CargaLaboralService);
  public dependencia: string = '';
  public codigoCargo: string = '';
  public codigoUsuario: string = '';
  public despachoUsuario: string = '';
  public cargo: boolean = false;

  public fiscalesSeleccionados!: FiscalDespachoResponse[];
  public sinSeleccionFiscales: boolean = false;

  protected casosPorRecepcionarFiltrados: CasoPorRecepcionar[] = [];
  public tooltipVisible: boolean = false;
  protected referenciaModal!: DynamicDialogRef;
  protected tituloTootip: string = 'Se mostrará en color:';

  public totalRegistros: number = 0;

  public plazoVencido: number = 0;
  public plazoPorVencer: number = 0;
  public dentroDelPlazo: number = 0;
  public countDentro: number = 0;
  public countPorVencer: number = 0;
  public countVencido: number = 0;

  public logoUrl = 'assets/images/logo_fiscalia_horizontal_escudo_azul.png';

  data: any;
  options: any;
  platformId = inject(PLATFORM_ID);

  //los plazos del reporte

  colorOptions = [
    { value: '1', label: 'Dentro del plazo' },
    { value: '2', label: 'Plazo por vencer' },
    { value: '3', label: 'Plazo vencido' },
  ];

  constructor(
    private fb: FormBuilder,
    private exportarService: ExportarService,
    private messageService: MessageService,
    protected iconUtil: IconUtil,
    private cd: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      buscar: [''],
      fiscales: [''],
      periodo: [this.rangeOptions[0], Validators.required],
      anio: [new Date().getFullYear(), Validators.required],
      mes: [''],
      fechaInicio: [null],
      fechaFin: [null],
      idEtapa: [''],
      idActoProcesal: [''],
      tramite: [''],
      indicador: [''],
      fiscalia: [''],
      despacho: [''],
    });
  }

  ngOnInit(): void {
    this.obtenerDatosDelToken();
    this.fiscales();
    this.fiscalesPrimeraCarga = true;
    this.etapas();
    this.generateYearOptions();
    this.filterForm.patchValue({
      anio: this.yearOptions[0].value,
      mes: null,
      fechaInicio: null,
      fechaFin: null,
    });

    this.fiscalia(this.dependencia);
    // this.fiscalia('505010116');

    this.filterForm
      .get('idEtapa')
      ?.valueChanges.pipe(filter(() => this.activeTab === 1))
      .subscribe((selectedIdEtapa) => {
        if (selectedIdEtapa) {
          this.actos(selectedIdEtapa);
        } else {
          this.resultsActo = [];
          this.filterForm.patchValue(
            { idActoProcesal: null },
            { emitEvent: false }
          );
        }
      });

    this.filterForm
      .get('idActoProcesal')
      ?.valueChanges.subscribe((selectedActoProcesal) => {
        if (selectedActoProcesal) {
          this.tramite(selectedActoProcesal);
        } else {
          this.resultsTramite = [];
          this.filterForm.patchValue({ tramite: null }, { emitEvent: false });
        }
      });

    this.filterForm
      .get('fiscalia')
      ?.valueChanges.subscribe((selectedFiscalia) => {
        if (selectedFiscalia) {
          this.despacho(selectedFiscalia);
        } else {
          this.resultsDespachos = [];
          this.filterForm.patchValue({ despacho: null }, { emitEvent: false });
        }
      });

    this.filterForm.patchValue({
      anio: this.yearOptions[0].value,
    });

    this.updateDisplayDates();

  }

  private generateYearOptions() {
    const currentYear = new Date().getFullYear();
    this.yearOptions = Array.from({ length: 7 }, (_, index) => ({
      label: (currentYear - index).toString(),
      value: currentYear - index,
    }));
  }

  toggleTooltip: () => void = () => {
    this.tooltipVisible = !this.tooltipVisible;
  };
  showTooltip(): void {
    this.tooltipVisible = true;
  }

  toggleFilters(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  initChart() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color'
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color'
      );
      const groupedData = this.superiorData.reduce((acc: any, item) => {
        // console.log('item', item);
        const { codigoEntidad, nombreEntidad, indicador } = item;
        if (!acc[codigoEntidad]) {
          acc[codigoEntidad] = {
            nombreEntidad: nombreEntidad,
            VERDE: 0,
            AMBAR: 0,
            ROJO: 0,
          };
        }

        if (indicador === 'VERDE') {
          acc[codigoEntidad].VERDE += 1;
        } else if (indicador === 'AMBAR') {
          acc[codigoEntidad].AMBAR += 1;
        } else if (indicador === 'ROJO') {
          acc[codigoEntidad].ROJO += 1;
        }
        return acc;
      }, {});
      const entidades = Object.values(groupedData);
      let labels = entidades.map((entidad: any) => entidad.nombreEntidad);
      const verdeData = entidades.map((entidad: any) => entidad.VERDE);
      const ambarData = entidades.map((entidad: any) => entidad.AMBAR);
      const rojoData = entidades.map((entidad: any) => entidad.ROJO);

      const truncatedLabels = labels.map(
        (label) =>
          // (label.length > 18 ? label.substring(0, 18) + '...' : label)
          label.match(/(?:\S+\s*){1,2}/g) || label
        // label.length > 15 ? label.substring(0, 12) + '...' : label
      );

      this.data = {
        labels: truncatedLabels,
        datasets: [
          {
            label: 'Plazo vencido',
            backgroundColor: '#c83c3c',
            borderColor: '#c83c3c',
            data: rojoData,
          },
          {
            label: 'Plazo por vencer',
            backgroundColor: '#d9a927',
            borderColor: '#d9a927',
            data: ambarData,
          },
          {
            label: 'Dentro del plazo',
            backgroundColor: '#3cc85a',
            borderColor: '#3cc85a',
            data: verdeData,
          },
        ],
      };

      this.options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor,
              font: { size: 10 },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                size: 8,
                weight: 500,
              },
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
          y: {
            ticks: {
              color: textColorSecondary,
              font: {
                size: 8,
                weight: 500,
              },
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  public buscar(): void {
    if (this.filterForm.valid) {
      const form = this.filterForm.getRawValue();

      if (this.filterForm.get('fiscales')?.value === null) {
        this.fiscalesPrimeraCarga = true;
        this.fiscales();
      } else {
        //PROVINCIAL
        if (this.cargo) {
          if (this.activeTab === 0) {
            const request: ReporteFiltrosRequest = {
              fiscales: this.filterForm.get('fiscales')?.value,
              codigoDespacho: null,
              fechaInicio: form.fechaInicio
                ? this.cargaLaboralService.formatDate(form.fechaInicio)
                : '',
              fechaFin: form.fechaFin
                ? this.cargaLaboralService.formatDate(form.fechaFin)
                : '',
              anio: form.anio ? form.anio : '',
              mes: form.mes ? this.filterForm.get('mes')?.value : '',
              idEtapa: form.idEtapa ? form.idEtapa : null,
              indicador: form.indicador ? form.indicador : null,
            };

            this.cargaLaboralService.listarPlazosDetalle(request).subscribe({
              next: (response: any[]) => {
                this.totalRegistros = response.length;
                this.resumenData = response;
                this.filteredResumenData = response;

                this.countDentro = response.filter(
                  (item) => item.indicadorNumero === 1
                ).length;
                this.countPorVencer = response.filter(
                  (item) => item.indicadorNumero === 2
                ).length;
                this.countVencido = response.filter(
                  (item) => item.indicadorNumero === 3
                ).length;

                this.dentroDelPlazo = this.totalRegistros
                  ? parseFloat(
                      ((this.countDentro / this.totalRegistros) * 100).toFixed(
                        1
                      )
                    )
                  : 0;
                this.plazoPorVencer = this.totalRegistros
                  ? parseFloat(
                      (
                        (this.countPorVencer / this.totalRegistros) *
                        100
                      ).toFixed(1)
                    )
                  : 0;
                this.plazoVencido = this.totalRegistros
                  ? parseFloat(
                      ((this.countVencido / this.totalRegistros) * 100).toFixed(
                        1
                      )
                    )
                  : 0;
              },
              error: (error) => {
                console.error('Error al obtener el resumen:', error);
                if (error.status === 422) {
                  this.filteredResumenData = []; // o this.results = null;
                }
                // this.messageService.add({
                //   severity: 'error',
                //   detail: 'Error al obtener el resumen de plazos fiscales.',
                // });
              },
            });
          } else if (this.activeTab === 1) {
            //Detalle
            const request: ReporteFiltrosRequest = {
              // buscar: form.buscar,
              fiscales: this.filterForm.get('fiscales')?.value,
              codigoDespacho: null,
              fechaInicio: form.fechaInicio
                ? this.cargaLaboralService.formatDate(form.fechaInicio)
                : '',
              fechaFin: form.fechaFin
                ? this.cargaLaboralService.formatDate(form.fechaFin)
                : '',
              anio: form.anio ? form.anio : '',
              mes: form.mes ? this.filterForm.get('mes')?.value : '',
              idEtapa: form.idEtapa ? form.idEtapa : null,
              idActoProcesal: form.idActoProcesal ? form.idActoProcesal : null,
              idTramite: form.idTramite ? form.idTramite : null,
              indicador: form.indicador ? form.indicador : null,
            };

            this.cargaLaboralService.listarPlazosDetalle(request).subscribe({
              next: (response: any[]) => {
                this.totalRegistros = response.length;
                this.detalleData = response;
                this.filteredDetalleData = response;

                this.countDentro = response.filter(
                  (item) => item.indicadorNumero === 1
                ).length;
                this.countPorVencer = response.filter(
                  (item) => item.indicadorNumero === 2
                ).length;
                this.countVencido = response.filter(
                  (item) => item.indicadorNumero === 3
                ).length;

                this.dentroDelPlazo = this.totalRegistros
                  ? parseFloat(
                      ((this.countDentro / this.totalRegistros) * 100).toFixed(
                        1
                      )
                    )
                  : 0;
                this.plazoPorVencer = this.totalRegistros
                  ? parseFloat(
                      (
                        (this.countPorVencer / this.totalRegistros) *
                        100
                      ).toFixed(1)
                    )
                  : 0;
                this.plazoVencido = this.totalRegistros
                  ? parseFloat(
                      ((this.countVencido / this.totalRegistros) * 100).toFixed(
                        1
                      )
                    )
                  : 0;
              },
              error: (error) => {
                console.error('Error al obtener el resumen:', error);
                if (error.status === 422) {
                  this.filteredDetalleData = []; // o this.results = null;
                }
                // this.messageService.add({
                //   severity: 'error',
                //   detail: 'Error al obtener el resumen de plazos fiscales.',
                // });
              },
            });
          }
          //SUPERIOR
        } else {
          const request: ReporteFiltrosRequest = {
            // buscar: form.buscar,
            fiscales: this.filterForm.get('fiscales')?.value,
            codigoDespacho: null,
            fechaInicio: form.fechaInicio
              ? this.cargaLaboralService.formatDate(form.fechaInicio)
              : '',
            fechaFin: form.fechaFin
              ? this.cargaLaboralService.formatDate(form.fechaFin)
              : '',
            anio: form.anio ? form.anio : '',
            mes: form.mes ? this.filterForm.get('mes')?.value : '',
            idEtapa: form.idEtapa ? form.idEtapa : null,
            idActoProcesal: null,
            idTramite: null,
            idFiscalia: form.idFiscalia ? form.idFiscalia : null,
            idDespacho: form.idDespacho ? form.idDespacho : null,
            indicador: form.indicador ? form.indicador : null,
          };

          this.cargaLaboralService.listarPlazosResumen(request).subscribe({
            next: (response: any[]) => {
              this.totalRegistros = response.length;
              this.superiorData = response;
              this.filteredSuperiorData = response;

              this.countDentro = response.filter(
                (item) => item.indicadorNumero === 1
              ).length;
              this.countPorVencer = response.filter(
                (item) => item.indicadorNumero === 2
              ).length;
              this.countVencido = response.filter(
                (item) => item.indicadorNumero === 3
              ).length;

              this.dentroDelPlazo = this.totalRegistros
                ? parseFloat(
                    ((this.countDentro / this.totalRegistros) * 100).toFixed(1)
                  )
                : 0;
              this.plazoPorVencer = this.totalRegistros
                ? parseFloat(
                    ((this.countPorVencer / this.totalRegistros) * 100).toFixed(
                      1
                    )
                  )
                : 0;
              this.plazoVencido = this.totalRegistros
                ? parseFloat(
                    ((this.countVencido / this.totalRegistros) * 100).toFixed(1)
                  )
                : 0;

              // Asegurar que se reinicien si no hay datos
              if (response.length === 0) {
                this.superiorData = [];
                this.filteredSuperiorData = [];
                this.countDentro = 0;
                this.countPorVencer = 0;
                this.countVencido = 0;
                this.dentroDelPlazo = 0;
                this.plazoPorVencer = 0;
                this.plazoVencido = 0;
              }

              this.initChart();
            },
            error: (error) => {
              console.error('Error al obtener el resumen:', error);
              if (error.status === 422) {
                this.filteredSuperiorData = [];
              }
              // Reiniciar variables en caso de error
              this.totalRegistros = 0;
              this.countDentro = 0;
              this.countPorVencer = 0;
              this.countVencido = 0;
              this.dentroDelPlazo = 0;
              this.plazoPorVencer = 0;
              this.plazoVencido = 0;
              this.superiorData = [];
              this.filteredSuperiorData = [];
              this.initChart(); // Actualizar el gráfico con datos vacíos
            },
          });
        }
      } //el se importante

      this.updateDisplayDates();
    } else {
      // this.messageService.add({
      //   severity: 'warn',
      //   detail: 'Por favor, complete los filtros correctamente.',
      // });
    }
  }

  private updateChartDataFromResponse(response: any[]): void {
    // Agrupamos por fiscalía (usando "nombreEntidad") y contamos los indicadores
    const grouped = response.reduce((acc, item) => {
      // Usamos el nombre de la fiscalía como llave
      const fiscalia = item.nombreEntidad;
      if (!acc[fiscalia]) {
        acc[fiscalia] = { verde: 0, ambar: 0, rojo: 0 };
      }
      // Incrementamos el contador según indicadorNumero
      switch (item.indicadorNumero) {
        case 1:
          acc[fiscalia].verde++;
          break;
        case 2:
          acc[fiscalia].ambar++;
          break;
        case 3:
          acc[fiscalia].rojo++;
          break;
        default:
          break;
      }
      return acc;
    }, {} as { [key: string]: { verde: number; ambar: number; rojo: number } });

    // Obtenemos las etiquetas (nombres de fiscalía)
    const labels = Object.keys(grouped);
    // Extraemos los datos para cada indicador
    const dataVerde = labels.map((label) => grouped[label].verde);
    const dataAmbar = labels.map((label) => grouped[label].ambar);
    const dataRojo = labels.map((label) => grouped[label].rojo);

    // Actualizamos la data del gráfico
    this.data = {
      labels: labels,
      datasets: [
        {
          label: 'Dentro del plazo', // indicador VERDE
          backgroundColor: '#3cc85a',
          borderColor: '#3cc85a',
          data: dataVerde,
        },
        {
          label: 'Plazo por vencer', // indicador Ámbar
          backgroundColor: '#d9a927',
          borderColor: '#d9a927',
          data: dataAmbar,
        },
        {
          label: 'Plazo vencido', // indicador Rojo
          backgroundColor: '#c83c3c',
          borderColor: '#c83c3c',
          data: dataRojo,
        },
      ],
    };
    this.cd.markForCheck();
  }

  public onTabChange(event: any): void {
    this.activeTab = event.index;

    this.clearFilters();

    this.totalRegistros = 0;
    this.dentroDelPlazo = 0;
    this.plazoPorVencer = 0;
    this.plazoVencido = 0;
    this.countDentro = 0;
    this.countPorVencer = 0;
    this.countVencido = 0;

    this.resumenData = [];
    this.detalleData = [];
  }

  clearFilters(): void {
    this.filterForm.reset();
    // Reestablece los valores por defecto
    this.filterForm.patchValue({
      periodo: this.rangeOptions[0],
      anio: this.yearOptions[0].value,
    });
    this.buscar();
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

    console.log('el cargo del usuario conectado es el siguiente : ' + this.codigoCargo);

   /* if (usuarioToken.cargo === 'FISCAL PROVINCIAL') {
      this.cargo = true;
    } else if (usuarioToken.cargo === 'FISCAL SUPERIOR') {
      this.cargo = false;
    } */
    if (this.codigoCargo === CargoFiscalEnum.PROVINCIAL) {
      this.cargo = true;
    } else if (this.codigoCargo === CargoFiscalEnum.SUPERIOR) {
      this.cargo = false;
    }

    // this.cargo = false;
  }

  protected icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  protected buscarSegunTexto() {
    const buscado = this.removeInvisibleCharacters(
      this.filterForm.get('buscar')!.value
    );
    // console.log('palabra al buscar : ' + buscado);
    // console.log('palabra al buscar : ' + this.cargo);

    if (this.cargo) {
      // Para Provincial
      if (this.activeTab === 0) {
        //Resumen
        this.filteredResumenData = this.resumenData.filter((item: any) =>
          Object.values(item).some(
            (fieldValue) =>
              (typeof fieldValue === 'string' ||
                typeof fieldValue === 'number') &&
              fieldValue
                ?.toString()
                ?.toLowerCase()
                .trim()
                .includes(buscado.toLowerCase().trim())
          )
        );
      } else if (this.activeTab === 1) {
        //Detalle
        this.filteredDetalleData = this.detalleData.filter((item: any) =>
          Object.values(item).some(
            (fieldValue) =>
              (typeof fieldValue === 'string' ||
                typeof fieldValue === 'number') &&
              fieldValue
                ?.toString()
                ?.toLowerCase()
                .trim()
                .includes(buscado.toLowerCase().trim())
          )
        );
      }
    } else {
      // Para Superior
      this.filteredSuperiorData = this.superiorData.filter((item: any) =>
        Object.values(item).some(
          (fieldValue) =>
            (typeof fieldValue === 'string' ||
              typeof fieldValue === 'number') &&
            fieldValue
              ?.toString()
              ?.toLowerCase()
              .trim()
              .includes(buscado.toLowerCase().trim())
        )
      );
    }
  }

  private removeInvisibleCharacters(str: string): string {
    return str.replace(/[\u200B-\u200D\uFEFF]/g, '');
  }

  protected eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  public fiscales() {
    this.cargaLaboralService
      .listarFiscales(this.obtenerFiscalesPayload())
      .subscribe({
        next: (response) => {
          this.resultsFiscales = response;

          // Solo ejecutar la selección automática y búsqueda en la primera carga
          if (this.fiscalesPrimeraCarga) {
            const todosLosFiscales = this.resultsFiscales.map((f) => f.fiscal);
            // @ts-ignore
            this.filterForm.get('fiscales').setValue(todosLosFiscales);
            this.buscar();
            this.fiscalesPrimeraCarga = false; // Desactivar para futuras llamadas
          }
        },
        error: (error) => {
          console.error('Error al obtener datos:', error);
        },
      });
  }

  public etapas() {
    this.cargaLaboralService.getListaEtapas().subscribe({
      next: (response) => {
        this.resultsEtapas = response;
      },
      error: (error) => {
        console.error('Error al obtener datos:', error);
      },
    });
  }

  public actos(idEtapa: string) {
    this.cargaLaboralService.getListaActosProcesales(idEtapa).subscribe({
      next: (response) => {
        this.resultsActo = response;
      },
      error: (error) => {
        console.error('Error al obtener datos:', error);
      },
    });
  }

  public tramite(idActoProcesalConfigura: string) {
    this.cargaLaboralService
      .getListaTramites(idActoProcesalConfigura)
      .subscribe({
        next: (Response) => {
          this.resultsTramite = Response;
        },
        error: (error) => {
          console.error('Error al obtener datos:', error);
        },
      });
  }

  public fiscalia(coEntidadPadre: string) {
    this.cargaLaboralService.getListarFiscalias(coEntidadPadre).subscribe({
      next: (Response) => {
        this.resultsFiscalias = Response;
      },
      error: (error) => {
        console.error('Error al obtener datos:', error);
      },
    });
  }

  public despacho(coEntidad: string) {
    this.cargaLaboralService.getListarDespachos(coEntidad).subscribe({
      next: (Response) => {
        this.resultsDespachos = Response;
      },
      error: (error) => {
        console.error('Error al obtener datos:', error);
      },
    });
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
    this.sinSeleccionFiscales = this.fiscalesSeleccionados.length === 0;
  }

  public limpiar(): void {
    this.filterForm.patchValue({
      buscar: '',
      fiscales: this.resultsFiscales.map((f) => f.fiscal),
      periodo: this.rangeOptions[0],
      anio: new Date().getFullYear(),
      mes: '',
      fechaInicio: this.fechaDesdeInicial,
      fechaFin: this.fechaHastaInicial,
      idEtapa: '',
      idActoProcesal: '',
      tramite: '',
      indicador: '',
    });
  }

  protected eventoMostrarOcultarMonitoreo(): void {
    this.mostrarMonitoreo = !this.mostrarMonitoreo;
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.cargo) {
      if (this.activeTab === 0) {
        if (this.filteredResumenData.length > 0) {
          const headers = [
            'Fiscal',
            'Caso',
            'Complejidad',
            'Etapa',
            'F.Ini. Etapa',
            'Plazos días',
            'Días Trans.',
            'Días Total',
            'Indicador',
          ];

          const data: any[] = [];

          this.filteredResumenData.forEach((resumenResponseItem: any) => {
            const row = {
              Fiscal: resumenResponseItem.fiscal,
              Caso: resumenResponseItem.numeroCaso,
              Complejidad: resumenResponseItem.tipoComplejidad,
              Etapa: resumenResponseItem.etapa,
              'F.Ini.Etapa': resumenResponseItem.fechaInicioEtapa,
              'Plazos días': resumenResponseItem.plazo,
              'Días Trans.': resumenResponseItem.diasTranscurrido,
              'Días Total': resumenResponseItem.diasTotal,
              Indicador: resumenResponseItem.indicador,
            };
            data.push(row);
          });

          exportType === 'PDF'
            ? this.exportarService.exportarAPdf(
                data,
                headers,
                'Plazo-Resumen-Provincial'
              )
            : this.exportarService.exportarAExcel(
                data,
                headers,
                'Plazo-Resumen-Provincial'
              );
          return;
        }
      } else if (this.activeTab === 1) {
        //detalle provincial
        if (this.filteredDetalleData.length > 0) {
          const headers = [
            'Fiscal',
            'Caso',
            'Complejidad',
            'Etapa',
            'Acto Procesal',
            'Trámite',
            'F.Ini.Etapa',
            'Plazos días',
            'Días Trans.',
            'Días Total',
            'Indicador',
          ];

          const data: any[] = [];

          this.filteredDetalleData.forEach((filteredSuperiorDataItem: any) => {
            const row = {
              Fiscal: filteredSuperiorDataItem.fiscal,
              Caso: filteredSuperiorDataItem.numeroCaso,
              Complejidad: filteredSuperiorDataItem.tipoComplejidad,
              Etapa: filteredSuperiorDataItem.etapa,
              'Acto Procesal': filteredSuperiorDataItem.actoProcesal,
              Trámite: filteredSuperiorDataItem.tramite,
              'F.Ini.Etapa': filteredSuperiorDataItem.fechaInicioEtapa,
              'Plazos días': filteredSuperiorDataItem.plazo,
              'Días Trans.': filteredSuperiorDataItem.diasTranscurrido,
              'Días Total': filteredSuperiorDataItem.diasTotal,
              Indicador: filteredSuperiorDataItem.indicador,
            };
            data.push(row);
          });

          exportType === 'PDF'
            ? this.exportarService.exportarAPdf(
                data,
                headers,
                'Plazo-Detalle-Provincial'
              )
            : this.exportarService.exportarAExcel(
                data,
                headers,
                'Plazo-Detalle-Provincial'
              );
          return;
        }
      }
    } else {
      //superior
      if (this.filteredSuperiorData.length > 0) {
        const headers = [
          'Fiscalía',
          'Despacho',
          'Fiscal',
          'Caso',
          'Complejidad',
          'Etapa',
          'F.Ini.Etapa',
          'Plazos días',
          'Días Trans.',
          'Días Total',
          'Indicador',
        ];

        const data: any[] = [];

        this.filteredSuperiorData.forEach((filteredSuperiorDataItem: any) => {
          const row = {
            Fiscalía: filteredSuperiorDataItem.nombreEntidad,
            Despacho: filteredSuperiorDataItem.nombreDespacho,
            Fiscal: filteredSuperiorDataItem.fiscal,
            Caso: filteredSuperiorDataItem.numeroCaso,
            Complejidad: filteredSuperiorDataItem.tipoComplejidad,
            Etapa: filteredSuperiorDataItem.etapa,
            'F.Ini.Etapa': filteredSuperiorDataItem.fechaInicioEtapa,
            'Plazos días': filteredSuperiorDataItem.plazo,
            'Días Trans.': filteredSuperiorDataItem.diasTranscurrido,
            'Días Total': filteredSuperiorDataItem.diasTotal,
            Indicador: filteredSuperiorDataItem.indicador,
          };
          data.push(row);
        });

        exportType === 'PDF'
          ? this.exportarService.exportarAPdf(
              data,
              headers,
              'Plazo-Resumen-Superior'
            )
          : this.exportarService.exportarAExcel(
              data,
              headers,
              'Plazo-Resumen-Superior'
            );
        return;
      }
    }

    if (this.casosPorRecepcionarFiltrados.length > 0) {
      const data: any[] = [];

      this.casosPorRecepcionarFiltrados.forEach((c: CasoPorRecepcionar) => {
        const row = {
          'Número de Caso': c.codCaso,
          Origen: c.detalleTipoOrigen,
          Remitente: c.remitente,
          'Contacto de Remitente': c.numeroTelefono + ' / ' + c.correo,
          'Fecha de Ingreso': c.fechaIngreso,
          //'Fecha de Asignación': c.fechaAsignacion,
        };
        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(
            data,
            NOMBRES_CABECERA_RECEPCION,
            'Casos por Recepcionar',
            'landscape'
          )
        : this.exportarService.exportarAExcel(
            data,
            NOMBRES_CABECERA_RECEPCION,
            'Casos por Recepcionar'
          );
      return;
    }

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
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

  get placeholderBusqueda(): string {
    if (this.activeTab === 0) {
      return 'Ingrese algún texto para buscar sobre la tabla por fiscal, número de caso, complejidad, etapa.';
    } else if (this.activeTab === 1) {
      return 'Ingrese algún texto para buscar sobre la tabla por fiscal, número de caso, complejidad, etapa, acto, trámite.';
    } else {
      return 'Buscar...'; // Valor por defecto
    }
  }

  private updateDisplayDates(): void {
    const periodo = this.filterForm.get('periodo')?.value?.value;

    console.log('el periodo elegido ' + periodo);
    const form = this.filterForm.getRawValue();
    if (periodo === 'A') {
      const year = this.filterForm.value.anio !== undefined && this.filterForm.value.anio !== null
        ? this.filterForm.value.anio
        : new Date().getFullYear();

      this.fechaInicio = `01/01/${year}`;
      this.fechaFin = `31/12/${year}`;
    } else if (periodo === 'M') {
      const year = this.filterForm.value.anio
        ? this.filterForm.value.anio
        : new Date().getFullYear();
      const mesValue = this.filterForm.get('mes')?.value
        ? this.filterForm.get('mes')?.value
        : null;

      console.log('el año es ' + year);
      console.log('el mes es ' + mesValue);

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
      const rawFechaInicio = form.fechaInicio;
      const rawFechaFin = form.fechaInicio;
      this.fechaInicio = rawFechaInicio
        ? this.formatDateDisplay(rawFechaInicio)
        : '';
      this.fechaFin = rawFechaFin ? this.formatDateDisplay(rawFechaFin) : '';
    } else {
      this.fechaInicio = '';
      this.fechaFin = '';
    }


  }



}
