import { CommonModule, JsonPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input, OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
import {
  Cabecera,
  CuadernoIncidental,
  DatosArchivo,
  DatosArchivoSeleccionado,
  Etapas,
  RespuestaDocumentos,
} from '@core/interfaces/visor/visor-interface';
import { DateMaskModule } from '@directives/date-mask.module';
import { DateFormatPipe } from '@pipes/format-date.pipe';
import { VisorEfeService } from '@services/visor/visor.service';
import { obtenerIcono } from '@utils/icon';
import { IconAsset } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';

import { TipoArchivo, VisorArchivoComponent } from '../visor-archivo/visor-archivo/visor-archivo.component';
import { EtapasArchivoEnum, ClasificadorDocumentoEnum } from '../visor-efe-modal.component';
import { BotonCargoComponent } from './boton-cargo/boton-cargo.component';
import { ItemArchivoComponent } from './item-archivo/item-archivo.component';
import { VisorStateService } from '@core/services/visor/visor.state.service';
import { ClasificadorExpedienteEnum } from '@core/constants/constants';
import { VisorUtilService } from '@services/visor/visor-util.service';

@Component({
  selector: 'app-carpeta-principal',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TabsViewComponent,
    TabViewModule,
    CalendarModule,
    DateMaskModule,
    InputTextModule,
    PaginatorModule,
    ReactiveFormsModule,
    AccordionModule,
    CmpLibModule,
    CheckboxModule,
    SelectButtonModule,
    DateFormatPipe,
    JsonPipe,
    BotonCargoComponent,
    ItemArchivoComponent
  ],
  templateUrl: './carpeta-principal.component.html',
  styleUrls: ['./carpeta-principal.component.scss'],
})
export class CarpetaPrincipalComponent implements OnInit {

  @Output()
  public datosInicioEmisor = new EventEmitter<Cabecera>();

  @Output()
  public tieneCuadernos = new EventEmitter<boolean>();

  @Output()
  public datosEtapaCuaderno = new EventEmitter<Etapas[]>();

  @Input()
  public idCaso: string = '';
  //
  @ViewChildren('filaArchivoRef', { read: ElementRef })
  protected filaArchivoRef!: QueryList<ElementRef>;
  //
  @ViewChild('inputBuscarRef')
  protected inputBuscarRef!: ElementRef;
  //
  @ViewChild('visorArchivoContainer', { read: ViewContainerRef })
  protected visorArchivoContainerRef!: ViewContainerRef;

  //
  protected EtapasArchivoEnum = EtapasArchivoEnum;
  protected ClasificadorExpedienteEnum = ClasificadorExpedienteEnum;
  protected datoEtapaOriginal: Etapas[] = [];
  protected datoEtapaFiltro: Etapas[] = [];
  protected datoArchivoSeleccionado:DatosArchivo | null = null;
  protected datoArchivo:DatosArchivo[] = [];
  protected datoArchivoActualIndex:number = 0;
  protected datoArchivoSeleccionados:DatosArchivoSeleccionado[] = [];
  protected cantidadResultados = {
    encontrados: 0,
    cuadernosIncidentales: 0,
    cuadernosEjecucion: 0,
  };
  protected tipoDocumentoFiltroSeleccionado: string = '0';
  protected tipoDocumentoFiltro: any[] = [
    { name: 'Todos', value: '0' },
    { name: 'Disposiciones', value: '01' },
    { name: 'Requerimientos', value: '02' },
    { name: 'Genéricos', value: '00' },
  ];
  protected obtenerIcono = obtenerIcono;
  private busquedaTiempo: any = null;
  protected buscarValor: string = '';
  protected visorTipoArchivo: TipoArchivo= TipoArchivo.Ninguno;
  protected TipoArchivo = TipoArchivo;
  protected visor:VisorArchivoComponent | null = null;
  //

  constructor(protected iconAsset:IconAsset,
              private readonly dataService: VisorEfeService,
              private readonly visorUtilService: VisorUtilService,
              private readonly visorStateService: VisorStateService) { }

