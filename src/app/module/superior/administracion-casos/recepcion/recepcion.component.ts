import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { TipoExportarEnum } from '@core/constants/constants';
import { PlazosLeyenda } from '@core/constants/superior';
import { Casos } from '@core/interfaces/superior/administracion-casos/administracion-casos.model';
import { ExportarService } from '@core/services/shared/exportar.service';
import { AsignacionService } from '@core/services/superior/asignacion/asignacion.service';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { IconAsset, IconUtil, obtenerCasoHtml } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DropdownModule } from 'primeng/dropdown';
import { FiltroComponent } from './components/filtro/filtro.component';
import { TablaComponent } from './components/tabla/tabla.component';
import { tourService } from '@utils/tour';
import { LeyendaListasSuperiorComponent } from "../componentes-comunes/leyenda-listas/leyenda-listas.component";

@Component({
  standalone: true,
  selector: 'app-recepcion',
  templateUrl: './recepcion.component.html',
  styleUrls: ['./recepcion.component.scss'],
  imports: [
    CmpLibModule,
    DropdownModule,
    FiltroComponent,
    TablaComponent,
    NgxCfngCoreModalDialogModule,
    NgClass,
    LeyendaListasSuperiorComponent
]
})
export class RecepcionComponent{

  protected listaCasos:any[] = [];
  protected listaCasosOriginal:any[] = [];
  protected totalRegistros = {
    total:0,
    casos:0,
    pestanasApelacionPorAsignar:0
  };
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
  private datosBusqueda: any = {};
  protected esCriterioBusquedaValido = false;

  constructor(
    protected readonly iconUtil:IconUtil,
    protected readonly iconAsset:IconAsset,
    private readonly exportarService: ExportarService,
    private readonly asignacionService:AsignacionService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private tourService: tourService
  ) { }

  protected eventoBuscarPorTexto(bucarValor:string){
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
    //
      this.contarRegistrosCasos(this.listaCasos);
    //
    this.paginacionConfiguracion.data.data = this.listaCasos;
    this.paginacionConfiguracion.data.total = this.listaCasos.length;
    this.actualizarListaCasosPaginacion(this.listaCasos, true);
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
    const camposARevisar = ['tipoElevacion','idEntidad','idDespacho', 'idPlazo', 'etapa'];
    return Object.entries(datos).filter( ([key]) => camposARevisar.includes(key))
      .some(([_, valor]) => valor !== null && valor !== '');
  }
  private obtenerDatosCasos(datos:any){
    this.esCriterioBusquedaValido  = this.verificarCriterioBusqueda(datos);
    //
    this.asignacionService.obtenerRecepcionar(datos).subscribe({
      next: (resp: Casos[]) => {
        if(datos.etapa){
         resp = resp.filter(caso => caso.idEtapa == datos.etapa);
        }
        this.listaCasos = resp;
        this.listaCasosOriginal = resp;
        this.paginacionConfiguracion.data.data = this.listaCasos;
        this.paginacionConfiguracion.data.total = this.listaCasos.length;
        this.actualizarListaCasosPaginacion(this.listaCasos, false);
        this.contarRegistrosCasos(this.listaCasosOriginal);
     
        if(datos.buscar){
          this.eventoBuscarPorTexto(datos.buscar);
        }
      }
    });
  }

