import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormFilter } from '@core/interfaces/comunes/casosFiscales';
import { IconUtil, IconAsset  } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DialogService } from 'primeng/dynamicdialog';
import { PanelModule } from 'primeng/panel';
import { FiltrarConsultaCasoComponent } from './components/filtrar-consulta-caso/filtrar-consulta-caso.component';
import { ButtonModule } from 'primeng/button';
import { GrillaCasosComponent } from './components/vista/grilla-casos/grilla-casos.component';
import { TablaCasosComponent } from './components/vista/tabla-casos/tabla-casos.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { ExportarService } from '@services/shared/exportar.service';
import { CasosMonitoreadosService } from '@core/services/superior/casos-monitoreados/casos-monitoreados.service';
import { urlConsultaCasoFiscal } from '@core/utils/utils';
import { Router } from '@angular/router';
import { Caso, PaginacionCondicion, PaginacionConfiguracion, Plazo, TipoExportar, TipoVistaEnum } from './models/listar-casos.model';

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
    GrillaCasosComponent
  ],
  providers: [DialogService],
})
export class ListarConsultaCasosComponent {

  protected TipoVistaEnum = TipoVistaEnum;
  protected listaCasosOriginal: Caso[]= [];
  protected listaCasos: Caso[]= [];
  protected tipoVista: TipoVistaEnum = TipoVistaEnum.Grilla;
  protected TipoExportarEnum = TipoExportar;
  protected paginacionCondicion: PaginacionCondicion = { limit: 12, page: 1, where: {} };
  protected leyendaPlazosCss: { [key:string]: string } = {'1':'dentro-del-plazo','2':'plazo-por-vencer','3':'plazo-vencido'};
  protected leyenda: any[] = [
    {
      codigo:'0',
      nombre:'Dentro del plazo',
      cantidad: 0,
      clasesCss: this.leyendaPlazosCss['1']
    },
    {
      codigo:'1',
      nombre:'Plazo por vencer',
      cantidad: 0,
      clasesCss: this.leyendaPlazosCss['2']
    },
    {
      codigo:'2',
      nombre:'Plazo vencido',
      cantidad: 0,
      clasesCss: this.leyendaPlazosCss['3']
    }
  ];
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
  protected procesadoCriterioBusqueda:boolean = false;

  constructor(
    protected iconUtil: IconUtil,
    protected iconAsset: IconAsset,
    private readonly exportarService:ExportarService,
    private readonly casosMonitoreadosService:CasosMonitoreadosService,
    private readonly router:Router
  ) {
  }

  private verificarCriterioBusqueda(datos:any){
    const camposARevisar = ['entidad', 'despacho', 'fiscal', 'proceso', 'subtipoProceso', 'etapa', 'actoProcesal', 'tramite', 'estado', 'tipoOrderBy', 'orderBy'];
    return Object.entries(datos).filter( ([key]) => camposARevisar.includes(key))
      .some(([_, valor]) => valor !== null && valor !== '');
  }
  private obtenerDatos(datos:any){
    this.procesadoCriterioBusqueda = this.verificarCriterioBusqueda(datos);
    this.casosMonitoreadosService.obtenerCasosMonitoreados(datos).subscribe({
      next: (rs) => {
        this.listaCasosOriginal = rs.data;
        this.listaCasos = rs.data;
        //
        this.paginacionConfiguracion.data.data = this.listaCasos;
        this.paginacionConfiguracion.data.total = this.listaCasos.length;
        this.actualizarListaCasosPaginacion(this.listaCasos, false);
        //
        this.leyenda[0].cantidad = 0;
        this.leyenda[1].cantidad = 0;
        this.leyenda[2].cantidad = 0;
        //
        this.listaCasosOriginal.forEach(caso=>{
            if(caso.plazos.length > 0){
              this.contarPlazos(caso.plazos);
            }
        });
      }
    });
  }

  private contarPlazos(plazos:Plazo[]){
    const id = plazos[0].indSemaforo;
    if(id===1){
      this.leyenda[0].cantidad++;
    }else if(id===2){
      this.leyenda[1].cantidad++;
    }else if(id===3){
      this.leyenda[2].cantidad++;
    }
  }

  protected eventoCambiarPagina(datos:PaginacionInterface){
    this.paginacionCondicion.page = datos.page;
    this.paginacionCondicion.limit = datos.limit;
    this.actualizarListaCasosPaginacion(datos.data, datos.resetPage);
  }

  protected eventoBuscar(datos:any){
    this.obtenerDatos(datos);
  }

  protected eventoBuscarPorTexto(bucarValor: string){
    this.procesadoCriterioBusqueda = false;
    this.listaCasos = this.listaCasosOriginal.filter((data) =>
      Object.values(data).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' ||
            typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(bucarValor.toLowerCase())
      )
    );
    if(bucarValor!=='' && this.listaCasos.length === 0){
      this.procesadoCriterioBusqueda = true;
    }
    this.paginacionConfiguracion.data.data = this.listaCasos;
    this.paginacionConfiguracion.data.total = this.listaCasos.length;
    this.actualizarListaCasosPaginacion(this.listaCasos, true);
  }

  private actualizarListaCasosPaginacion(datos: any, reiniciar: boolean) {
    this.paginacionReiniciar = reiniciar;
    const start = (this.paginacionCondicion.page - 1) * this.paginacionCondicion.limit;
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
      this.listaCasos.forEach((c: Caso) => {
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

      tipoExportar === TipoExportar.Pdf? this.exportarService.exportarAPdf(data, headers, 'casos_fiscales_monitoreados') : this.exportarService.exportarAExcel(data, headers, 'casos_fiscales_monitoreados');
    }
  }

  protected eventoCasoSeleccionado(caso:Caso){
    this.casosMonitoreadosService.setEsMonitoreado('1');
    const ruta = urlConsultaCasoFiscal({
      idEtapa: caso.idEtapa,
      idCaso:caso.idCaso,
      flgConcluido:caso.flgConcluido?.toString()
    });
    this.router.navigate([`${ruta}/acto-procesal`]);
  }

}
