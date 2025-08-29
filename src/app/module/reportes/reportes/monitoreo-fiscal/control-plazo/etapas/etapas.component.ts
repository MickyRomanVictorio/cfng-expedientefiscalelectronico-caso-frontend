import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  EtapasRequest,
  FiscalDespachoResponse,
  PlazosEtapasDetalleRequest,
} from '../../models/carga-laboral.model';
import { CommonModule, NgClass } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ExportarService } from '@core/services/shared/exportar.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { CasoPorRecepcionar } from '@core/interfaces/provincial/recepcion/CasoPorRecepcionar';
import { NOMBRES_CABECERA_RECEPCION } from '@core/types/efe/provincial/administracion-casos/asignacion/recepcion-casos.type';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'dist/cmp-lib';
import { EncabezadoTooltipComponent } from '@core/components/modals/encabezado-tooltip/encabezado-tooltip.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TabViewModule } from 'primeng/tabview';
import { BandejaComponent } from './../bandeja/bandeja.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DetalleEtapaComponent } from './components/detalle-etapa/detalle-etapa.component';
import { TableModule } from 'primeng/table';
import { CargaLaboralService } from '@modules/reportes/reportes/monitoreo-fiscal/services/carga-laboral.service';
import {
  FiscalDespachoRequest,
  MonthOption,
  YearOption,
} from '@modules/reportes/reportes/monitoreo-fiscal/models/carga-laboral.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Constants } from '@constants/mesa-turno';

@Component({
  selector: 'app-etapas',
  standalone: true,
  imports: [
    MultiSelectModule,
    NgClass,
    DropdownModule,
    CommonModule,
    CmpLibModule,
    EncabezadoTooltipComponent,
    TabViewModule,
    BandejaComponent,
    ReactiveFormsModule,
    TableModule,
  ],
  templateUrl: './etapas.component.html',
  styleUrl: './etapas.component.scss',
  providers: [DialogService],
})
export class EtapasComponent {
  @Input() tabActivo: number = 0;

  filterForm: FormGroup;

  public etapasData: any[] = [];
  public filteredEtapaData: any[] = [];

  public resultsFiscales: FiscalDespachoResponse[] = [];
  public sinSeleccionFiscales: boolean = false;
  public fiscalesSeleccionados!: FiscalDespachoResponse[];
  registrosBandejaEtapa = [
    {
      fiscal: '1',
      numeroCaso: '1',
      tipoComplejidad: '1',
      etapa: '1',
      plazo: '1',
      diasTotal: '1',
    },
  ];

  public plazoVencido: number = 0;
  public plazoPorVencer: number = 0;
  public dentroDelPlazo: number = 0;
  public countDentro: number = 0;
  public countPorVencer: number = 0;
  public countVencido: number = 0;

  public tooltipVisible: boolean = false;

  public totalRegistros: number = 0;

  public dependencia: string = '';
  public codigoCargo: string = '';
  public codigoUsuario: string = '';
  public despachoUsuario: string = '';
  public cargo: boolean = false;
  public fiscalesPrimeraCarga: boolean = true;

  protected casosPorRecepcionarFiltrados: CasoPorRecepcionar[] = [];
  protected tituloTootip: string = 'Se mostrará en color:';
  protected referenciaModal!: DynamicDialogRef;

  private readonly cargaLaboralService: CargaLaboralService =
    inject(CargaLaboralService);

  colorOptions = [
    { value: '1', label: 'Dentro del plazo' },
    { value: '2', label: 'Plazo por vencer' },
    { value: '3', label: 'Plazo vencido' },
  ];

  mostrarMonitoreo: boolean = false;

  constructor(
    private fb: FormBuilder,
    private readonly dialogService: DialogService,
    private exportarService: ExportarService,
    protected iconUtil: IconUtil
  ) {
    this.filterForm = this.fb.group({
      fiscales: [''],
      indicador: [''],
    });
  }

  ngOnInit(): void {
    this.obtenerDatosDelToken();
    this.fiscales();
    this.fiscalesPrimeraCarga = true;
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

    if (usuarioToken.cargo === 'FISCAL PROVINCIAL') {
      this.cargo = true;
    } else if (usuarioToken.cargo === 'FISCAL SUPERIOR') {
      this.cargo = false;
    }
    // this.cargo = true;
  }

