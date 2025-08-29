import {CommonModule, DatePipe} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {JwtHelperService} from '@auth0/angular-jwt';
import {PaginatorComponent} from '@core/components/generales/paginator/paginator.component';
import {
  DelitosYPartesModalComponent
} from '@core/components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import {ExportarService} from '@core/services/shared/exportar.service';
import {BandejaFiscaliaSuperiorService} from '@core/services/superior/bandeja/bandeja-fiscalia-superior';
import {
  PrevisualizarDocumentoModalComponent
} from '@core/components/modals/visor-documental-caso-elevado/previsualizar-documento-modal.component';
import {TipoExportarEnum} from '@core/constants/constants';
import {rangoFechaXDefecto} from '@core/utils/date';
import {ElevacionActuadosService} from '@core/services/superior/elevacion-actuados/elevacion-actuados.service';
import {DateMaskModule} from '@directives/date-mask.module';
import {MaestroService} from '@services/shared/maestro.service';
import {
  Constants,
  DateFormatPipe,
  IconAsset,
  IconUtil,
  MathUtil,
  obtenerCasoHtml,
  obtenerFechaDDMMYYYY,
  StringUtil
} from 'ngx-cfng-core-lib';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {MenuItem, MessageService, SelectItem} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {CalendarModule} from 'primeng/calendar';
import {DropdownModule} from 'primeng/dropdown';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {InputTextModule} from 'primeng/inputtext';
import {MenuModule} from 'primeng/menu';
import {ProgressBarModule} from 'primeng/progressbar';
import {RadioButtonModule} from 'primeng/radiobutton';
import {TableModule} from 'primeng/table';
import {Subscription} from 'rxjs';
import {EncabezadoTooltipComponent} from "@components/modals/encabezado-tooltip/encabezado-tooltip.component";
import {NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService} from '@ngx-cfng-core-modal/dialog';
import { LeyendaListasSuperiorComponent } from "../../componentes-comunes/leyenda-listas/leyenda-listas.component";
import { TipoVisor } from '@core/components/modals/visor-documental-caso-elevado/model/visor-documento.model';

@Component({
  selector: 'app-retiro-acusacion',
  standalone: true,
  providers: [MessageService, DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    RadioButtonModule,
    CalendarModule,
    DateMaskModule,
    PaginatorComponent,
    DateFormatPipe,
    TableModule,
    ProgressBarModule,
    MenuModule,
    EncabezadoTooltipComponent,
    NgxCfngCoreModalDialogModule,
    LeyendaListasSuperiorComponent
],
  templateUrl: './retiro-acusacion.component.html',
  styleUrl: './retiro-acusacion.component.scss'
})
export class RetiroAcusacionComponent implements OnInit{

  protected esVisibleFiltros = false;
  protected ordenarPor: SelectItem[] = [
    {label: 'Etapa', value: '1'},
    {label: 'Fiscal', value: '2'},
    {label: 'Fiscalía', value: '3'},
    {label: 'Fecha de elevación', value: '4'},
    {label: 'Plazo de pronunciamiento', value: '5'},
  ];
  protected fmrBuscar!: FormGroup;
  protected paginacionCondicion = { limit: 9, page: 1, where: {} };
  public paginacionConfiguracion:any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
   protected busquedaPorTextoRealizada = false;
  protected TipoExportarEnum = TipoExportarEnum;
  protected listaCasosOriginal:any[] = [];
  protected listaCasos:any[] = [];
  protected obtenerCasoHtml = obtenerCasoHtml;
  protected leyendaClasesCss: { [key: string]: string } = {
    '1': 'dentro-del-plazo',
    '2': 'plazo-por-vencer',
    '3': 'plazo-vencido'
  };
  protected etiquetaClasesCss: { [key: string]: string } = {
    '1': 'bg-teal-100 text-teal-800'
  }
  protected leyenda: any[] = [
    {
      codigo: '1',
      nombre:'Dentro del plazo',
      cantidad: 0,
      clasesCss: this.leyendaClasesCss['1']
    },
    {
      codigo: '2',
      nombre:'Plazo por vencer',
      cantidad: 0,
      clasesCss: this.leyendaClasesCss['2']
    },
    {
      codigo: '3',
      nombre:'Plazo vencido',
      cantidad: 0,
      clasesCss: this.leyendaClasesCss['3']
    }
  ];
  protected tituloTootip: string = "Se mostrará en color:";

  private casoSeleccionado:any;
  public referenciaModal!: DynamicDialogRef;
  protected plazos:SelectItem[] = this.leyenda.map(leyenda => ({label:leyenda.nombre, value:leyenda.codigo}));
  protected fiscaliasPronvinciales: SelectItem[] = [];
  protected despachos: SelectItem[] = [];
  private subscriptions: Subscription[] = [];
  private codDependencia:string;
  protected temporizadorBusqueda: any;
  private tipoVisor: TipoVisor = TipoVisor.AtenderCaso;
  protected opcionesCaso:MenuItem[] =  [
    {
      label: 'Visor documental', command: () => this.eventoVisorDocumental()
    },
    {
      label: 'Atender Caso', command: () => this.eventoAtenderCaso()
    }
  ];


