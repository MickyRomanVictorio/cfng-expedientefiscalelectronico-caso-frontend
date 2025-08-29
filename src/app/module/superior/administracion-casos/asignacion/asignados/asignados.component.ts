import { DropdownModule } from 'primeng/dropdown';
import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TipoExportarEnum } from '@core/constants/constants';
import { PlazosLeyenda } from '@core/constants/superior';
import { ExportarService } from '@core/services/shared/exportar.service';
import { IconAsset, IconUtil, obtenerCasoHtml } from 'ngx-cfng-core-lib';
import { TablaComponent } from './components/tabla/tabla.component';
import { FiltroComponent } from './components/filtro/filtro.component';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsignacionConsultasSuperiorService } from '@core/services/superior/asignacion/asignacion-consultas.service';
import { ReasignarComponent } from './components/reasignar/reasignar.component';
import { NgClass } from '@angular/common';
import { AsignacionService } from '@core/services/superior/asignacion/asignacion.service';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';

@Component({
  selector: 'app-asignados',
  standalone: true,
  imports: [
    CmpLibModule,
    FiltroComponent,
    TablaComponent,
    RouterLink,
    DropdownModule,
    ReactiveFormsModule,
    ReasignarComponent,
    NgClass,
    NgxCfngCoreModalDialogModule,
  ],
  templateUrl: './asignados.component.html',
  styleUrls: [
    './asignados.component.scss'
  ],
})
export class AsignadosComponent implements OnInit {
  @ViewChild('tableCasosRef')
  protected tableCasosRef!: TablaComponent;

  @ViewChild('filtroRef')
  protected filtroRef!: FiltroComponent;

  protected paginacionCondicion = { limit: 10, page: 1, where: {} };
  protected paginacionConfiguracion: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  protected TipoExportarEnum = TipoExportarEnum;
  protected leyenda: PlazosLeyenda[] = PlazosLeyenda;
  protected listaCasosOriginal: any[] = [];
  protected listaCasos: any[] = [];
  protected fiscalesPorAsignar: any[] = [];
  protected fiscalPorAsignar = new FormControl(null);
  private datosBusqueda: any = {};
  protected totalRegistros = {
    total: 0,
    casos: 0,
    pestanasApelacionPorAsignar: 0,
  };