  protected eventoExportar(tipoExportar: TipoExportarEnum): void {
    if (this.listaCasosOriginal.length > 0) {
      const headers = [
        'Número de caso',
        'Etapa',
        'Despacho de procedencia',
        'Fiscal Procedencia',
        'F. Elevación',
        'F. Asignación',
        'Plazo de pronunciamiento',

      ];
      const data: any[] = [];
      this.listaCasosOriginal.forEach((c: any) => {
        const row = {
          'Número de caso': c.numeroCaso,
          'Etapa': c.etapa,
          'Despacho de procedencia':c.despachoProcedencia+'  '+c.nombreEntidadProcedencia,
          'Fiscal Procedencia': c.nombreFiscalProcedencia,
          'F. Elevación': c.fechaElevacion+' '+c.horaElevacion,
          'F. Asignación': c.fechaAsignacion+' '+c.fechaAsignacion,
          'Plazo de pronunciamiento': c.plazoDiasTranscurridos+'/'+c.plazoDiasTotal
        };
        data.push(row);
      });

      tipoExportar === TipoExportarEnum.Pdf
        ? this.exportarService.exportarAPdf(data, headers, "casos_por_recepcionar_superior")
        : this.exportarService.exportarAExcel(data, headers, "casos_por_recepcionar_superior");
    }
  }
  protected eventoRecibirCasos(){
    const casosSeleccionados = `
      <div>
        ${this.casosSeleccionados().map(casofiscal => `<div>${obtenerCasoHtml(casofiscal.numeroCaso)}</div>`).join('')}
      </div>
    `;
    this.modalDialogService.warning(
      'Confirmar recepción de casos',
      '¿Está seguro que desea recibir los siguientes casos?. Por favor confirme esta acción. ' + casosSeleccionados,
      'Si, recibir',true , 'Cancelar'
    ).subscribe({
      next: (resp:CfeDialogRespuesta) => {
        if(resp === CfeDialogRespuesta.Confirmado){
          this.recibirCasos();
        }
      }
    });
  }
  private recibirCasos(){
    const datos:any=[];
    this.casosSeleccionados().forEach(casofiscal => {
      datos.push( {
        idCaso: casofiscal.idCaso,
        numeroCaso: casofiscal.numeroCaso,
        idBandejaElevacion: casofiscal.idBandejaElevacion
      });
    });
    //
    this.asignacionService.recibirCasos(datos).subscribe({
      next: (resp: any) => {
        this.recibirCasosRespuesta(1);
      }, error: (err: any) => {
        this.recibirCasosRespuesta(2, err.error.message);
      }
    });
  }

  /**
   *
   * @param tipo 1:Exito 2:Error
   * @param mensaje
   */
  private recibirCasosRespuesta(tipo:number, mensaje?:string):void{
    const casosSeleccionados = `
        <div>
        ${this.casosSeleccionados().map(casofiscal => `<div>${obtenerCasoHtml(casofiscal.numeroCaso)}</div>`).join('')}
        </div>
    `;
    if(tipo===1){
      //
      this.obtenerDatosCasos(this.datosBusqueda);
      //
      this.modalDialogService.success(
        'Casos recibido correctamente',
        'Se recibieron correctamente los siguientes casos:'+casosSeleccionados,
        'Aceptar'
      );
    }else if(tipo===2){
      this.modalDialogService.error(
        'Casos no recibido',
        'No se recibieron los casos porque ocurrió un error: '+(mensaje??''),
        'Aceptar'
      );
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

  protected casosSeleccionados(){
    return this.listaCasos.filter( (caso)=>caso.seleccionado===true);
  }


  protected startTour(): void {
    setTimeout(() => {
      this.tourService.startTour(this.stepsComponente);
    }, 500);
  }

  private stepsComponente = [
    {
      attachTo: {element: '.tour-a-1', on: 'bottom'},
      title: '1. Casos',
      text: 'Aquí puede ver un caso/cuaderno/pestaña para recepcionar'
    },
    {
      attachTo: {element: '.tour-a-2', on: 'bottom'},
      title: '2. Check',
      text: 'Seleccione el caso para poder recibirlo'
    },
    {
      attachTo: {element: '.tour-a-3', on: 'bottom'},
      title: '3. Recibir',
      text: 'Presione el botón recibir para finalizar el proceso de recepción del/los casos'
    },
    {
      attachTo: {element: '.tour-a-4', on: 'bottom'},
      title: '4. Mas opciones',
      text: 'Haga clic en los tres puntos para mostrar más acciones a realizar sobre el caso/cuaderno/pestaña'
    }
  ];
}