  private obtenerFiscalesPayload(): FiscalDespachoRequest {
    return {
      codigoDependencia: this.dependencia,
      codigoCargo: this.codigoCargo,
      codigoDespacho: this.despachoUsuario,
      usuario: this.codigoCargo === '00000009' ? this.codigoUsuario : null,
    };
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

  public onChangeFiscalesSeleccionados(event: any): void {
    this.fiscalesSeleccionados = event.value;
    console.log(this.fiscalesSeleccionados);
    this.sinSeleccionFiscales = this.fiscalesSeleccionados.length === 0;
  }

  public limpiar(): void {
    this.filterForm.patchValue({
      fiscales: this.resultsFiscales.map((f) => f.fiscal),
      indicador: '',
    });
  }

  protected eventoMostrarOcultarMonitoreo(): void {
    this.mostrarMonitoreo = !this.mostrarMonitoreo;
  }

  public buscar(): void {
    if (this.filterForm.valid) {
      const form = this.filterForm.getRawValue();

      if (this.cargo) {
        const request: EtapasRequest = {
          fiscales: this.filterForm.get('fiscales')?.value,
          indicador: form.indicador ? form.indicador : null,
        };

        this.cargaLaboralService.listarPlazosPorEtapas(request).subscribe({
          next: (response: any[]) => {
            this.totalRegistros = response.length;
            this.etapasData = response;
            this.filteredEtapaData = response;

            const sumatorias = response.reduce(
              (acc, item) => {
                acc.totalVerde += item.plazoVerde;
                acc.totalAmbar += item.plazoAmbar;
                acc.totalRojo += item.plazoRojo;
                return acc;
              },
              { totalVerde: 0, totalAmbar: 0, totalRojo: 0 }
            );

            const totalPlazos =
              sumatorias.totalVerde +
                sumatorias.totalAmbar +
                sumatorias.totalRojo || 1;

            this.plazoVencido = Number(
              ((sumatorias.totalRojo / totalPlazos) * 100).toFixed(1)
            );
            this.plazoPorVencer = Number(
              ((sumatorias.totalAmbar / totalPlazos) * 100).toFixed(1)
            );
            this.dentroDelPlazo = Number(
              ((sumatorias.totalVerde / totalPlazos) * 100).toFixed(1)
            );

            this.countVencido = sumatorias.totalRojo;
            this.countPorVencer = sumatorias.totalAmbar;
            this.countDentro = sumatorias.totalVerde;

            if (response.length === 0) {
              this.totalRegistros = 0;
              this.etapasData = [];
              this.filteredEtapaData = [];
              this.plazoVencido = 0;
              this.plazoPorVencer = 0;
              this.dentroDelPlazo = 0;
              this.countVencido = 0;
              this.countPorVencer = 0;
              this.countDentro = 0;
            }
          },
          error: (error) => {
            console.error('Error al obtener el resumen:', error);
            if (error.status === 422) {
              this.filteredEtapaData = []; // o this.results = null;
            }
            this.totalRegistros = 0;
            this.etapasData = [];
            this.filteredEtapaData = [];
            this.plazoVencido = 0;
            this.plazoPorVencer = 0;
            this.dentroDelPlazo = 0;
            this.countVencido = 0;
            this.countPorVencer = 0;
            this.countDentro = 0;

            // this.messageService.add({
            //   severity: 'error',
            //   detail: 'Error al obtener el resumen de plazos fiscales.',
            // });
          },
        });
      } else {
      }
    }
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.etapasData.length > 0) {

      const headers = [
        'Fiscal',
        'Asignación',
        'Recepcion',
        'Calificacion',
        'F.Ini.Invest.Prelim. (Fiscal)',
        'Invest.Prelim. (P.N.P.)',
        'Invest. Preparatoria',
        'Conclu.Invest. Preparatoria',
        'Total Casos',
      ];

      const data: any[] = [];

      this.etapasData.forEach((c: any) => {
        const row = {
          'Fiscal': c.fiscal,
          'Asignación': c.asignacion,
          'Recepcion': c.recepcion,
          'Calificacion': c.calificacion,
          'Invest.Prelim. (Fiscal)': c.preliminarFiscal,
          'Invest.Prelim. (P.N.P.)': c.preliminarPnp,
          'Invest. Preparatoria': c.preparatoria,
          'Conclu.Invest. Preparatoria': c.preparatoriaConcluido,
          'Total Casos': c.total,
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
          headers,
          'Plazo-Etapa-Casos'
          );
      return;
    }
  }

  protected icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  toggleTooltip: () => void = () => {
    this.tooltipVisible = !this.tooltipVisible;
  };

  showTooltip(): void {
    this.tooltipVisible = true;
  }

  protected mostrarDetalleEtapa(registro: any) {
    const request: PlazosEtapasDetalleRequest = {
      codigoDespacho: registro.codigoDespacho,
      idUsuario: registro.idUsuario,
      // codigoDespacho: '4006014501-4',
      // idUsuario: '12BCA62E5848151CE0650250569D508A',
    };

    this.cargaLaboralService.listarPlazosPorEtapaDetalle(request).subscribe({
      next: (response) => {
        console.log(response);
        const ref = this.dialogService.open(DetalleEtapaComponent, {
          showHeader: false,
          styleClass: 'p-dialog--xlg bg-brown',
          data: {
            detalles: response,
            nombreFiscal: registro.fiscal,
          },
        });
      },
      error: (error) => {
        console.error('Error al obtener el detalle:', error);
      },
    });
  }
}