  constructor(
    protected readonly iconAsset: IconAsset,
    protected readonly iconUtil: IconUtil,
    private readonly exportarService: ExportarService,
    protected readonly asignacionConsultasSuperiorService: AsignacionConsultasSuperiorService,
    private readonly asignacionService: AsignacionService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {}

  ngOnInit(): void {
    this.datosInicio();
  }

  private datosInicio(): void {
    //Fiscales
    this.asignacionConsultasSuperiorService.obtenerFiscales().subscribe({
      next: (resp) => {
        this.fiscalesPorAsignar = resp;
      },
    });
  }

  protected eventoBuscar(datos: any): void {
    this.datosBusqueda = datos;
    this.obtenerDatosCasos(datos);


  }
  private obtenerDatosCasos(datos: any) {
    //
    this.leyenda[0].cantidad = 0;
    this.leyenda[1].cantidad = 0;
    this.leyenda[2].cantidad = 0;
    //
    this.asignacionService.obtenerAsignados(datos).subscribe({
      next: (resp: any) => {
        this.listaCasos = resp;
        this.listaCasosOriginal = resp;
        this.paginacionConfiguracion.data.data = this.listaCasos;
        this.paginacionConfiguracion.data.total = this.listaCasos.length;
        this.actualizarListaCasosPaginacion(this.listaCasos, false);
        //
        this.contarRegistrosCasos(this.listaCasosOriginal);
        if (datos.buscar) {
          console.log('los datoss zzzz', datos);
          this.eventoBuscarPorTexto(datos.buscar);
        }
      },
    });

  }

  private contarRegistrosCasos(listaCasos: any[]) {
    //Plazos
    this.leyenda[0].cantidad = 0;
    this.leyenda[1].cantidad = 0;
    this.leyenda[2].cantidad = 0;
    listaCasos.forEach((caso) => {
      const id = +caso.idSemaforo;
      if (id === 1) {
        this.leyenda[0].cantidad++;
      } else if (id === 2) {
        this.leyenda[1].cantidad++;
      } else if (id === 3) {
        this.leyenda[2].cantidad++;
      }
    });
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

  protected casosSeleccionados() {
    return this.listaCasos.filter((caso) => caso.seleccionado === true);
  }

  protected eventoBuscarPorTexto(bucarValor: string) {
    console.log('bucarValor', bucarValor);
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
    //
    this.contarRegistrosCasos(this.listaCasos);
    //
    this.paginacionConfiguracion.data.data = this.listaCasos;
    this.paginacionConfiguracion.data.total = this.listaCasos.length;
    this.actualizarListaCasosPaginacion(this.listaCasos, true);
  }
  protected eventoExportar(tipoExportar: TipoExportarEnum): void {
    if (this.listaCasosOriginal.length > 0) {
      const headers = [
        'Número de caso',
        'Etapa',
        'Despacho de procedencia',
        'F. Elevación',
        'F. Asignación',
        'Fiscal asignado',
        'Plazo de pronunciamiento',
      ];
      const data: any[] = [];
      this.listaCasosOriginal.forEach((c: any) => {
        const row = {
          'Número de caso': c.numeroCaso,
          Etapa: c.etapa,
          'Despacho de procedencia':
            c.entidadFiscalOrigen + '  ' + c.despachoFiscalOrigen,
          'F. Elevación': c.fechaElevacionFecha + ' ' + c.fechaElevacionTiempo,
          'F. Asignación':
            c.fechaAsignacionFecha + ' ' + c.fechaAsignacionTiempo,
          'Fiscal asignado': c.nombreFiscalAsignado,
          'Plazo de pronunciamiento':
            c.plazoDiasTranscurridos + '/' + c.plazoDiasTotal,
        };
        data.push(row);
      });

      tipoExportar === TipoExportarEnum.Pdf
        ? this.exportarService.exportarAPdf(
            data,
            headers,
            'casos_asignados_superior'
          )
        : this.exportarService.exportarAExcel(
            data,
            headers,
            'casos_asignados_superior'
          );
    }
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

  protected eventoDesasignarCasos(): void {
    const casosSeleccionados = this.casosSeleccionados();
    if (casosSeleccionados.length === 0) {
      this.modalDialogService.warning(
        'Casos no seleccionados',
        'Para continuar debe seleccionar al menos un caso',
        'Aceptar'
      );
      return;
    }
    //
    const casosMostrar = `
      <div class="pt-1">
        ${this.casosSeleccionados()
          .map(
            (casofiscal) =>
              `<div>${obtenerCasoHtml(casofiscal.numeroCaso)}</div>`
          )
          .join('')}
      </div>
    `;
    const cfeDialog = this.modalDialogService.warning(
      'Confirmar desasignación de caso',
      '¿Está seguro que desea desasignar los siguientes casos? <div>Por favor confirme esta opción.</div>' +
        casosMostrar,
      'Si, desasignar',
      true,
      'Cancelar'
    );
    cfeDialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.desasignarCasos();
        }
      },
    });
  }

  private desasignarCasos() {
    const casos: any[] = [];
    this.casosSeleccionados().forEach((caso: any) => {
      casos.push({
        idBandejaElevacion: caso.idBandejaElevacion,
        numeroCaso: caso.numeroCaso
      });
    });

    this.asignacionService
      .desasignarCasos({
        desasignar: casos,
      })
      .subscribe({
        next: (_) => {
          this.desasignarCasosRespuesta(1);
        },
        error: (err) => {
          this.desasignarCasosRespuesta(2, err.error.message);
        },
      });
  }

  /**
   *
   * @param tipo 1:Exito 2:Error
   * @param mensaje
   */
  private desasignarCasosRespuesta(tipo: number, mensaje?: string): void {
    const casos = `
      <div class="pt-1">
        ${this.casosSeleccionados()
          .map(
            (casofiscal) =>
              `<div>${obtenerCasoHtml(casofiscal.numeroCaso)}</div>`
          )
          .join('')}
      </div>
    `;
    if (tipo === 1) {
      //
      this.reiniciar();
      //
      this.modalDialogService.success(
        'Casos designados correctamente',
        'Se designaron correctamente los siguientes casos' + casos,
        'Aceptar'
      );
    } else if (tipo === 2) {
      this.modalDialogService.error(
        'Casos no designados',
        'No se designados los siguientes casos porque ocurrió un error: ' +
          (mensaje ?? ''),
        'Aceptar'
      );
    }
  }

  protected reiniciar(): void {
    this.eventoBuscar(this.datosBusqueda);
    this.fiscalPorAsignar.reset();
    this.tableCasosRef.reiniciar();
    this.datosInicio();
  }
  protected eventoReiniciar(dato: any): void {
    this.reiniciar();
  }

  protected eventoFiscalAsignadoSeleccionar(dato: any): void {
    const idFiscalAsignado = dato.value;
    console.log('idFiscalAsignado', idFiscalAsignado);
    if (dato.value === null || dato.value === undefined) {
      this.listaCasos = this.listaCasosOriginal;
    } else {
      console.log('listaCasosOriginal', this.listaCasosOriginal);
      this.listaCasos = this.listaCasosOriginal.filter(
        (data) => data.idFiscalAsignado === idFiscalAsignado
      );
    }
    //
    this.contarRegistrosCasos(this.listaCasos);
    //
    this.paginacionConfiguracion.data.data = this.listaCasos;
    this.paginacionConfiguracion.data.total = this.listaCasos.length;
    this.actualizarListaCasosPaginacion(this.listaCasos, true);
  }
}
