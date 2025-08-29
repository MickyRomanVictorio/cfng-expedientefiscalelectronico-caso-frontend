import { NgClass } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CasoFiscal, PaginacionCondicion, PaginacionConfiguracion, TipoExportar, TipoVistaEnum } from '@core/components/consulta-casos/models/listar-casos.model';
import { ConsultaCasosGestionService } from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import { TipoElevacionCodigo } from '@core/constants/superior';
import { FormFilter } from '@core/interfaces/comunes/casosFiscales';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { CasosElevadosService } from '@core/services/superior/casos-elevados/casos-monitoreados.service';
import { urlConsultaCasoFiscal } from '@core/utils/utils';
import { ExportarService } from '@services/shared/exportar.service';
import { IconAsset, IconUtil } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { PanelModule } from 'primeng/panel';
import { FiltrarConsultaCasoComponent } from './components/filtrar-consulta-caso/filtrar-consulta-caso.component';
import { TablaCasosComponent } from './components/vista/tabla-casos/tabla-casos.component';
import { TarjetaCasosComponent } from './components/vista/tarjeta-casos/tarjeta-casos.component';

@Component({
  standalone: true,
  selector: 'app-consulta-casos-contienda-competencia',
  templateUrl: './contienda-competencia.component.html',
  styleUrl:'./contienda-competencia.component.scss',
  imports: [
    PanelModule,
    ButtonModule,
    NgClass,
    CmpLibModule,
    FiltrarConsultaCasoComponent,
    TablaCasosComponent,
    TarjetaCasosComponent
  ],
  providers: [DialogService],
})
export class ContiendaCompetenciaComponent implements OnInit {

  protected TipoVistaEnum = TipoVistaEnum;
  protected listaCasosOriginal: CasoFiscal[]= [];
  protected listaCasos: CasoFiscal[]= [];
  protected tipoVista: TipoVistaEnum = TipoVistaEnum.Tarjeta;
  protected TipoExportarEnum = TipoExportar;
  protected paginacionCondicion: PaginacionCondicion = { limit: 9, page: 1, where: {} };
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
  private readonly datosRuta: any = {};
  protected datosRutaCondicion: any = {};
  protected titulo:string = '';
  protected leyendaPlazos  = signal<any[]>([]);

  constructor(
    protected iconUtil: IconUtil,
    protected iconAsset: IconAsset,
    private readonly exportarService:ExportarService,
    private readonly casosElevadosService:CasosElevadosService,
    private readonly router:Router,
    protected readonly consultaCasosGestionService:ConsultaCasosGestionService,
    private readonly route: ActivatedRoute
  ) {
    this.leyendaPlazos.set(this.consultaCasosGestionService.getLeyendaPlazos());
  }
  ngOnInit(): void {
    this.obtenerDatos({...this.datosRuta, filtroTiempo: '0'});
  }

  private obtenerDatos(datos:any){
    this.casosElevadosService.obtenerCasos(TipoElevacionCodigo.ContiendaCompetencia, datos).subscribe({
      next: (rs) => {
        this.listaCasosOriginal = rs.data;
        this.listaCasos = rs.data;
        //
        this.contarLeyendaPlazos(this.listaCasosOriginal);
        //
        this.paginacionConfiguracion.data.data = this.listaCasos;
        this.paginacionConfiguracion.data.total = this.listaCasos.length;
        this.actualizarListaCasosPaginacion(this.listaCasos, false);
      }
    });
  }

  private contarLeyendaPlazos(casos: CasoFiscal[]) {
    const plazos = [0, 0, 0];
    casos.forEach(caso=>{
       if (caso.plazos && caso.plazos.length > 0) {
     caso.plazos?.map(plazo => {
        if(plazo.idJerarquia === 2){
          const id = plazo.indSemaforo;
          if(id===1){
            plazos[0]++;
          }else if(id===2){
            plazos[1]++;
          }else if(id===3){
            plazos[2]++;
          }
        }
      }
      );
        }
    });
    const leyenda=this.consultaCasosGestionService.getLeyendaPlazos();
    plazos.forEach((plazo, index) => {
      leyenda[index].cantidad = plazo;
    });
    this.leyendaPlazos.set(leyenda);
  }

  protected eventoCambiarPagina(datos:PaginacionInterface){
    this.paginacionCondicion.page = datos.page;
    this.paginacionCondicion.limit = datos.limit;
    this.actualizarListaCasosPaginacion(datos.data, datos.resetPage);
  }

  protected eventoBuscar(datos:any){
    this.obtenerDatos({...this.datosRuta, ...datos});
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
    //
    this.contarLeyendaPlazos(this.listaCasos);
    //
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

      tipoExportar === TipoExportar.Pdf? this.exportarService.exportarAPdf(data, headers, 'casos_fiscales_monitoreados') : this.exportarService.exportarAExcel(data, headers, 'casos_fiscales_monitoreados');
    }
  }

  protected eventoCasoSeleccionado(caso:CasoFiscal){
    this.router.navigate([`caso/${caso.idCaso}/acto-procesal`], { relativeTo: this.route });
  }

}