  ngOnInit() {
    this.dataService.getDatosArchivosCarpetaPrincipal(this.idCaso).subscribe((response: RespuestaDocumentos) => {
      this.datosInicioEmisor.emit(response.data.cabecera);
      this.datoEtapaOriginal = response.data.etapas;
      if(this.datoEtapaOriginal.length>0){
        this.datoEtapaFiltro = [...this.datoEtapaOriginal];
        this.seleccionarArchivoInicio();
        this.buscarCuadernos();
      }
    });

    this.visorStateService.mostrarDocumento$.subscribe({
      next: (datoArchivo:DatosArchivo) => {
          this.eventoSeleccionarArchivo(datoArchivo);
      }
    });

    this.visorStateService.descargarArchivo$.subscribe({
      next: (datoArchivo:DatosArchivo) => {
        this.eventoDescargarArchivo(datoArchivo);
      }
    });

    this.visorStateService.archivoSeleccionado$.subscribe({
      next: (res: {datosArchivo:DatosArchivo, event: CheckboxChangeEvent}) => {
        this.eventoSeleccionarFila(res.datosArchivo, res.event);
      }

    })

  }
  protected eventoSeleccionarArchivo(datosArchivo:DatosArchivo) {
    this.datoArchivoActualIndex = this.datoArchivo.findIndex( elm => elm.correlativo===datosArchivo.correlativo );
    this.seleccionarArchivo(datosArchivo);
  }
  protected colorFondoFilaArchivo( datosArchivo:DatosArchivo) {
    if(this.datoArchivoSeleccionado!==null && this.datoArchivoSeleccionado.correlativo === datosArchivo.correlativo){
      return '#F7EED4';
    }
    return '';
  }
  protected eventoSeleccionarGrupo(cuadernoIncidental:CuadernoIncidental, event: any){
    if (event && event.originalEvent) {
      event.originalEvent.stopPropagation();
    }
    const checked = event.checked;
    cuadernoIncidental.datosArchivo.forEach( elm=>{
      elm.seleccionado = checked;
      this.seleccionarFila(elm, checked);
    });
  }

  private recorrerFuentesInvestigacion(fuentes: DatosArchivo[]): DatosArchivo[] {
    let docs: DatosArchivo[] = [];

    fuentes.forEach(fuente => {
      // Almacenar cada fuente de investigación sin sus fuentes anidadas
      docs.push({ ...fuente, fuenteInvestigacion: [] });

      // Si la fuente tiene más fuentes de investigación anidadas, las recorremos
      if (fuente.fuenteInvestigacion?.length) {
        docs = docs.concat(this.recorrerFuentesInvestigacion(fuente.fuenteInvestigacion));
      }
    });

    return docs;
  }

  protected eventoSeleccionarArchivoAnterior() {
    if (this.datoArchivoActualIndex > 0) {
      this.datoArchivoActualIndex--;
    }else{
      this.datoArchivoActualIndex = this.datoArchivo.length - 1;
    }
    this.seleccionarArchivo(this.datoArchivo[this.datoArchivoActualIndex]);
  }
  protected eventoSeleccionarArchivoSiguiente() {
    if (this.datoArchivoActualIndex < this.datoArchivo.length - 1) {
      this.datoArchivoActualIndex++;
    }else{
      this.datoArchivoActualIndex = 0;
    }
    this.seleccionarArchivo( this.datoArchivo[this.datoArchivoActualIndex] );
  }