  constructor(
    private fb: FormBuilder,
    private maestrosService: MaestroService,
    private dialogService: DialogService,
    private elevacionActuadosService: ElevacionActuadosService,
    private datePipe: DatePipe,
    protected iconUtil: IconUtil,
    protected iconAsset:IconAsset,
    protected stringUtil:StringUtil,
    protected mathUtil:MathUtil,
    protected bandejaFiscaliaSuperiorService:BandejaFiscaliaSuperiorService,
    private exportarService: ExportarService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {
    const helper = new JwtHelperService();
    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);
    const decodedToken = helper.decodeToken(token.token);
    this.codDependencia = decodedToken.usuario.codDependencia;
  }

  ngOnInit(): void {
    this.crearFormulario();
    this.datosInicio();
    this.datosPorDefecto();
  }

  private eventoVisorDocumental(){
  }
 private eventoAtenderCaso() {
    this.tipoVisor = TipoVisor.AtenderCaso;
    this.elevacionActuadosService.getInformacionDocumental(this.casoSeleccionado.idCaso, this.casoSeleccionado.idTipoElevacion, this.casoSeleccionado.idActoTramiteCaso).subscribe({
      next: (response: any) => {
        if (response.codigoCaso == null) {
          this.modalDialogService.warning("", "No se encontraron datos del caso.");
        } else {
          this.mostrarVisorDocumental(response, this.casoSeleccionado);
          //this.leerCaso(this.casoSeleccionado);
        }
      },
      error: (error) => {
        this.modalDialogService.error(this.casoSeleccionado.codigoCaso, "Hubo un problema al intentar mostrar datos del caso.");
      },
    });
  }
 private mostrarVisorDocumental(informacion: any, caso: any): void {
    this.referenciaModal = this.dialogService.open(PrevisualizarDocumentoModalComponent, {
      width: '95%',
      showHeader: false,
      contentStyle: { 'padding': '0', 'border-radius': '15px' },
      data: {
        informacion: informacion,
        caso: caso,
        tipo: this.tipoVisor
      }
    });
    this.referenciaModal.onClose.subscribe({
      next: (rs) => {
        if (rs?.respuesta === 'completado') {
          this.buscar();
        }
      }
    });
  }
 private buscar() {
    let body = { ...this.fmrBuscar.value };
    body = {
      ...body,
      fechaInicio: body.fechaInicio ? this.datePipe.transform(body.fechaInicio, 'dd/MM/yyyy') : null,
      fechaFin: body.fechaFin ? this.datePipe.transform(body.fechaFin, 'dd/MM/yyyy') : null
    };
    this.obtenerDatosCasos(body);
  }


  //#region Principal
  private datosInicio(){
    this.obtenerFiscaliasXEntidad();
    //
    this.eventoBuscar();
  }

  protected eventoExportar(tipoExportar: TipoExportarEnum): void {
    if (this.listaCasosOriginal.length > 0) {
      const headers = [
        'Número de caso',
        'Etapa',
        'Fiscal',
        'F. Registro',
        'Nombre Despacho',
        'Entidad',
        'Semáforo Nro',
        'Semáforo Tiempo',
        'Plazo',
        'Delitos',
        'Cantidad de Partes',
      ];
      const data: any[] = [];
      this.listaCasosOriginal.forEach((c: any) => {
        const row = {
          'Número de caso': c.codigoCaso,           // Código del caso
          Etapa: c.etapa,                          // Etapa del caso
          Fiscal: c.fiscal,                        // Nombre del fiscal
          'F. Registro': c.fechaIngreso,           // Fecha de ingreso
          'Nombre Despacho': c.nombreDespacho,     // Nombre del despacho
          'Entidad': c.nombreEntidad,              // Nombre de la entidad
          'Semáforo Nro': c.semaforoNro,           // Número de semáforo
          'Semáforo Tiempo': c.semaforoTiempo,     // Tiempo del semáforo
          'Plazo': c.plazo,                        // Estado del plazo
          'Delitos': c.delitos,                    // Delitos
          'Cantidad de Partes': c.cantidadPartes   // Cantidad de partes en el caso
        };
        data.push(row);
      });

      tipoExportar === TipoExportarEnum.Pdf
        ? this.exportarService.exportarAPdf(data, headers, 'bandeja_casos_acusación')
        : this.exportarService.exportarAExcel(data, headers, 'bandeja_casos_acusación');
    }
  }

  protected eventoBuscarSegunTexto():void {
    clearTimeout(this.temporizadorBusqueda);
    this.temporizadorBusqueda = setTimeout(() => {
      if (this.listaCasosOriginal.length > 0) {
        this.busquedaPorTextoRealizada = true;
      }
      const buscado = this.fmrBuscar.get('buscar')!.value;
      this.buscarPorTexto(buscado);
    }, 400);
  }
  private buscarPorTexto(bucarValor:string){
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
    this.paginacionConfiguracion.data.data = this.listaCasos;
    this.paginacionConfiguracion.data.total = this.listaCasos.length;
    this.actualizarListaCasosPaginacion(this.listaCasos, true);
  }

