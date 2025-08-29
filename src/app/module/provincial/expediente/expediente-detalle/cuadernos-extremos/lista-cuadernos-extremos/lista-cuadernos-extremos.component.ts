import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { NuevoCuadernoExtremoComponent } from '../nuevo-cuaderno-extremo/nuevo-cuaderno-extremo.component';
import { TipoVistaEnum } from '@modules/provincial/administracion-casos/consulta-casos/listar-casos/models/listar-casos.model';
import { FiltrarCuadernosExtremosComponent } from './filtrar-cuadernos-extremos/filtrar-cuadernos-extremos.component';
import { PaginacionCondicion, PaginacionConfiguracion, TipoExportar } from '@core/components/consulta-casos/models/listar-casos.model';
import { ExportarService } from '@core/services/shared/exportar.service';
import { GrillaCuadernosExtremosComponent } from './grilla-cuadernos-extremos/grilla-cuadernos-extremos.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { IconAsset, RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib';
import { TablaCuadernosExtremosComponent } from './tabla-cuadernos-extremos/tabla-cuadernos-extremos.component';
import { CuadernosExtremosService } from '@core/services/provincial/cuadernos-extremos/cuadernos-extremos.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
import { CreacionCuadernosExtremosUnificadosComponent } from '../cuadernos-extremos-unificados/creacion-cuadernos-extremos-unificados/creacion-cuadernos-extremos-unificados.component';
import { urlConsultaCuaderno } from '@core/utils/utils';

@Component({
  selector: 'app-lista-cuadernos-extremos',
  templateUrl: './lista-cuadernos-extremos.component.html',
  styleUrl: './lista-cuadernos-extremos.component.scss',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    FiltrarCuadernosExtremosComponent,
    GrillaCuadernosExtremosComponent,
    TablaCuadernosExtremosComponent
  ],
  providers: [DialogService],
})
export class ListaCuadernosExtremosComponent implements OnInit {
  protected tipoVista: TipoVistaEnum = TipoVistaEnum.Grilla;
  private readonly datosRuta: any = {};
  protected datosRutaCondicion: any = {};
  protected listaCasosOriginal: CasoFiscal[]= [];
  protected listaCasos: CasoFiscal[]= [];
  protected crearCuadernoDialogRef!: DynamicDialogRef;
  protected TipoVistaEnum = TipoVistaEnum;
  protected TipoExportarEnum = TipoExportar;
  protected paginacionCondicion: PaginacionCondicion = { limit: 9, page: 1, where: {} };
  protected procesadoCriterioBusqueda:boolean = false;
  protected paginacionReiniciar: boolean = false;
  public caso!: Expediente;
  public paginacionConfiguracion: PaginacionConfiguracion = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  }

  constructor(
    private readonly cuadernosExtremosService: CuadernosExtremosService,
    private readonly exportarService:ExportarService,
    private readonly route: ActivatedRoute,
    private readonly gestionCasoService: GestionCasoService,
    private readonly dialogService: DialogService,
    private readonly router:Router,
    protected iconAsset: IconAsset
  ) {
    this.datosRutaCondicion = this.route.snapshot.data;
  }

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual;
    this.obtenerDatos({...this.datosRuta, filtroTiempo: '0'});
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
  protected eventoTipoVista(e: Event, tipoVista: TipoVistaEnum) {
    e.preventDefault();
    this.tipoVista = tipoVista;
  }
  protected eventoCambiarPagina(datos:PaginacionInterface){
    this.paginacionCondicion.page = datos.page;
    this.paginacionCondicion.limit = datos.limit;
    this.actualizarListaCasosPaginacion(datos.data, datos.resetPage);
  }

  private actualizarListaCasosPaginacion(datos: any, reiniciar: boolean) {
    this.paginacionReiniciar = reiniciar;
    const start = (this.paginacionCondicion.page - 1) * this.paginacionCondicion.limit;
    const end = start + this.paginacionCondicion.limit;
    this.listaCasos = datos.slice(start, end);
  }

  protected eventoCasoSeleccionado(caso:CasoFiscal){
    const ruta = urlConsultaCuaderno(
      'extremo',
      {
      idEtapa: caso.idEtapa!,
      idCaso:caso.idCaso!,
      flgConcluido:caso.flgConcluido?.toString()
    });
    this.router.navigate([`${ruta}/acto-procesal`]);
  }
  protected eventoBuscar(datos:any){
    console.log(datos)
    this.obtenerDatos({...this.datosRuta, ...datos});
  }

  private obtenerDatos(datos:any){
    this.cuadernosExtremosService.listarCuadernosExtremos({...datos,idCasoPadre:this.caso.idCaso}).subscribe({
      next: (rs) => {
        this.listaCasosOriginal = rs.data;
        this.listaCasos = rs.data;
        //
        this.paginacionConfiguracion.data.data = this.listaCasos;
        this.paginacionConfiguracion.data.total = this.listaCasos.length;
        this.actualizarListaCasosPaginacion(this.listaCasos, false);
      }
    });
  }

  protected eventoBuscarPorTexto(bucarValor: string){
    console.log(bucarValor)
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

  protected actualizarListaCuadernos(){
    this.obtenerDatos({...this.datosRuta, filtroTiempo: '0'});
  }

  protected nuevoCuaderno(){
    this.crearCuadernoDialogRef = this.dialogService.open(
      NuevoCuadernoExtremoComponent,
      {
        showHeader: false,
        contentStyle: { padding: '0', 'border-radius': '15px' },
      }
    );

    this.crearCuadernoDialogRef.onClose.subscribe((confirm) => {
      if (confirm === RESPUESTA_MODAL.OK)   
          this.obtenerDatos({...this.datosRuta, filtroTiempo: '0'});
    });
  }


  protected unificado(){
    this.crearCuadernoDialogRef = this.dialogService.open(
      CreacionCuadernosExtremosUnificadosComponent,
      {
        showHeader: false,
        contentStyle: { padding: '0', 'border-radius': '15px' },
      }
    );
  }
}

