import { NgClass } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TipoExportarEnum } from '@core/constants/constants';
import { PlazosLeyenda } from '@core/constants/superior';
import { ExportarService } from '@core/services/shared/exportar.service';
import { AsignacionService } from '@core/services/superior/asignacion/asignacion.service';
import { IconAsset, IconUtil } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { AsignarComponent } from './components/asignar/asignar.component';
import { FiltroComponent } from './components/filtro/filtro.component';
import { TablaComponent } from './components/tabla/tabla.component';
import { Casos } from '@core/interfaces/superior/administracion-casos/administracion-casos.model';
import { tourService } from '@utils/tour';
import { LeyendaListasSuperiorComponent } from "../../componentes-comunes/leyenda-listas/leyenda-listas.component";

@Component({
  selector: 'app-por-asignar',
  standalone: true,
  imports: [
    CmpLibModule,
    AsignarComponent,
    FiltroComponent,
    TablaComponent,
    RouterLink,
    NgClass,
    LeyendaListasSuperiorComponent
],
  providers: [],
  templateUrl: './por-asignar.component.html',
  styleUrls: ['./por-asignar.component.scss'],
})
export class PorAsignarComponent{

  @ViewChild('tableCasosRef')
  protected tableCasosRef!:TablaComponent;

  @ViewChild('filtroRef')
  protected filtroRef!:FiltroComponent;