  protected eventoMostrarOcultarFiltros(): void {
    this.esVisibleFiltros = !this.esVisibleFiltros;
  }

  protected eventoCambiarFiscaliaProvincial(item: any) {
    this.obtenerDespachosXFiscalia(item.value);
  }

  private datosPorDefecto():void{
    const fechaRango = rangoFechaXDefecto();
    this.fmrBuscar.patchValue({
      filtroTiempo: '0',
      tipoFecha: '0',
      fechaInicio: fechaRango.inicio,
      fechaFin: fechaRango.fin
    });
  }
  //#endregion

  //#region  Eventos de Acciones Principales
  protected eventoLimpiar() {
    this.fmrBuscar.reset();
    this.datosPorDefecto();
  }

  protected eventoBuscar() {
    let body = { ...this.fmrBuscar.value };
    body = {
      ...body,
      fechaInicio: body.fechaInicio ? this.datePipe.transform(body.fechaInicio, 'dd/MM/yyyy'): null,
      fechaFin: body.fechaFin ? this.datePipe.transform(body.fechaFin, 'dd/MM/yyyy'): null
    };
    this.obtenerDatosCasos(body);
  }
  //#endregion

  //#region Eventos para consultar los datos a de los servicios

  public eventoCambiarFiltroTiempo(filtroTiempo: any) {
    this.fmrBuscar.get('buscar')!.setValue('');
    let fechaRango = rangoFechaXDefecto(1);
    if(filtroTiempo==='1')
      fechaRango = rangoFechaXDefecto(6);
    else if(filtroTiempo==='2')
      fechaRango = rangoFechaXDefecto(1000);
    this.obtenerDatosCasos({
      tipoFecha:'0',
      fechaInicio: obtenerFechaDDMMYYYY( fechaRango.inicio ),
      fechaFin: obtenerFechaDDMMYYYY( fechaRango.fin )
    });
  }

  private contarPlazos(caso:any){
    //
    const id = +caso.semaforoNro;
    if(id===1){
      this.leyenda[0].cantidad++;
    }else if(id===2){
      this.leyenda[1].cantidad++;
    }else if(id===3){
      this.leyenda[2].cantidad++;
    }
  }

  private obtenerDatosCasos(datos:any){
    //
    this.leyenda[0].cantidad = 0;
    this.leyenda[1].cantidad = 0;
    this.leyenda[2].cantidad = 0;
    //
    this.bandejaFiscaliaSuperiorService.obtenerRetiroAcusacion(datos).subscribe({
      next: (resp: any) => {
        console.log(resp)
        this.listaCasos = resp;
        this.listaCasosOriginal = resp;
        this.paginacionConfiguracion.data.data = this.listaCasos;
        this.paginacionConfiguracion.data.total = this.listaCasos.length;
        this.actualizarListaCasosPaginacion(this.listaCasos, false);
        //
        this.listaCasosOriginal.forEach(caso=>{
          this.contarPlazos(caso);
      });
      }
    });
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

  protected eventoOpcionesFila(e:Event, menu:any, datos:any){
    this.casoSeleccionado = datos;
    menu.toggle(e);
  }

  private crearFormulario(): void {
    const fechaRango = rangoFechaXDefecto();
    this.fmrBuscar = this.fb.group({
      buscar: [""],
      filtroTiempo: ['0'],
      tipoFecha: ['0'],
      fechaInicio: [fechaRango.inicio],
      fechaFin: [fechaRango.fin],
      tipoOrderBy: [null],
      fiscaliaProvincial:[null],
      despacho:[null],
      plazos:[null],
      etapa: [null],
      actoProcesal: [null]
    });
  }

  private obtenerFiscaliasXEntidad() {
    this.subscriptions.push(
      this.maestrosService.obtenerFiscaliasXEntidad(this.codDependencia).subscribe({
        next: (resp) => {
          this.fiscaliasPronvinciales = resp.data.map((item: { id: any; nombre: any }) => ({
            value: item.id,
            label: item.nombre
          }));
        },
        error: () => {
        },
      })
    );
  }

  private obtenerDespachosXFiscalia(codigoEntidad: string) {
    this.subscriptions.push(
      this.maestrosService.listarDespacho(codigoEntidad).subscribe({
        next: (resp) => {
          this.despachos = resp.map((item: { id: any; nombre: any }) => ({value: item.id, label: item.nombre}));
        },
        error: () => {
        },
      })
    );
  }

  //#endregion

  protected eventoVerDelitosPartes(e:Event,caso: any) {
    e.stopPropagation();
    this.dialogService.open(DelitosYPartesModalComponent, {
      showHeader: false,
      data: {
        numeroCaso: caso.codigoCaso
      }
    });
  }

}