  private seleccionarArchivo(doc:DatosArchivo, sinContenido:boolean=false) {
    this.datoArchivoSeleccionado = doc;
    this.visorStateService.archivoSeleccionado = doc;

    //#region - Validar para expandir la sección
    const etapa = this.datoEtapaFiltro.find( elm => elm.id === doc.idEtapa )!;
    etapa.mostrarContenido = true;

    if( doc.idClasificadorExpediente === ClasificadorExpedienteEnum.CuadernoIncidental &&
      etapa.cuadernoIncidental &&
      etapa.cuadernoIncidental.length > 0
    ){
      const cuadernoInci = etapa.cuadernoIncidental.find( elm => elm.idCaso === doc.idCaso )!;
      cuadernoInci.mostrarContenido = true;
      //
      if(doc.codigoClasificador === ClasificadorDocumentoEnum.FuenteInvestigacion){
        const datoArchivo = cuadernoInci.datosArchivo.find(elm => elm.correlativo === doc.correlativoPadre)!;
        datoArchivo.mostrarContenido = true;
      }
    }else if(doc.idClasificadorExpediente === ClasificadorExpedienteEnum.Principal){
      if(doc.codigoClasificador === ClasificadorDocumentoEnum.FuenteInvestigacion){
        const datoArchivo = etapa.datosArchivo.find(elm => elm.correlativo === doc.correlativoPadre)!;
        datoArchivo.mostrarContenido = true;
      }
    }
    //#endregion

    this.posicionarScrollbarListaArchivos(doc.correlativo);
    this.consultarArchivo(doc, sinContenido);
  }
  protected eventoSeleccionarFila(datosArchivo:DatosArchivo, event: any){
    if (event && event.originalEvent) {
      event.originalEvent.stopPropagation();
    }

    if(event.checked===false){
      const etapa = this.datoEtapaFiltro.find( elm => elm.id === datosArchivo.idEtapa )!;
      if(datosArchivo.idClasificadorExpediente === ClasificadorExpedienteEnum.CuadernoIncidental){
        const cuadernoInc = etapa.cuadernoIncidental!.find( elm => elm.idCaso === datosArchivo.idCaso );
        cuadernoInc!.seleccionado = false;
        if(datosArchivo.codigoClasificador === ClasificadorDocumentoEnum.FuenteInvestigacion){
          cuadernoInc!.datosArchivo.find(elm => elm.correlativo === datosArchivo.correlativoPadre)!.seleccionado = false;
        }
      }else if(datosArchivo.idClasificadorExpediente === ClasificadorExpedienteEnum.Principal){
        if(datosArchivo.codigoClasificador === ClasificadorDocumentoEnum.FuenteInvestigacion){
          etapa.datosArchivo.find(elm => elm.correlativo === datosArchivo.correlativoPadre)!.seleccionado = false;
        }
      }
    }

    //Agregar o eliminar archivos seleccionados
    this.seleccionarFila(datosArchivo, event.checked);
  }
  private seleccionarFila(datosArchivo:DatosArchivo, checked:boolean){
    const seleccionadoIndex = this.datoArchivoSeleccionados.findIndex( elm=>elm.correlativo=== datosArchivo.correlativo);

    if(checked === true ){
      if(seleccionadoIndex < 0){
        this.datoArchivoSeleccionados.push({
          idEtapa: datosArchivo.idEtapa,
          correlativo: datosArchivo.correlativo,
          correlativoPadre: datosArchivo.correlativoPadre,
          codigoClasificador: datosArchivo.codigoClasificador,
          idClasificadorExpediente: datosArchivo.idClasificadorExpediente,
          idCaso : datosArchivo.idCaso
        });
      }
    }else{
      if(seleccionadoIndex > -1){
        this.datoArchivoSeleccionados.splice(seleccionadoIndex, 1);
      }
    }
  }

  protected eventoDeseleccionarTodo() {
    this.visorUtilService.eventoDeseleccionarTodo(this.datoArchivoSeleccionados, this.datoEtapaFiltro);
  }

