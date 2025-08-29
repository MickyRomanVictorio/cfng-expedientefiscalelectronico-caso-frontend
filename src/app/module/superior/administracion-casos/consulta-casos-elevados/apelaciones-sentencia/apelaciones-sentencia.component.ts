import { NgClass } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CasoFiscal, PaginacionCondicion, PaginacionConfiguracion, TipoExportar, TipoVistaEnum } from '@core/components/consulta-casos/models/listar-casos.model';
import { ConsultaCasosGestionService } from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import { FormFilter } from '@core/interfaces/comunes/casosFiscales';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { CasosElevadosService } from '@core/services/superior/casos-elevados/casos-monitoreados.service';
import { ExportarService } from '@services/shared/exportar.service';
import { IconAsset, IconUtil } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { PanelModule } from 'primeng/panel';
import { FiltrarConsultaCasoComponent } from '../apelaciones-auto/components/filtrar-consulta-caso/filtrar-consulta-caso.component';
import { TablaCasosComponent } from '../apelaciones-auto/components/vista/tabla-casos/tabla-casos.component';
import { TarjetaCasosComponent } from '../apelaciones-auto/components/vista/tarjeta-casos/tarjeta-casos.component';
import { tourService } from '@utils/tour';

@Component({
  standalone: true,
  selector: 'app-consulta-casos-elevados-apelaciones-auto',
  templateUrl: './apelaciones-sentencia.component.html',
  styleUrl: './apelaciones-sentencia.component.scss',
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
export class ApelacionesSentenciaComponent implements OnInit {

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
  protected resumenTotales = signal<any>({
    total:0,
    principal:0,
    incidentales:0,
    pestaniaApelacionAuto:0
  });


  constructor(
    protected iconUtil: IconUtil,
    protected iconAsset: IconAsset,
    private readonly exportarService:ExportarService,
    private readonly casosElevadosService:CasosElevadosService,
    protected readonly consultaCasosGestionService:ConsultaCasosGestionService,
    private readonly router:Router,
    private readonly route: ActivatedRoute,
    private tourService: tourService
  ) {
  }
  ngOnInit(): void {
    this.obtenerDatos({...this.datosRuta, filtroTiempo: '1'});
  }

  private obtenerDatos(datos:any){
    this.casosElevadosService.obtenerCasosApelacionesSentencia(datos).subscribe({
      next: (rs) => {
        this.listaCasosOriginal = rs.data;
        this.listaCasos = rs.data;
        //
        this.paginacionConfiguracion.data.data = this.listaCasos;
        this.paginacionConfiguracion.data.total = this.listaCasos.length;
        //
        const rRS = this.calcularResumenTotales(rs.data);
        rRS.total = this.paginacionConfiguracion.data.total;
        this.cambiarResumenTotales(rRS);
        //
        this.actualizarListaCasosPaginacion(this.listaCasos, false);
      }
    });
  }

  private calcularResumenTotales(data:any[]){
    const resultado = data.reduce((acc, item) => {
      // Contar registros con flgCarpeta == '1'
      if (item.flgCarpeta === '1') acc.principal++;

      // Contar registros con flgCuaderno == '1'
      if (item.flgCuaderno === '1') acc.incidentales++;

      // Sumar valores de pestaniasApelacion[0].cantidad (si existe)
      if (item.pestaniasApelacion?.[0]?.cantidad) {
          acc.pestaniaApelacionAuto += item.pestaniasApelacion[0].cantidad;
      }

      return acc;
    }, { principal: 0, incidentales: 0, pestaniaApelacionAuto: 0 });

    return resultado;
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
    this.paginacionConfiguracion.data.data = this.listaCasos;
    this.paginacionConfiguracion.data.total = this.listaCasos.length;
    //
    const rRS = this.calcularResumenTotales(this.listaCasos);
        rRS.total = this.listaCasos.length;
        this.cambiarResumenTotales(rRS);
    //
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
        'Acto Procesal',
        'Despacho Procedencia',
        'F. Elevación',
        'Fiscal Asignado Superior',
        'F Último Trámite',
      ];
      const data: any[] = [];
      this.listaCasos.forEach((c: CasoFiscal) => {
        const row = {
          'Número de caso': c.numeroCaso,
          Etapa: c.etapa,
          'Acto Procesal': c.actoProcesal,
         'Despacho Procedencia': c.fiscalOrigen + ' - ' + c.fiscaliaOrigen+ ' - '+ c.despachoOrigen,
        'F. Elevación': c.fechaCreacion + ' ' + c.horaCreacion,
          'Fiscal Asignado Superior': c.fiscalSuperiorAsignado,
          'F Último Trámite': c.fechaUltimoTramite
        };
        data.push(row);
      });

      tipoExportar === TipoExportar.Pdf? this.exportarService.exportarAPdf(data, headers, 'casos_apelacion_auto') : this.exportarService.exportarAExcel(data, headers, 'casos_apelacion_auto');
    }
  }

  protected eventoCasoSeleccionado(caso:CasoFiscal){
    //this.router.navigate([`caso/${caso.idCaso}/apelaciones`], { relativeTo: this.route });
    this.router.navigate([`cuaderno-incidental/${caso.idCaso}/apelaciones`], { relativeTo: this.route });
  }

  private cambiarResumenTotales(datos:any){
    this.resumenTotales.update(t => ({ ...t, ...datos }));
  }

  protected startTour(): void {
    setTimeout(() => {
      this.tourService.startTour(this.stepsComponente);
    }, 500);
  }

  private stepsComponente = [
    {
      attachTo: {element: '.tour-a-1', on: 'right'},
      title: '1. Casos',
      text: 'Aquí puede ver un caso/cuaderno/pestaña (Al hacer clic se mostraran las pestañas que este caso contiene)'
    },
    {
      attachTo: {element: '.tour-a-2', on: 'bottom'},
      title: '2. Numero de cuaderno',
      text: 'Numero del cuaderno (Principal, extremo o incidental)'
    },
    {
      attachTo: {element: '.tour-a-3', on: 'right'},
      title: '3. Informacion del caso',
      text: 'Se muestra informacion relevante del caso'
    },
    {
      attachTo: {element: '.tour-a-4', on: 'bottom'},
      title: '4. Busqueda',
      text: 'Ingrese un texto el cuadro de busqueda, buscara en todos los casos del listado'
    },
    {
      attachTo: {element: '.tour-a-5', on: 'bottom'},
      title: '5. Busqueda avanzada',
      text: 'Al hacer clic se mostraran varias opciones para hacer una busqueda mas precisa'
    },
    {
      attachTo: {element: '.tour-a-6', on: 'bottom'},
      title: '6. Paginas',
      text: 'Puede navegar entre las paginas para ver mas información'
    },
    {
      attachTo: {element: '.tour-a-7', on: 'bottom'},
      title: '7. Grilla/listado',
      text: 'Al seleccionar estos botones, puede cambiar el tipo de vista en una grilla o en un listado'
    }
  ];

}
