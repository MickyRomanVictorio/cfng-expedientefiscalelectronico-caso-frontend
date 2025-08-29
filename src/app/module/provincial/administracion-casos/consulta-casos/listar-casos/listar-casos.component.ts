import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CasoFiscal, FormFilter } from '@core/interfaces/comunes/casosFiscales';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { urlConsultaCasoFiscal, urlConsultaCuaderno } from '@core/utils/utils';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { ExportarService } from '@services/shared/exportar.service';
import { IconAsset, IconUtil } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { PanelModule } from 'primeng/panel';
import { FiltrarConsultaCasoComponent } from './components/filtrar-consulta-caso/filtrar-consulta-caso.component';
import { GrillaCasosComponent } from './components/vista/grilla-casos/grilla-casos.component';
import { TablaCasosComponent } from './components/vista/tabla-casos/tabla-casos.component';
import {
  PaginacionCondicion,
  PaginacionConfiguracion,
  TipoExportar,
  TipoVistaEnum,
} from './models/listar-casos.model';

@Component({
  standalone: true,
  selector: 'app-consulta-casos',
  templateUrl: './listar-casos.component.html',
  imports: [
    PanelModule,
    ButtonModule,
    NgClass,
    CmpLibModule,
    FiltrarConsultaCasoComponent,
    TablaCasosComponent,
    GrillaCasosComponent,
  ],
  providers: [DialogService],
})
export class ListarConsultaCasosComponent implements OnInit {
  protected TipoVistaEnum = TipoVistaEnum;
  protected listaCasosOriginal: CasoFiscal[] = [];
  protected listaCasos: CasoFiscal[] = [];
  protected tipoVista: TipoVistaEnum = TipoVistaEnum.Grilla;
  protected TipoExportarEnum = TipoExportar;
  protected paginacionCondicion: PaginacionCondicion = {
    limit: 9,
    page: 1,
    where: {},
  };
  public paginacionConfiguracion: PaginacionConfiguracion = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  protected paginacionReiniciar: boolean = false;
  protected filter: FormFilter = {};
  protected textoBuscado!: string;
  protected procesadoCriterioBusqueda: boolean = false;
  private datosRuta: any = {};
  protected datosRutaCondicion: any = {};
  protected titulo: string = '';

  constructor(
    protected iconUtil: IconUtil,
    protected iconAsset: IconAsset,
    private readonly exportarService: ExportarService,
    private readonly route: ActivatedRoute,
    private readonly casos: Casos,
    private readonly router: Router
  ) {
    //Captura los datos de la ruta (etapa, titulo, etc.)
    this.datosRutaCondicion = this.route.snapshot.data;
    this.titulo = this.datosRutaCondicion.titulo;
    if (this.datosRutaCondicion.tipo_proceso)
      this.datosRuta['proceso'] = this.datosRutaCondicion.tipo_proceso;
    if (this.datosRutaCondicion.id_etapa)
      this.datosRuta['etapa'] = this.datosRutaCondicion.id_etapa;
    if (this.datosRutaCondicion.concluido)
      this.datosRuta['concluido'] = this.datosRutaCondicion.concluido;
  }
  ngOnInit(): void {
    this.obtenerDatos({ ...this.datosRuta, filtroTiempo: '0' });
  }

  private obtenerDatos(datos: any) {
    this.casos.getCasosFiscales(datos).subscribe({
      next: (rs) => {
        this.listaCasosOriginal = rs.data;
        this.listaCasos = rs.data;
        //
        this.paginacionConfiguracion.data.data = this.listaCasos;
        this.paginacionConfiguracion.data.total = this.listaCasos.length;
        this.actualizarListaCasosPaginacion(this.listaCasos, false);
      },
    });
  }

  protected eventoCambiarPagina(datos: PaginacionInterface) {
    this.paginacionCondicion.page = datos.page;
    this.paginacionCondicion.limit = datos.limit;
    this.actualizarListaCasosPaginacion(datos.data, datos.resetPage);
  }

  protected eventoBuscar(datos: any) {
    this.obtenerDatos({ ...this.datosRuta, ...datos });
  }

  protected eventoBuscarPorTexto(buscarValor: string){
    this.procesadoCriterioBusqueda = false;
    this.listaCasos = this.listaCasosOriginal.filter((data:any) =>
      Object.values(data).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' ||
            typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(buscarValor.toLowerCase())
      )||

      (data.delitos &&
        data.delitos.some((delito: any) =>
          delito.nombre.toLowerCase().includes(buscarValor.toLowerCase())
        )) ||
        (data.notas &&
          data.notas.some((nota: any) =>
            nota.textoNota.toLowerCase().includes(buscarValor.toLowerCase())
          ))
    );
    if(buscarValor!=='' && this.listaCasos.length === 0){
      this.procesadoCriterioBusqueda = true;
    }
    this.paginacionConfiguracion.data.data = this.listaCasos;
    this.paginacionConfiguracion.data.total = this.listaCasos.length;
    if(this.listaCasos.length > 9){
      this.actualizarListaCasosPaginacion(this.listaCasos, true);
    }
   // this.actualizarListaCasosPaginacion(this.listaCasos, true);
  }

  private actualizarListaCasosPaginacion(datos: any, reiniciar: boolean) {
    this.paginacionReiniciar = reiniciar;
    const start =
      (this.paginacionCondicion.page - 1) * this.paginacionCondicion.limit;
    const end = start + this.paginacionCondicion.limit;
    this.listaCasos = datos.slice(start, end);
  }

  protected eventoTipoVista(e: Event, tipoVista: TipoVistaEnum) {
    e.preventDefault();
    this.tipoVista = tipoVista;
  }

  protected eventoExportar(tipoExportar: TipoExportar): void {
    if (this.listaCasos.length > 0) {
      const headers = [
        'Número de caso',
        'Etapa',
        'Fiscal',
        'F. Registro',
        'F Último Trámite',
        'Último Acceso Procesal',
      ];
      const data: any[] = [];
      this.listaCasos.forEach((c: CasoFiscal) => {
        const row = {
          'Número de caso': c.numeroCaso,
          Etapa: c.etapa,
          Fiscal: c.fiscal,
          //'Delitos': c.delitos,
          'F. Registro': c.fechaIngreso,
          'F Último Trámite': c.fechaUltimoTramite,
          'Último Acceso Procesal': c.ultimoTramite,
        };
        data.push(row);
      });

      tipoExportar === TipoExportar.Pdf
        ? this.exportarService.exportarAPdf(
            data,
            headers,
            'casos_fiscales_monitoreados'
          )
        : this.exportarService.exportarAExcel(
            data,
            headers,
            'casos_fiscales_monitoreados'
          );
    }
  }

  protected eventoCasoSeleccionado(caso: CasoFiscal): void {
    const { idTipoCuaderno, idEtapa, idCaso, flgConcluido } = caso;
  
    const parametros = {
      idEtapa: idEtapa!,
      idCaso: idCaso!,
      flgConcluido: flgConcluido?.toString(),
    };
  
    const ruta = idTipoCuaderno === 4
      ? urlConsultaCuaderno('extremo', parametros)
      : urlConsultaCasoFiscal(parametros);
  
    this.router.navigate([`${ruta}/acto-procesal`]);
  }
  
}