  private posicionarScrollbarListaArchivos(id: number):void {
    if(this.filaArchivoRef===undefined){
      return;
    }
    const selectedElement = this.filaArchivoRef.find((element) => {
      const elId = element.nativeElement.getAttribute('id');
      return elId && elId === 'fila-' + id;
    });

    if (selectedElement) {
      selectedElement.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'start',
      });
    }
  }

  protected eventoBuscarTipoDocumento(seleccionado: any) {
    const tipoSeleccionado = seleccionado.value;
    (this.inputBuscarRef.nativeElement as HTMLInputElement).value = '';
    if(tipoSeleccionado==='0'){
      this.datoEtapaFiltro = [...this.datoEtapaOriginal];
      this.seleccionarArchivoInicio();
      return;
    }
    //
    this.datoEtapaFiltro = this.datoEtapaOriginal.map(elemento => {
      const elementoFiltrado = { ...elemento };
      return this.visorUtilService.filtrarTipoElemento(elementoFiltrado, tipoSeleccionado);
    }).filter(elemento => elemento !== null); // Eliminar elementos que no tienen datos relevantes
    //
    this.seleccionarArchivoInicio();
  }

  private seleccionarArchivoInicio(){
    this.datoArchivo = this.visorUtilService.soloDocumentos(this.datoEtapaFiltro);
    if(this.datoArchivo.length > 0){
     this.seleccionarArchivo( this.datoArchivo[0], false );
    }else{
      this.consultarArchivo( undefined , true);
    }
    //
    // Contar resultados
    const total = this.datoArchivo.length;
    this.cantidadResultados.encontrados =  total;
    //
    this.cantidadResultados.cuadernosIncidentales = this.datoArchivo.filter( elm=> elm.idClasificadorExpediente === ClasificadorExpedienteEnum.CuadernoIncidental).length;
  }

  private buscarCuadernos(): void {
    if (this.datoEtapaFiltro.some(e => e.cuadernoIncidental.length > 0)) {
      this.tieneCuadernos.emit(true);
      const etapasConCuaderno = this.datoEtapaFiltro
        .map(e => ({
          id: e.id,
          nombre: e.nombre,
          mostrarContenido: e.mostrarContenido,
          datosArchivo: [],
          cuadernoIncidental: e.cuadernoIncidental
        }));
      this.datosEtapaCuaderno.emit(etapasConCuaderno);
    }
  }

  protected eventoBuscar(e: Event) {
    clearTimeout(this.busquedaTiempo); //Evitar búsquedas continuas
    const valor = (e.currentTarget as HTMLInputElement).value.toLowerCase();
    if (valor === '') {
      this.datoEtapaFiltro = [...this.datoEtapaOriginal];
      this.seleccionarArchivoInicio();
      return;
    }
    this.busquedaTiempo = setTimeout(() => {
      this.tipoDocumentoFiltroSeleccionado = '0';
      this.buscarXTexto(valor);
    }, 500);
  }

  /**
   * Si los datos aumentan, conciderar usar requestAnimationFrame
   * @param v valor de la búsqueda
   * @returns
   */
  private buscarXTexto(v: string) {
    const esNumero = this.visorUtilService.esNumeroValido(v);
    const numero = esNumero ? Number(v) : null;
    //
    this.datoEtapaFiltro = this.datoEtapaOriginal.map(elemento => {
      const elementoFiltrado = { ...elemento };
      // Filtrar datosArchivo en la raíz del objeto
      if (elementoFiltrado.datosArchivo) {
        elementoFiltrado.datosArchivo = elementoFiltrado.datosArchivo.filter(archivo => {
          const coincideTexto = archivo.nombreTipoDocumento.toLowerCase().includes(v)
            || archivo.nombreActoProcesal?.toLowerCase().includes(v)
            || archivo.nombreTramite?.toLowerCase().includes(v);
          const coincideNumero =
            esNumero && numero && (archivo.folioInicio-1) <= numero && (archivo.folioFin-1) >= numero;
          return coincideTexto || coincideNumero;
        });
      }
      return this.visorUtilService.filtratElemento(elementoFiltrado, v);
    }).filter(elemento => elemento !== null); // Eliminar elementos que no tienen datos relevantes
    //
    this.seleccionarArchivoInicio();
  }

  protected eventoDescargarTodo():void {
    const codigos = this.visorUtilService.codigoArchjosSeleccionados(this.datoArchivoSeleccionados, this.datoArchivo);

    if(codigos!=='' && this.soloPdfSeleccionados()){
      this.dataService.getDescargarPdfTodo(codigos).subscribe({
        next:(rs)=>{
           this.visorUtilService.forzarDescarga(rs, 'todos.pdf');
        }
      });
    }
  }

  protected soloPdfSeleccionados():boolean{
    return this.visorUtilService.soloPdfSeleccionados(this.datoArchivoSeleccionados, this.datoArchivo)
  }


  private async consultarArchivo(datosArchivo:DatosArchivo | undefined, sinArchivo:boolean = false) {
    if(datosArchivo){
      this.visorTipoArchivo=datosArchivo.nombreTipoArchivo.toLowerCase() as TipoArchivo;
    }
    if(this.visor===null){
      const { VisorArchivoComponent } = await import('../visor-archivo/visor-archivo/visor-archivo.component');
      this.visor = this.visorArchivoContainerRef.createComponent(VisorArchivoComponent).instance;
    }
    if(sinArchivo===false && datosArchivo){
      this.visor.inicializar(datosArchivo.nombreTipoArchivo.toLowerCase() as TipoArchivo, this.dataService.getArchivoUrl(datosArchivo.idNode, datosArchivo.nombre),datosArchivo.idNode,datosArchivo.nombre);
    }else{
      this.visor.inicializar(TipoArchivo.Ninguno, "");
    }

  }

  protected eventoDescargarArchivo(datosArchivo:DatosArchivo) {
    this.dataService.getDescargarArchivo(this.visorUtilService.codigoArchivoEnviar(datosArchivo.idNode, datosArchivo.nombre)).subscribe({
      next:(rs:Blob)=>{
          this.visorUtilService.forzarDescarga(rs, datosArchivo.nombre);
      }
    });
  }

  protected descargarArchivosSeleccionados(): void {
    const codigos = this.visorUtilService.codigoArchjosSeleccionados(this.datoArchivoSeleccionados, this.datoArchivo);
    if(codigos!==''){
      this.visorUtilService.descargarArchivosZip( codigos );
    }
  }

}