  protected paginacionCondicion = { limit: 10, page: 1, where: {} };
  protected paginacionConfiguracion:any = {
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
  protected listaCasosOriginal:Casos[] = [];
  protected listaCasos:Casos[] = [];
  private datosBusqueda: any = {};
  protected esCriterioBusquedaValido = false;
  protected totalRegistros = {
    total:0,
    casos:0,
    pestanasApelacionPorAsignar:0
  }
  constructor(
    protected readonly iconAsset:IconAsset,
    protected readonly iconUtil:IconUtil,
    private readonly exportarService: ExportarService,
    private readonly asignacionService:AsignacionService,
    private tourService: tourService
  ) {
  }

  protected eventoBuscar(datos:any):void{
    this.datosBusqueda = datos;
    this.obtenerDatosCasos(datos);
  }
  /**
   * Verifica si existen campos de busqueda
   * @param datos
   * @returns
   */
  private verificarCriterioBusqueda(datos:any){
    const camposARevisar = ['tipoElevacion','idEntidad','idDespacho', 'idPlazo'];
    return Object.entries(datos).filter( ([key]) => camposARevisar.includes(key))
      .some(([_, valor]) => valor !== null && valor !== '');
  }
  private obtenerDatosCasos(datos:any){
    this.esCriterioBusquedaValido  = this.verificarCriterioBusqueda(datos);
    //
    this.asignacionService.obtenerPorAsignar(datos).subscribe({
      next: (resp: Casos[]) => {
        this.listaCasos = resp;
        this.listaCasosOriginal = resp;
        this.paginacionConfiguracion.data.data = this.listaCasos;
        this.paginacionConfiguracion.data.total = this.listaCasos.length;
        this.actualizarListaCasosPaginacion(this.listaCasos, false);
        this.contarRegistrosCasos(this.listaCasosOriginal);

        if(datos.buscar){
          this.eventoBuscarPorTexto(datos.buscar);}
      }
    });
  }

  private contarRegistrosCasos(listaCasos:any[]){
    //Plazos
    this.leyenda.forEach(item => item.cantidad = 0);
    listaCasos.forEach(caso => {
      const id = +caso.idSemaforo;
      if (id >= 0 && id <= 3) {
        const index = id === 0 ? 3 : id - 1;
        this.leyenda[index].cantidad++;
      }
    });
    //Registros
    this.totalRegistros.total = listaCasos.length;
    this.totalRegistros.casos = listaCasos.filter(elm => elm.tipoClasificadorExpediente==='000').length;//Casos
    this.totalRegistros.pestanasApelacionPorAsignar = listaCasos.filter(elm => (elm.tipoClasificadorExpediente==='020' || elm.tipoClasificadorExpediente==='021') ).length;//Pestañas de apelación por asignar
  }

  protected eventoBuscarPorTexto(bucarValor:string){
    this.esCriterioBusquedaValido =  false;
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
      this.esCriterioBusquedaValido = true;
    }
    //
    this.contarRegistrosCasos(this.listaCasos);
    //
    this.paginacionConfiguracion.data.data = this.listaCasos;
    this.paginacionConfiguracion.data.total = this.listaCasos.length;
    this.actualizarListaCasosPaginacion(this.listaCasos, true);
    //
  }
  protected eventoExportar(tipoExportar: TipoExportarEnum): void {
    if (this.listaCasosOriginal.length > 0) {
      const headers = [
        'Número de caso',
        'Etapa',
        'Despacho de procedencia',
        'F. Elevación',
        'F. Aceptada',
        'Plazo para asignar',
        'Plazo de pronunciamiento',

      ];
      const data: any[] = [];
      this.listaCasosOriginal.forEach((c: any) => {
        const row = {
          'Número de caso': c.numeroCaso,
          'Etapa': c.etapa,
          'Despacho de procedencia':c.entidadFiscalOrigen+'  '+c.despachoFiscalOrigen,
          'F. Elevación': c.fechaElevacionFecha+' '+c.fechaElevacionTiempo,
          'F. Aceptada': c.fechaAceptacionFecha+' '+c.fechaAceptacionTiempo,
          'Plazo para asignar': c.plazoAsignar,
          'Plazo de pronunciamiento': c.plazoDiasTranscurridos+'/'+c.plazoDiasTotal
        };
        data.push(row);
      });

      tipoExportar === TipoExportarEnum.Pdf
        ? this.exportarService.exportarAPdf(data, headers, "casos_por_asignar_superior")
        : this.exportarService.exportarAExcel(data, headers, "casos_por_asignar_superior");
    }
  }
  protected eventoCambiarPagina(datos:any){
    this.paginacionCondicion.page = datos.page;
    this.paginacionCondicion.limit = datos.limit;
    this.actualizarListaCasosPaginacion(datos.data, datos.resetPage);
  }
  private actualizarListaCasosPaginacion(datos: any, reiniciar: boolean) {
    const start = (this.paginacionCondicion.page - 1) * this.paginacionCondicion.limit;
    const end = start + this.paginacionCondicion.limit;
    this.listaCasos = datos.slice(start, end);
  }
  protected casosSeleccionados(){
    return this.listaCasos.filter( (caso)=>caso.seleccionado===true);
  }
  protected eventoReiniciar():void{
    this.obtenerDatosCasos(this.datosBusqueda);
    this.tableCasosRef.reiniciar();
    this.filtroRef.reiniciar();
  }

  protected startTour(): void {
    setTimeout(() => {
      this.tourService.startTour(this.stepsComponente);
    }, 500);
  }

  stepsComponente = [
    {
      attachTo: {element: '.tour-a-1', on: 'bottom'},
      title: '1. Casos',
      text: 'Aquí puede ver un caso/cuaderno/pestaña para asignar el fiscal superior encargado'
    },
    {
      attachTo: {element: '.tour-a-2', on: 'bottom'},
      title: '2. Check',
      text: 'Seleccione el caso para poder asiganrlo'
    },
    {
      attachTo: {element: '.tour-a-3', on: 'bottom'},
      title: '3. Seleccionar fiscal',
      text: 'Haga clic en el listado de fiscales de su despacho y seleccione el fiscal que al cual asignar el/los casos'
    },
    {
      attachTo: {element: '.tour-a-4', on: 'bottom'},
      title: '4. Asignar',
      text: 'Presione el botón asignar para finalizar el proceso de asignación'
    },
    {
      attachTo: {element: '.tour-a-5', on: 'bottom'},
      title: '5. Mas opciones',
      text: 'Haga clic en los tres puntos para mostrar más acciones a realizar sobre el caso/cuaderno/pestaña'
    }
  ];

}
